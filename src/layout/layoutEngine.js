/**
 * Layout engine — "Orbital-Subway" coordinate model
 *
 * Planets are arranged left-to-right along the ecliptic line, spaced so that
 * no two planet SOI circles ever overlap:
 *
 *   currentX += soiRadius(prev) + PLANET_GAP_MIN + soiRadius(next)
 *
 * Moons are stacked vertically above their parent on concentric rings:
 *
 *   moonY = parentY - (MOON_ORBIT_BASE + moonIndex * MOON_ORBIT_STEP)
 *
 * This gives the map its distinctive "subway stop" aesthetic while preserving
 * the correct inner→outer ordering from left-to-right / bottom-to-top.
 *
 * Departure ellipses (LKO escape, Jool capture, etc.) are vertical ellipses
 * whose periapsis sits at the low-orbit ring and whose apoapsis aligns with
 * the SOI intercept diamond.  Their geometry is derived in computeLayout().
 *
 * Hohmann transfer arcs (planet LO → moon SOI) use a similar vertical ellipse
 * whose semi-major axis spans from the planet's LO ring to the moon orbit ring.
 */
import { bodies, planetOrder, NODE_TYPES, nodeId } from '../data/systemData';

const ECLIPTIC_Y = 450;
const KERBOL_X = 0;
const FIRST_PLANET_X = 220;
const MOON_ORBIT_BASE = 60;     // first moon orbit radius from parent center
const MOON_ORBIT_STEP = 60;     // increment per additional moon
const SOI_BUFFER = 30;          // extra radius beyond outermost moon for planet SOI
const SOI_MIN = 32;             // minimum SOI display radius for moonless planets
const MOON_SOI_EXTRA = 7;       // extra beyond LO ring for moon SOI display
const LOW_ORBIT_RING_OFFSET = 8;
const PLANET_GAP_MIN = 45;      // minimum pixel gap between adjacent SOI edges
const ELLIPTICAL_PLANETS = new Set(['kerbin', 'duna', 'eve', 'jool']);

// Compute SOI display radius for a planet
function planetSoiDisplayR(planetId) {
  const body = bodies[planetId];
  if (!body.moons || body.moons.length === 0) return SOI_MIN;
  const outermostOrbit = MOON_ORBIT_BASE + (body.moons.length - 1) * MOON_ORBIT_STEP;
  return outermostOrbit + SOI_BUFFER;
}

// Compute SOI display radius for a moon
function moonSoiDisplayR(moonId) {
  return getLowOrbitRadius(moonId) + MOON_SOI_EXTRA;
}

export function computeLayout() {
  const positions = {};       // nodeId -> { x, y }
  const bodyPositions = {};   // bodyId -> { x, y }
  const moonOrbitRings = [];  // [{ parentId, moonId, cx, cy, r }]
  const soiCircles = {};      // bodyId -> { cx, cy, r }
  const ellipticalOrbits = {}; // bodyId -> { cx, cy, rx, ry }
  const hohmannTransfers = {}; // bodyId -> { cx, cy, rx, ry }

  // Position Kerbol
  bodyPositions.kerbol = { x: KERBOL_X, y: ECLIPTIC_Y };

  // Pre-compute SOI radii for spacing calculation
  const soiRadii = {};
  for (const pid of planetOrder) {
    soiRadii[pid] = planetSoiDisplayR(pid);
  }

  // Position planets along ecliptic with dynamic spacing
  let currentX = FIRST_PLANET_X;
  planetOrder.forEach((planetId, index) => {
    if (index > 0) {
      const prevId = planetOrder[index - 1];
      currentX += soiRadii[prevId] + PLANET_GAP_MIN + soiRadii[planetId];
    }
    const x = currentX;
    const y = ECLIPTIC_Y;
    bodyPositions[planetId] = { x, y };

    const pSoiR = soiRadii[planetId]; // holds planet's SOI display radius

    // Node positions
    positions[nodeId(planetId, NODE_TYPES.SURFACE)] = { x, y };
    positions[nodeId(planetId, NODE_TYPES.LOW_ORBIT)] = { x, y };
    // Planet SOI_INTERCEPT: at the bottom of the SOI circle
    positions[nodeId(planetId, NODE_TYPES.SOI_INTERCEPT)] = { x, y: y + pSoiR };
    positions[nodeId(planetId, NODE_TYPES.ELLIPTICAL_ORBIT)] = { x, y: y + pSoiR };

    // SOI circle for this planet
    soiCircles[planetId] = { cx: x, cy: y, r: pSoiR };

    // Departure / arrival ellipse geometry (Low Orbit ↔ SOI intercept)
    //
    // We model the Hohmann escape burn as a vertical ellipse:
    //   - Periapsis (top of ellipse)  : the low-orbit ring radius (loR) above center
    //   - Apoapsis  (bottom of ellipse): the SOI display radius (pSoiR) below center
    //
    // Semi-major axis ry and center offset:
    //   ry     = (pSoiR + loR) / 2          — half the span between periapsis and apoapsis
    //   cyEll  = y + (pSoiR - loR) / 2      — shift center down so apoapsis == SOI marker y
    //
    // Semi-minor axis rx is kept proportional to loR so the ellipse looks tall
    // rather than circular:
    //   rx = loR + (ry - loR) / 2
    const loR = getLowOrbitRadius(planetId);
    const ry = (pSoiR + loR) / 2;
    const cyEll = y + (pSoiR - loR) / 2;
    const rx = loR + (ry - loR) / 2;
    ellipticalOrbits[planetId] = { cx: x, cy: cyEll, rx, ry };

    // Position moons: sorted by semiMajorAxis, stacked vertically above parent
    const body = bodies[planetId];
    if (body.moons && body.moons.length > 0) {
      // Sort moons by semiMajorAxis (closest first)
      const sortedMoons = [...body.moons].sort(
        (a, b) => bodies[a].semiMajorAxis - bodies[b].semiMajorAxis
      );

      sortedMoons.forEach((moonId, mIdx) => {
        const orbitR = MOON_ORBIT_BASE + mIdx * MOON_ORBIT_STEP;
        // Moon sits directly above parent (angle = -PI/2, i.e. top of ring)
        const mx = x;
        const my = y - orbitR;

        bodyPositions[moonId] = { x: mx, y: my };
        positions[nodeId(moonId, NODE_TYPES.SURFACE)] = { x: mx, y: my };
        positions[nodeId(moonId, NODE_TYPES.LOW_ORBIT)] = { x: mx, y: my };

        // Moon SOI_INTERCEPT: at the right of the moon's SOI (toward parent)
        const mSoiR = moonSoiDisplayR(moonId);
        positions[nodeId(moonId, NODE_TYPES.SOI_INTERCEPT)] = { x: mx + mSoiR, y: my };

        // Moon orbit ring (concentric around parent)
        moonOrbitRings.push({ parentId: planetId, moonId, cx: x, cy: y, r: orbitR });

        // Moon SOI circle
        soiCircles[moonId] = { cx: mx, cy: my, r: mSoiR };


        // Hohmann transfer ellipse geometry (planet LO → moon SOI)
        //
        // This vertical ellipse represents the transfer orbit from a planet's
        // low-orbit ring up to the moon's SOI.  The geometry mirrors the
        // departure ellipse above, but spans the moon's orbit instead of the
        // planet's SOI:
        //
        //   ht_ry  = (orbitR + planetLoR + moonLoR) / 2
        //              — semi-major axis, centre of the span
        //   ht_rx  = planetLoR + (orbitR - planetLoR) / 4
        //              — narrow semi-minor axis so the arc looks like an orbit
        //   ht_y   = parentY − (ht_ry − planetLoR)
        //              — centre shifted up so the bottom of the ellipse sits
        //                 at the planet's LO ring level
        const ht_ry = (orbitR + getLowOrbitRadius(planetId) + getLowOrbitRadius(moonId)) / 2;
        const ht_rx = getLowOrbitRadius(planetId) + ((orbitR - getLowOrbitRadius(planetId)) / 4);
        const ht_y  = y - (ht_ry - getLowOrbitRadius(planetId));

        // Add ellipse to hohmannTransfers keyed as "planetId:moonId"
        const htId = nodeId(planetId, moonId);
        hohmannTransfers[htId] = { cx: x, cy: ht_y, rx: ht_rx, ry: ht_ry };
      });
    }
  });

  return { positions, bodyPositions, moonOrbitRings, soiCircles, ellipticalOrbits, hohmannTransfers };
}

export function getBodyDisplayRadius(bodyId) {
  const body = bodies[bodyId];
  if (!body) return 5;
  return body.displayRadius || 5;
}

export function getLowOrbitRadius(bodyId) {
  return getBodyDisplayRadius(bodyId) + LOW_ORBIT_RING_OFFSET;
}

export { ECLIPTIC_Y, KERBOL_X };

/**
 * Pre-computed layout for the Kerbol system.
 *
 * Exported as a module-level singleton so every consumer shares a single
 * computation.  Call `computeLayout()` directly if you need a fresh layout
 * for a different dataset (e.g., Sol system, Outer Planets Mod).
 */
export const layout = computeLayout();
