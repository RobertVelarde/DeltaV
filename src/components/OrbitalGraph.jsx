import { useState, useRef, useCallback } from 'react';
import { bodies, planetOrder, edges, nodeId, parseNodeId, NODE_TYPES, getNodeLabel } from '../data/systemData';
import { layout, getBodyDisplayRadius, getLowOrbitRadius, ECLIPTIC_Y, KERBOL_X } from '../layout/layoutEngine';
import { edgeId } from '../utils/pathfinding';

import MissionPanel from './MissionPanel';
import { useOrbitalState } from '../hooks/useOrbitalState';
import { COLORS, STROKES, FONT, FILTERS } from '../utils/theme';

const { positions, bodyPositions, moonOrbitRings, soiCircles, ellipticalOrbits, hohmannTransfers } = layout;

// ── CRT configuration ─────────────────────────────────────────────────────
// All knobs in one place. Set `enabled: false` to turn the whole effect off.
const CRT = {
  enabled:          true,
  // Scanlines
  scanlineOpacity:  0.25,   // 0–1  darkness of each scanline stripe
  scanlineSpacing:  3,      // px  height of one scanline period (line + gap)
  // Vignette (edge darkening)
  vignetteStrength: 0.1,   // 0–1  0 = none, 1 = very dark corners
  // Screen flicker
  flicker:          false,   // animate subtle brightness variation
  flickerDuration:  '10s',   // one full flicker cycle
  // Film grain / noise
  grain:            false,
  grainOpacity:     0,   // 0–1  grain intensity
  grainDuration:    '0.3s', // grain animation step speed
  // Chromatic aberration (RGB channel offset on the map SVG)
  rgbShift:         1,    // px  0 = off; affects the SVG only
  // Horizontal curvature illusion via box-shadow inset
  innerGlowColor:   'rgba(120, 158, 150, 0.03)',
};

// SVG path for a diamond centered at (0,0), size s
function diamondPath(s) {
  return `M 0 ${-s} L ${s} 0 L 0 ${s} L ${-s} 0 Z`;
}

// SVG path for a plane-change triangle centered at (0,0), size s
function trianglePath(s) {
  const h = s * 0.866; // sqrt(3)/2
  return `M 0 ${-s} L ${h} ${s * 0.5} L ${-h} ${s * 0.5} Z`;
}

// Deterministic starfield
function generateStars(count, seed) {
  const stars = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 16807) % 2147483647;
    const x = (s % 4000) - 500;
    s = (s * 16807) % 2147483647;
    const y = (s % 2000) - 500;
    s = (s * 16807) % 2147483647;
    const r = (s % 100) / 100 * 1.2 + 0.2;
    s = (s * 16807) % 2147483647;
    const opacity = (s % 100) / 100 * 0.6 + 0.1;
    stars.push({ x, y, r, opacity });
  }
  return stars;
}

const STARS = generateStars(500, 42);

// Ecliptic line end X: find rightmost planet + padding
const eclipticEndX = Math.max(...planetOrder.map(id => bodyPositions[id]?.x || 0)) + 200;

export default function OrbitalGraph() {
  const svgRef = useRef(null);
  const [transform, setTransform] = useState({ x: -50, y: -100, scale: 0.85 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState(null);

  // All graph interaction state (selection, pathfinding, highlight derivations)
  const {
    startNode, endNode, mission, pathEdges,
    nodesOnPath, ellipseClipSide, visibleHohmann, hohmannClipSide, lowOrbitHighlight,
    handleNodeClick, clearSelection, nodeStatus, nodeColor,
  } = useOrbitalState();

  // Pan
  const handleMouseDown = useCallback((e) => {
    if (e.target === svgRef.current || e.target.tagName === 'rect' || e.target.classList?.contains('bg-layer')) {
      setDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  }, [transform]);
  const handleMouseMove = useCallback((e) => {
    if (dragging) setTransform(t => ({ ...t, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
  }, [dragging, dragStart]);
  const handleMouseUp = useCallback(() => setDragging(false), []);

  // Zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => {
      const ns = Math.max(0.3, Math.min(3, t.scale * factor));
      const rect = svgRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const r = ns / t.scale;
      return { x: mx - (mx - t.x) * r, y: my - (my - t.y) * r, scale: ns };
    });
  }, []);

  const handleHover = useCallback((nid, event) => {
    if (nid) {
      const { bodyId, nodeType } = parseNodeId(nid);
      const body = bodies[bodyId];
      let text = getNodeLabel(nid);
      if (nodeType === NODE_TYPES.LOW_ORBIT && body) {
        text += `\nAltitude: ${body.lowOrbit}km`;
        if (body.atmosphere > 0) text += `\nAtmosphere: ${body.atmosphere}km`;
      }
      if (nodeType === NODE_TYPES.SURFACE && body) {
        text += `\nRadius: ${body.radius}km`;
        // Calculate g equivalent (1g = 9.81 m/s²)
        text += `\nGravity: ${body.gravity} m/s\u00B2 (${(body.gravity / 9.81).toFixed(2)} g)`;
      }
      if (nodeType === NODE_TYPES.SOI_INTERCEPT && body && body.soiRadius) {
        text += `\nSOI Radius: ${body.soiRadius.toLocaleString()}km`;
      }
      setTooltip({ text, x: event.clientX, y: event.clientY });
    } else {
      setTooltip(null);
    }
  }, []);

  /**
   * Reusable interactive circle: a visible ring + an oversized transparent hit area.
   * @param {number}  cx    - SVG centre X
   * @param {number}  cy    - SVG centre Y
   * @param {number}  r     - Ring radius
   * @param {string}  nid   - Node ID (e.g. 'kerbin:LOW_ORBIT')
   * @param {string}  color - Body color for the default state
   * @param {number}  sw    - Stroke width
   * @param {number}  op    - Base opacity
   * @param {string}  [dash] - SVG strokeDasharray value
   */
  const InteractiveRing = ({ cx, cy, r, nid, color, sw, op, dash }) => {
    const st = nodeStatus(nid);
    const c = nodeColor(st, color);

    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={c} strokeWidth={st !== 'default' ? sw + 1 : sw}
          strokeDasharray={dash || 'none'}
          opacity={st !== 'default' ? 1 : op}
          role="button"
          aria-label={getNodeLabel(nid)}
          style={{ cursor: 'pointer', filter: st !== 'default' ? FILTERS.glow : 'none' }}
          onClick={() => handleNodeClick(nid)}
          onMouseEnter={(e) => handleHover(nid, e.nativeEvent)}
          onMouseLeave={() => handleHover(null)}
        />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="transparent"
          strokeWidth={Math.max(8, sw + 6)}
          role="button"
          aria-label={getNodeLabel(nid)}
          style={{ cursor: 'pointer' }}
          onClick={() => handleNodeClick(nid)}
          onMouseEnter={(e) => handleHover(nid, e.nativeEvent)}
          onMouseLeave={() => handleHover(null)}
        />
      </g>
    );
  };

  /**
   * Reusable diamond marker for SOI intercept nodes.
   * @param {number} cx    - SVG centre X
   * @param {number} cy    - SVG centre Y
   * @param {number} size  - Half-width of the diamond
   * @param {string} nid   - Node ID (e.g. 'kerbin:SOI_INTERCEPT')
   * @param {string} color - Body color for the default state
   */
  const Diamond = ({ cx, cy, size, nid, color }) => {
    const st = nodeStatus(nid);
    const c = nodeColor(st, color);
    return (
      <g>
        <path
          d={diamondPath(size)}
          transform={`translate(${cx},${cy})`}
          fill={st !== 'default' ? c : 'none'}
          fillOpacity={st !== 'default' ? 0.3 : 0}
          stroke={c}
          strokeWidth={st !== 'default' ? 2 : 1.2}
          role="button"
          aria-label={getNodeLabel(nid)}
          style={{ cursor: 'pointer', filter: st !== 'default' ? FILTERS.glow : 'none' }}
          onClick={() => handleNodeClick(nid)}
          onMouseEnter={(e) => handleHover(nid, e.nativeEvent)}
          onMouseLeave={() => handleHover(null)}
        />
        <circle cx={cx} cy={cy} r={size + 4} fill="transparent" stroke="transparent"
          role="button"
          aria-label={getNodeLabel(nid)}
          style={{ cursor: 'pointer' }}
          onClick={() => handleNodeClick(nid)}
          onMouseEnter={(e) => handleHover(nid, e.nativeEvent)}
          onMouseLeave={() => handleHover(null)}
        />
      </g>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: COLORS.background }}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          cursor: dragging ? 'grabbing' : 'grab',
          filter: CRT.enabled && CRT.rgbShift > 0 ? 'url(#crt-rgb)' : undefined,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          {/* CRT chromatic aberration filter — splits R channel left, B channel right */}
          {CRT.enabled && CRT.rgbShift > 0 && (
            <filter id="crt-rgb" x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
              <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
              <feOffset in="r" dx={-CRT.rgbShift} dy={-CRT.rgbShift} result="rShift" />
              <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gShift" />
              <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
              <feOffset in="b" dx={CRT.rgbShift} dy={CRT.rgbShift} result="bShift" />
              <feBlend in="rShift" in2="gShift" mode="screen" result="rg" />
              <feBlend in="rg" in2="bShift" mode="screen" />
            </filter>
          )}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="kerbol-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffdd44" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffaa00" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
          </radialGradient>
          {/* Dynamic clip paths for partially-rendered ellipses */}
          {Object.entries(ellipseClipSide).map(([bodyId, side]) => {
            const ell = ellipticalOrbits[bodyId];
            if (!ell) return null;
            const clipId = `clip-${bodyId}`;
            // For 'right' we need a rect starting at cx, width rx (right half)
            // For 'left' we need a rect starting at cx - rx, width rx (left half)
            const pad = STROKES.ellipse / 2;
            const x = side === 'right' ? ell.cx : (ell.cx - ell.rx - pad);
            return (
              <clipPath id={clipId} key={clipId}>
                <rect x={x} y={ell.cy - ell.ry - pad} width={ell.rx + pad} height={2 * ell.ry + STROKES.ellipse} />
              </clipPath>
            );
          })}
          {Object.entries(hohmannClipSide).map(([htKey, side]) => {
            const parts = htKey.split(':');
            if (parts.length !== 2) return null;
            const [planetId, moonId] = parts;
            const ht = hohmannTransfers[htKey];
            if (!ht) return null;
            const id = `ht-clip-${planetId}-${moonId}`;
            const pad = STROKES.ellipse / 2;
            const x = side === 'right' ? ht.cx : (ht.cx - ht.rx - pad);
            return (
              <clipPath id={id} key={id}>
                <rect x={x} y={ht.cy - ht.ry - pad} width={ht.rx + pad} height={2 * ht.ry + STROKES.ellipse} />
              </clipPath>
            );
          })}
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Background click target */}
          <rect className="bg-layer" x="-2000" y="-2000" width="8000" height="8000" fill="transparent" />

          {/* Starfield */}
          {STARS.map((star, i) => (
            <circle key={`s${i}`} cx={star.x} cy={star.y} r={star.r} fill={COLORS.star} opacity={star.opacity} />
          ))}

          {/* Ecliptic line */}
          <line x1={KERBOL_X - 30} y1={ECLIPTIC_Y} x2={eclipticEndX} y2={ECLIPTIC_Y}
            stroke={COLORS.ecliptic} strokeWidth="1" strokeDasharray="8,4" />
          <text x={KERBOL_X - 25} y={ECLIPTIC_Y + 4} fill={COLORS.ecliptic} fontSize={FONT.sizeEclipticLabel}
            fontFamily={FONT.mono}>ECLIPTIC</text>

          {/* === LAYER 1: SOI dashed circles === */}
          {Object.entries(soiCircles).map(([bodyId, soi]) => {
            const body = bodies[bodyId];
            return (
              <circle key={`soi-${bodyId}`}
                cx={soi.cx} cy={soi.cy} r={soi.r}
                fill="none" stroke={body?.color || COLORS.nodeDefault}
                strokeWidth={STROKES.soiCircle} strokeDasharray="4,2"
                opacity="0.2"
              />
            );
          })}

          {/* === LAYER 2: Moon orbit rings (concentric, centered on parent, same color as moon) === */}
          {moonOrbitRings.map((ring) => {
            return (
              <circle key={`ring-${ring.moonId}`}
                cx={ring.cx} cy={ring.cy} r={ring.r}
                fill="none" stroke={bodies[ring.moonId]?.color || COLORS.nodeDefault}
                strokeWidth={STROKES.moonOrbitRing} strokeDasharray=""
                opacity="0.18"
              />
            );
          })}

          {/* === LAYER 3: Interplanetary transfer lines === */}
          {edges.map((edge, i) => {
            const fromPos = positions[edge.from];
            const toPos = positions[edge.to];
            if (!fromPos || !toPos) return null;
            if (!pathEdges.has(edgeId(edge.from, edge.to))) return null;

            const toNodeType = parseNodeId(edge.to).nodeType;
            const fromNodeType = parseNodeId(edge.from).nodeType;

            // Edges going from one planet to another
            let firstBody = bodies[parseNodeId(edge.from).bodyId];
            let secondBody = bodies[parseNodeId(edge.to).bodyId];
            while (firstBody.parent !== null && bodies[firstBody.parent].parent !== null) firstBody = bodies[firstBody.parent];
            while (secondBody.parent !== null && bodies[secondBody.parent].parent !== null) secondBody = bodies[secondBody.parent];
            if (firstBody !== secondBody) {
              const mx = (fromPos.x + toPos.x) / 2;
              const my = (fromPos.y + toPos.y) / 2;
              const dx = toPos.x - fromPos.x;
              const dy = toPos.y - fromPos.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              // Perpendicular normal — flip so label always sits on the upward side
              const nx = dist > 0 ? -dy / dist : 0;
              const ny = dist > 0 ?  dx / dist : 0;
              const flip = ny > 0 ? -1 : 1;
              const lx = mx + nx * flip * 12;
              const ly = my + ny * flip * 12;

              let offset = 0

              // if this edge goes to the surface set the offset to just above the low-orbit
              if (toNodeType === NODE_TYPES.SURFACE || fromNodeType === NODE_TYPES.SURFACE) {
                const bodyId = parseNodeId(edge.to).bodyId;
                offset = getLowOrbitRadius(bodyId) + 10;
              }

              return (
                <g key={`ipt-${i}`} style={{ pointerEvents: 'none' }}>
                  <line x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y}
                    stroke={COLORS.arcPath} strokeWidth={STROKES.arcPath}
                    strokeDasharray={edge.aerobrake ? '5,3' : 'none'}
                    filter={FILTERS.glow} />
                  <text x={lx} y={ly-offset} textAnchor="middle" dominantBaseline="middle"
                    fill={COLORS.arcPath} fontSize={9} fontFamily={FONT.mono} fontWeight="bold">
                    {edge.deltaV.toLocaleString()} m/s
                  </text>
                </g>
              );
            }

            const textOffset = 10;

            // Handle Launches and Landings from any bosy
            // Places label below the body
            if (fromNodeType === NODE_TYPES.SURFACE || toNodeType === NODE_TYPES.SURFACE) {
              const lowOrbitRadius = getLowOrbitRadius(parseNodeId(fromNodeType === NODE_TYPES.SURFACE ? edge.from : edge.to).bodyId);
              return (
                <g key={`ipt-${i}`} style={{ pointerEvents: 'none' }}>
                  <text x={toPos.x} y={toPos.y + (lowOrbitRadius + textOffset)} textAnchor="middle" dominantBaseline="middle"
                    fill={COLORS.arcPath} fontSize={9} fontFamily={FONT.mono} fontWeight="bold">
                    {edge.deltaV.toLocaleString()} m/s
                  </text>
                </g>
              );
            }

            // Handles SOI intercepts to low orbit transitions for moons only (not planets)
            if (bodies[parseNodeId(edge.from).bodyId] === bodies[parseNodeId(edge.to).bodyId]
                && ((fromNodeType === NODE_TYPES.SOI_INTERCEPT && toNodeType === NODE_TYPES.LOW_ORBIT) ||
                 (fromNodeType === NODE_TYPES.LOW_ORBIT && toNodeType === NODE_TYPES.SOI_INTERCEPT))) {

              // Verify that we are a moon
              const fromBodyId = parseNodeId(edge.from).bodyId;
              const toBodyId = parseNodeId(edge.to).bodyId;
              if (!bodies[fromBodyId].isMoon && !bodies[toBodyId].isMoon) return null;

              let labelX = toNodeType === NODE_TYPES.LOW_ORBIT ? toPos.x : fromPos.x;
              let labelY = toNodeType === NODE_TYPES.LOW_ORBIT ? toPos.y : fromPos.y;
              const lowOrbitRadius = getLowOrbitRadius(parseNodeId(toNodeType === NODE_TYPES.LOW_ORBIT ? edge.to : edge.from).bodyId);
              
              return (
                <g key={`ipt-${i}`} style={{ pointerEvents: 'none' }}>
                  <text x={labelX} y={labelY - (lowOrbitRadius + textOffset)} textAnchor="middle" dominantBaseline="middle"
                    fill={COLORS.arcPath} fontSize={9} fontFamily={FONT.mono} fontWeight="bold">
                    {edge.deltaV.toLocaleString()} m/s
                  </text>
                </g>
              );
            }
          })}

          {/* === LAYER 4: Kerbol === */}
          <g>
            <circle cx={bodyPositions.kerbol.x} cy={bodyPositions.kerbol.y} r={50}
              fill="url(#kerbol-glow)" />
            <circle cx={bodyPositions.kerbol.x} cy={bodyPositions.kerbol.y}
              r={bodies.kerbol.displayRadius} fill={bodies.kerbol.color}
              filter={FILTERS.glowStrong} />
            <text x={bodyPositions.kerbol.x} y={bodyPositions.kerbol.y + bodies.kerbol.displayRadius + 15}
              textAnchor="middle" fill={bodies.kerbol.color} fontSize={FONT.sizeHeader}
              fontFamily={FONT.mono} fontWeight="bold">KERBOL</text>
          </g>

          {/* === ELLIPTICAL ORBITS: Low Orbit -> SOI (vertical ellipses) === */}
          {ellipticalOrbits && Object.entries(ellipticalOrbits).map(([bodyId, ell]) => {
            const ellNId = nodeId(bodyId, NODE_TYPES.ELLIPTICAL_ORBIT);
            const soiNId = nodeId(bodyId, NODE_TYPES.SOI_INTERCEPT);
            const loNId = nodeId(bodyId, NODE_TYPES.LOW_ORBIT);
            if (!nodesOnPath.has(ellNId) && !nodesOnPath.has(soiNId) && !nodesOnPath.has(loNId)) return null;

            const clipSide = ellipseClipSide[bodyId];
            const clipId = clipSide ? `url(#clip-${bodyId})` : undefined;

            // Find the within-body any combination of LOW_ORBIT, ELLIPTICAL_ORBIT, and SOI_INTERCEPT edge on path for the label
            const ellEdge = edges.find(e =>
              pathEdges.has(edgeId(e.from, e.to)) &&
              ((e.from === ellNId && e.to === loNId) || (e.from === loNId && e.to === ellNId) ||
               (e.from === ellNId && e.to === soiNId) || (e.from === soiNId && e.to === ellNId) ||
               (e.from === loNId && e.to === soiNId) || (e.from === soiNId && e.to === loNId))
            );
            if (!ellEdge) return null;

            // Label on visible side, just outside the ellipse's widest point
            const lx = clipSide === 'left' ? ell.cx - ell.rx - 6 : ell.cx + ell.rx + 6;
            const ly = ell.cy;
            const anchor = clipSide === 'left' ? 'end' : 'start';

            // Dash if aerobrake
            const dashArray = ellEdge && ellEdge.aerobrake ? "5,3" : undefined;

            return (
              <g key={`ell-${bodyId}`} style={{ pointerEvents: 'none' }}>
                {<ellipse cx={ell.cx} cy={ell.cy} rx={ell.rx} ry={ell.ry}
                  fill="none" stroke={COLORS.arcPath} strokeDasharray={dashArray} strokeDashoffset="100"
                  strokeWidth={STROKES.ellipse} clipPath={clipId} filter={FILTERS.glow} />
                }
                {
                  <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
                    fill={COLORS.arcPath} fontSize={9} fontFamily={FONT.mono} fontWeight="bold">
                    {ellEdge.deltaV.toLocaleString()} m/s
                  </text>
                }
              </g>
            );
          })}

          {/* === HOHMANN TRANSFERS: Planet LO → Moon SOI (half-ellipses) === */}
          {Object.entries(hohmannTransfers).map(([htKey, ht]) => {
            const parts = htKey.split(':');
            if (parts.length !== 2) return null;
            const [planetId, moonId] = parts;
            if (!bodies[planetId] || !bodies[moonId]) return null;
            if (!visibleHohmann.has(htKey)) return null;

            const side = hohmannClipSide[htKey];
            const clipId = `url(#ht-clip-${planetId}-${moonId})`;

            // Find the cross-body edge on path for the ΔV label
            const htEdge = edges.find(e => {
              if (!pathEdges.has(edgeId(e.from, e.to))) return false;
              const fb = parseNodeId(e.from).bodyId;
              const tb = parseNodeId(e.to).bodyId;
              return (fb === planetId && tb === moonId) || (fb === moonId && tb === planetId);
            });

            const lx = side === 'left' ? ht.cx - ht.rx - 6 : ht.cx + ht.rx + 6;
            const ly = ht.cy;
            const anchor = side === 'left' ? 'end' : 'start';

            return (
              <g key={`ht-${htKey}`} style={{ pointerEvents: 'none' }}>
                <ellipse cx={ht.cx} cy={ht.cy} rx={ht.rx} ry={ht.ry}
                  fill="none" stroke={COLORS.arcPath}
                  strokeWidth={STROKES.ellipse} clipPath={clipId} filter={FILTERS.glow} />
                {htEdge && (
                  <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
                    fill={COLORS.arcPath} fontSize={9} fontFamily={FONT.mono} fontWeight="bold">
                    {htEdge.deltaV.toLocaleString()} m/s
                  </text>
                )}
              </g>
            );
          })}

          {/* === LAYER 5: Planets, their moons, and all interactive nodes === */}
          {planetOrder.map((planetId) => {
            const body = bodies[planetId];
            const pos = bodyPositions[planetId];
            const r = getBodyDisplayRadius(planetId);
            const loR = getLowOrbitRadius(planetId);
            const surfId = nodeId(planetId, NODE_TYPES.SURFACE);
            const loId = nodeId(planetId, NODE_TYPES.LOW_ORBIT);
            const soiId = nodeId(planetId, NODE_TYPES.SOI_INTERCEPT);
            const soiPos = positions[soiId];
            const surfSt = nodeStatus(surfId);

            // Sort moons for consistent rendering
            const sortedMoons = body.moons
              ? [...body.moons].sort((a, b) => bodies[a].semiMajorAxis - bodies[b].semiMajorAxis)
              : [];

            return (
              <g key={planetId}>
                {/* Highlight opposite half of LO ring for Hohmann transfers (if any) */}
                {(() => {
                  const side = lowOrbitHighlight[planetId];
                  if (!side) return null;
                  const circ = 2 * Math.PI * loR;
                  const half = circ / 2;
                  
                  // For left/right draw half using strokeDasharray
                  const dashArray = `${half + 2} ${half - 2}`;
                  const dashOffset = side === 'right' ? half/2 + 1: -half/2 + 1;

                  // If both, draw full highlighted ring
                  if (side === 'both') {
                    return (
                      <circle cx={pos.x} cy={pos.y} r={loR}
                        fill="none" stroke={COLORS.nodePath} strokeWidth={STROKES.ellipse}
                        style={{ pointerEvents: 'none' }} />
                    );
                  }

                  return (
                    <circle cx={pos.x} cy={pos.y} r={loR}
                      fill="none" stroke={COLORS.nodePath} strokeWidth={STROKES.ellipse}
                      strokeDasharray={dashArray} strokeDashoffset={dashOffset}
                      strokeLinecap="butt"
                      style={{ pointerEvents: 'none' }} />
                  );
                })()}

                {/* Planet body (surface) */}
                <circle cx={pos.x} cy={pos.y} r={r}
                  fill={body.color}
                  stroke={nodeColor(surfSt, 'transparent')}
                  strokeWidth={surfSt !== 'default' ? 2 : 0}
                  role="button"
                  aria-label={`${body.name} Surface`}
                  style={{ cursor: 'pointer', filter: FILTERS.glow }}
                  onClick={() => handleNodeClick(surfId)}
                  onMouseEnter={(e) => handleHover(surfId, e.nativeEvent)}
                  onMouseLeave={() => handleHover(null)}
                />

                {/* Atmosphere haze */}
                {body.atmosphere > 0 && (
                  <circle cx={pos.x} cy={pos.y} r={loR-2}
                    fill="none" stroke="white" strokeWidth="2" opacity="0.5"/>
                )}

                {/* Planet label (left) */}
                <text x={pos.x - loR - 6} y={pos.y + 3}
                  fill={body.color} fontSize={FONT.sizePlanetLabel}
                  fontFamily={FONT.mono} fontWeight="bold"
                  textAnchor="end"
                  style={{ pointerEvents: 'none' }}>
                  {body.name.toUpperCase()}
                </text>

                {/* SOI intercept diamond (on top of SOI circle) */}
                {soiPos && (
                  <Diamond cx={soiPos.x} cy={soiPos.y} size={5} nid={soiId} color={body.color} />
                )}

                {/* Moons */}
                {sortedMoons.map((moonId) => {
                  const moon = bodies[moonId];
                  const mp = bodyPositions[moonId];
                  const mr = getBodyDisplayRadius(moonId);
                  const mLoR = getLowOrbitRadius(moonId);
                  const mSurfId = nodeId(moonId, NODE_TYPES.SURFACE);
                  const mLoId = nodeId(moonId, NODE_TYPES.LOW_ORBIT);
                  const mSoiId = nodeId(moonId, NODE_TYPES.SOI_INTERCEPT);
                  const mSoiPos = positions[mSoiId];
                  const mSurfSt = nodeStatus(mSurfId);

                  return (
                    <g key={moonId}>
                      {/* Moon LO ring */}
                      <InteractiveRing cx={mp.x} cy={mp.y} r={mLoR} nid={mLoId}
                        color={moon.color} sw={STROKES.moonLoRing} op={0.5} />

                      {/* Moon body */}
                      <circle cx={mp.x} cy={mp.y} r={mr}
                        fill={moon.color}
                        stroke={nodeColor(mSurfSt, 'transparent')}
                        strokeWidth={mSurfSt !== 'default' ? 2 : 0}
                        role="button"
                        aria-label={`${moon.name} Surface`}
                        style={{ cursor: 'pointer', filter: FILTERS.glow }}
                        onClick={() => handleNodeClick(mSurfId)}
                        onMouseEnter={(e) => handleHover(mSurfId, e.nativeEvent)}
                        onMouseLeave={() => handleHover(null)}
                      />

                      {/* Moon label to the left (right justified) */}
                      <text x={mp.x - mLoR - 10} y={mp.y + 3}
                        fill={moon.color} fontSize={FONT.sizeMoonLabel}
                        fontFamily={FONT.mono}
                        textAnchor="end"
                        style={{ pointerEvents: 'none' }}>
                        {moon.name}
                      </text>

                      {/* Moon SOI intercept diamond (bottom of moon SOI, toward parent) */}
                      {mSoiPos && (
                        <Diamond cx={mSoiPos.x} cy={mSoiPos.y} size={4}
                          nid={mSoiId} color={moon.color} />
                      )}
                    </g>
                  );
                })}
                {/* Low orbit ring (solid) */}
                <InteractiveRing cx={pos.x} cy={pos.y} r={loR} nid={loId}
                  color={body.color} sw={1.5} op={0.6} />
              </g>
            );
          })}
        </g>
      </svg>

      {/* ── CRT overlays ─────────────────────────────────────────────────── */}
      {CRT.enabled && (<>
        {/* Scanlines */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent ${CRT.scanlineSpacing - 1}px,
            rgba(0,0,0,${CRT.scanlineOpacity}) ${CRT.scanlineSpacing - 1}px,
            rgba(0,0,0,${CRT.scanlineOpacity}) ${CRT.scanlineSpacing}px
          )`,
          zIndex: 10,
        }} />

        {/* Vignette */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,${CRT.vignetteStrength}) 100%)`,
          zIndex: 11,
        }} />

        {/* Inner screen glow (thin phosphor haze along edges) */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
          boxShadow: `inset 0 0 80px 20px ${CRT.innerGlowColor}`,
          zIndex: 12,
        }} />

        {/* Flicker */}
        {CRT.flicker && (
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
            background: 'rgba(255,255,255,0.02)',
            mixBlendMode: 'screen',
            animation: `crt-flicker ${CRT.flickerDuration} linear infinite`,
            zIndex: 13,
          }} />
        )}

        {/* Film grain — oversized so the pan animation never shows an edge */}
        {CRT.grain && (
          <svg aria-hidden="true" className="absolute pointer-events-none"
            style={{ inset: '-10%', width: '120%', height: '120%', zIndex: 14, opacity: CRT.grainOpacity }}>
            <filter id="crt-grain-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
              <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
            </filter>
            <rect width="100%" height="100%" filter="url(#crt-grain-filter)"
              style={{ animation: `crt-grain ${CRT.grainDuration} steps(1) infinite` }} />
          </svg>
        )}
      </>)}

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed pointer-events-none z-50 px-3 py-2 rounded text-xs"
          style={{
            left: tooltip.x + 15, top: tooltip.y - 10,
            background: COLORS.panelBg,
            border: `1px solid ${COLORS.panelBorder}`,
            color: COLORS.panelTextLight,
            whiteSpace: 'pre-line',
            fontFamily: FONT.mono,
            backdropFilter: 'blur(8px)',
          }}>
          {tooltip.text}
        </div>
      )}

      {/* Header */}
      <div className="absolute top-4 left-4 pointer-events-none select-none">
        <h1 className="text-lg font-bold tracking-widest"
          style={{ color: COLORS.accentGreen, fontFamily: FONT.mono }}>
          KERBOL SYSTEM &Delta;V MAP
        </h1>
        <p className="text-xs mt-1" style={{ color: COLORS.panelTextDim }}>
          Click any node to set START &rarr; then click DESTINATION
        </p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 px-3 py-2 rounded text-xs select-none"
        style={{ background: COLORS.panelBg, border: `1px solid ${COLORS.panelBorder}`,
          fontFamily: FONT.mono, color: COLORS.panelText }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill={COLORS.accentGreen} /></svg>
            Surface
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="none" stroke="white" strokeWidth="1.5" /></svg>
            Atmosphere
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="none" stroke={COLORS.accentGreen} strokeWidth="1.5" /></svg>
            Low Orbit
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="none" stroke={COLORS.accentGreen} strokeWidth="0.8" strokeDasharray="2,2" /></svg>
            SOI
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12">
              <path d={diamondPath(5)} transform="translate(6,6)" fill="none" stroke={COLORS.accentGreen} strokeWidth="1.2" />
            </svg>
            Intercept
          </span>
          <span className="flex items-center gap-1">
            <svg width="20" height="4">
              <line x1="0" y1="2" x2="20" y2="2" stroke={COLORS.aerobrake} strokeWidth="1" strokeDasharray="3,2" />
            </svg>
            Aerobrake
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12">
              <path d={trianglePath(5)} transform="translate(6,6)" fill="none" stroke={COLORS.planeChange} strokeWidth="1.2" />
            </svg>
            Plane Change
          </span>
        </div>
      </div>

      {/* Mission Panel */}
      <MissionPanel startNode={startNode} endNode={endNode} mission={mission} onClear={clearSelection} />

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button className="w-8 h-8 flex items-center justify-center rounded text-sm"
          aria-label="Zoom in"
          style={{ background: COLORS.panelBg, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.panelText, cursor: 'pointer' }}
          onClick={() => setTransform(t => ({ ...t, scale: Math.min(3, t.scale * 1.2) }))}>+</button>
        <button className="w-8 h-8 flex items-center justify-center rounded text-sm"
          aria-label="Zoom out"
          style={{ background: COLORS.panelBg, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.panelText, cursor: 'pointer' }}
          onClick={() => setTransform(t => ({ ...t, scale: Math.max(0.3, t.scale * 0.8) }))}>&#x2212;</button>
        <button className="w-8 h-8 flex items-center justify-center rounded text-xs"
          aria-label="Reset view"
          style={{ background: COLORS.panelBg, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.panelText, cursor: 'pointer' }}
          onClick={() => setTransform({ x: -50, y: -100, scale: 0.85 })}>&#x2302;</button>
      </div>
    </div>
  );
}
