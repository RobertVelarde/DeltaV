// Layout engine: planets on X-axis, moons stacked vertically on concentric rings
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

    // SOI circle for this planet
    soiCircles[planetId] = { cx: x, cy: y, r: pSoiR };

    // Optional vertical elliptical orbit from Low Orbit to SOI edge
    // Periapsis at low-orbit radius, apoapsis at SOI edge; center placed
    // below the planet so the bottom-most point (apoapsis) aligns with SOI marker.
    if (ELLIPTICAL_PLANETS.has(planetId)) {
      const loR = getLowOrbitRadius(planetId);
      const ry = (pSoiR + loR) / 2;
      const cyEll = y + (pSoiR - loR) / 2;
      // horizontal radius: keep it proportional to low-orbit so ellipse looks tall
      const rx = ry / 2;
      ellipticalOrbits[planetId] = { cx: x, cy: cyEll, rx, ry };
    }

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

        // Moon SOI_INTERCEPT: at the bottom of the moon's SOI (toward parent)
        const mSoiR = moonSoiDisplayR(moonId);
        positions[nodeId(moonId, NODE_TYPES.SOI_INTERCEPT)] = { x: mx, y: my + mSoiR };

        // Moon orbit ring (concentric around parent)
        moonOrbitRings.push({ parentId: planetId, moonId, cx: x, cy: y, r: orbitR });

        // Moon SOI circle
        soiCircles[moonId] = { cx: mx, cy: my, r: mSoiR };
      });
    }
  });

  return { positions, bodyPositions, moonOrbitRings, soiCircles, ellipticalOrbits };
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
