import { useState, useRef, useCallback, useEffect } from 'react';
import { bodies, planetOrder, edges, nodeId, parseNodeId, NODE_TYPES, getNodeLabel } from '../data/systemData';
import { computeLayout, getBodyDisplayRadius, getLowOrbitRadius, ECLIPTIC_Y, KERBOL_X } from '../layout/layoutEngine';
import { dijkstra, getPathEdgeIds, edgeId } from '../utils/pathfinding';
import TransferArc from './TransferArc';
import MissionPanel from './MissionPanel';

const layout = computeLayout();
const { positions, bodyPositions, moonOrbitRings, soiCircles, ellipticalOrbits } = layout;

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

const STARS = generateStars(200, 42);

// Ecliptic line end X: find rightmost planet + padding
const eclipticEndX = Math.max(...planetOrder.map(id => bodyPositions[id]?.x || 0)) + 200;

export default function OrbitalGraph() {
  const svgRef = useRef(null);
  const [transform, setTransform] = useState({ x: -50, y: -100, scale: 0.85 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState(null);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [mission, setMission] = useState(null);
  const [pathEdges, setPathEdges] = useState(new Set());

  useEffect(() => {
    if (startNode && endNode) {
      const result = dijkstra(startNode, endNode);
      setMission(result);
      setPathEdges(result ? getPathEdgeIds(result.path) : new Set());
    } else {
      setMission(null);
      setPathEdges(new Set());
    }
  }, [startNode, endNode]);

  const handleNodeClick = useCallback((nid) => {
    if (!startNode) {
      setStartNode(nid);
    } else if (!endNode && nid !== startNode) {
      setEndNode(nid);
    } else {
      setStartNode(nid);
      setEndNode(null);
    }
  }, [startNode, endNode]);

  const clearSelection = useCallback(() => {
    setStartNode(null);
    setEndNode(null);
    setMission(null);
    setPathEdges(new Set());
  }, []);

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

  const status = (nid) => {
    if (nid === startNode) return 'start';
    if (nid === endNode) return 'end';
    if (mission && mission.path.includes(nid)) return 'path';
    return 'default';
  };

  const sColor = (st, bodyColor) => {
    if (st === 'start') return '#00ff88';
    if (st === 'end') return '#ff4488';
    if (st === 'path') return '#00ffff';
    return bodyColor || '#6b7280';
  };

  // Reusable interactive circle (click target + visible ring)
  const InteractiveRing = ({ cx, cy, r, nid, color, sw, op, dash }) => {
    const st = status(nid);
    const c = sColor(st, color);
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={c} strokeWidth={st !== 'default' ? sw + 1 : sw}
          strokeDasharray={dash || 'none'}
          opacity={st !== 'default' ? 1 : op}
          style={{ cursor: 'pointer', filter: st !== 'default' ? 'url(#glow)' : 'none' }}
          onClick={() => handleNodeClick(nid)}
          onMouseEnter={(e) => handleHover(nid, e.nativeEvent)}
          onMouseLeave={() => handleHover(null)}
        />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="transparent"
          strokeWidth={Math.max(8, sw + 6)} style={{ cursor: 'pointer' }}
          onClick={() => handleNodeClick(nid)}
          onMouseEnter={(e) => handleHover(nid, e.nativeEvent)}
          onMouseLeave={() => handleHover(null)}
        />
      </g>
    );
  };

  // Reusable diamond marker (SVG path, for SOI_INTERCEPT)
  const Diamond = ({ cx, cy, size, nid, color }) => {
    const st = status(nid);
    const c = sColor(st, color);
    return (
      <g>
        <path
          d={diamondPath(size)}
          transform={`translate(${cx},${cy})`}
          fill={st !== 'default' ? c : 'none'}
          fillOpacity={st !== 'default' ? 0.3 : 0}
          stroke={c}
          strokeWidth={st !== 'default' ? 2 : 1.2}
          style={{ cursor: 'pointer', filter: st !== 'default' ? 'url(#glow)' : 'none' }}
          onClick={() => handleNodeClick(nid)}
          onMouseEnter={(e) => handleHover(nid, e.nativeEvent)}
          onMouseLeave={() => handleHover(null)}
        />
        <circle cx={cx} cy={cy} r={size + 4} fill="transparent" stroke="transparent"
          style={{ cursor: 'pointer' }}
          onClick={() => handleNodeClick(nid)}
          onMouseEnter={(e) => handleHover(nid, e.nativeEvent)}
          onMouseLeave={() => handleHover(null)}
        />
      </g>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#0a0e17' }}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
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
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Background click target */}
          <rect className="bg-layer" x="-2000" y="-2000" width="8000" height="8000" fill="transparent" />

          {/* Starfield */}
          {STARS.map((star, i) => (
            <circle key={`s${i}`} cx={star.x} cy={star.y} r={star.r} fill="#ffffff" opacity={star.opacity} />
          ))}

          {/* Ecliptic line */}
          <line x1={KERBOL_X - 30} y1={ECLIPTIC_Y} x2={eclipticEndX} y2={ECLIPTIC_Y}
            stroke="#1a2640" strokeWidth="1" strokeDasharray="8,4" />
          <text x={KERBOL_X - 25} y={ECLIPTIC_Y + 4} fill="#1a2640" fontSize="7"
            fontFamily="'Courier New', monospace">ECLIPTIC</text>

          {/* === LAYER 1: SOI dashed circles === */}
          {Object.entries(soiCircles).map(([bodyId, soi]) => {
            const body = bodies[bodyId];
            return (
              <circle key={`soi-${bodyId}`}
                cx={soi.cx} cy={soi.cy} r={soi.r}
                fill="none" stroke={body?.color || '#333'}
                strokeWidth="1" strokeDasharray="4,2"
                opacity="0.2"
              />
            );
          })}

          {/* === ELLIPTICAL ORBITS: Low Orbit -> SOI (vertical ellipses) === */}
          {ellipticalOrbits && Object.entries(ellipticalOrbits).map(([bodyId, ell]) => {
            const body = bodies[bodyId];
            return (
              <ellipse key={`ell-${bodyId}`}
                cx={ell.cx} cy={ell.cy} rx={ell.rx} ry={ell.ry}
                fill="none" stroke={body?.color || '#333'}
                strokeWidth={1.6} strokeDasharray="6,4" opacity={0.14}
              />
            );
          })}

          {/* === LAYER 2: Moon orbit rings (concentric, centered on parent, same color as moon) === */}
          {moonOrbitRings.map((ring) => {
            const parent = bodies[ring.parentId];
            return (
              <circle key={`ring-${ring.moonId}`}
                cx={ring.cx} cy={ring.cy} r={ring.r}
                fill="none" stroke={bodies[ring.moonId]?.color || '#333'}
                strokeWidth="2" strokeDasharray=""
                opacity="0.18"
              />
            );
          })}

          {/* === LAYER 3: Transfer arcs === */}
          {edges.map((edge, i) => {
            const fromPos = positions[edge.from];
            const toPos = positions[edge.to];
            if (!fromPos || !toPos) return null;
            const eid = edgeId(edge.from, edge.to);
            const isOnPath = pathEdges.has(eid);
            return (
              <TransferArc key={i}
                from={fromPos} to={toPos}
                deltaV={edge.deltaV}
                aerobrake={edge.aerobrake}
                planeChange={edge.planeChange}
                label={edge.label}
                isOnPath={isOnPath}
                scale={transform.scale}
              />
            );
          })}

          {/* === LAYER 4: Kerbol === */}
          <g>
            <circle cx={bodyPositions.kerbol.x} cy={bodyPositions.kerbol.y} r={50}
              fill="url(#kerbol-glow)" />
            <circle cx={bodyPositions.kerbol.x} cy={bodyPositions.kerbol.y}
              r={bodies.kerbol.displayRadius} fill={bodies.kerbol.color}
              filter="url(#glow-strong)" />
            <text x={bodyPositions.kerbol.x} y={bodyPositions.kerbol.y + bodies.kerbol.displayRadius + 15}
              textAnchor="middle" fill="#ffdd44" fontSize="11"
              fontFamily="'Courier New', monospace" fontWeight="bold">KERBOL</text>
          </g>

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
            const surfSt = status(surfId);

            // Sort moons for consistent rendering
            const sortedMoons = body.moons
              ? [...body.moons].sort((a, b) => bodies[a].semiMajorAxis - bodies[b].semiMajorAxis)
              : [];

            return (
              <g key={planetId}>
                {/* Low orbit ring (solid) */}
                <InteractiveRing cx={pos.x} cy={pos.y} r={loR} nid={loId}
                  color={body.color} sw={1.5} op={0.6} />

                {/* Planet body (surface) */}
                <circle cx={pos.x} cy={pos.y} r={r}
                  fill={body.color}
                  stroke={sColor(surfSt, 'transparent')}
                  strokeWidth={surfSt !== 'default' ? 2 : 0}
                  style={{ cursor: 'pointer', filter: 'url(#glow)' }}
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
                  fill={body.color} fontSize="10"
                  fontFamily="'Courier New', monospace" fontWeight="bold"
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
                  const mSurfSt = status(mSurfId);

                  return (
                    <g key={moonId}>
                      {/* Moon LO ring */}
                      <InteractiveRing cx={mp.x} cy={mp.y} r={mLoR} nid={mLoId}
                        color={moon.color} sw={1} op={0.5} />

                      {/* Moon body */}
                      <circle cx={mp.x} cy={mp.y} r={mr}
                        fill={moon.color}
                        stroke={sColor(mSurfSt, 'transparent')}
                        strokeWidth={mSurfSt !== 'default' ? 2 : 0}
                        style={{ cursor: 'pointer', filter: 'url(#glow)' }}
                        onClick={() => handleNodeClick(mSurfId)}
                        onMouseEnter={(e) => handleHover(mSurfId, e.nativeEvent)}
                        onMouseLeave={() => handleHover(null)}
                      />

                      {/* Moon label to the left (right justified) */}
                      <text x={mp.x - mLoR - 10} y={mp.y + 3}
                        fill={moon.color} fontSize="8"
                        fontFamily="'Courier New', monospace"
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
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed pointer-events-none z-50 px-3 py-2 rounded text-xs"
          style={{
            left: tooltip.x + 15, top: tooltip.y - 10,
            background: 'rgba(17, 24, 39, 0.95)',
            border: '1px solid #374151',
            color: '#e5e7eb',
            whiteSpace: 'pre-line',
            fontFamily: "'Courier New', monospace",
            backdropFilter: 'blur(8px)',
          }}>
          {tooltip.text}
        </div>
      )}

      {/* Header */}
      <div className="absolute top-4 left-4 pointer-events-none select-none">
        <h1 className="text-lg font-bold tracking-widest"
          style={{ color: '#4ade80', fontFamily: "'Courier New', monospace" }}>
          KERBOL SYSTEM &Delta;V MAP
        </h1>
        <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
          Click any node to set START &rarr; then click DESTINATION
        </p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 px-3 py-2 rounded text-xs select-none"
        style={{ background: 'rgba(17, 24, 39, 0.9)', border: '1px solid #1f2937',
          fontFamily: "'Courier New', monospace", color: '#9ca3af' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="#4ade80" /></svg>
            Surface
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="none" stroke="white" strokeWidth="1.5" /></svg>
            Atmosphere
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="none" stroke="#4ade80" strokeWidth="1.5" /></svg>
            Low Orbit
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="none" stroke="#4ade80" strokeWidth="0.8" strokeDasharray="2,2" /></svg>
            SOI
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12">
              <path d={diamondPath(5)} transform="translate(6,6)" fill="none" stroke="#4ade80" strokeWidth="1.2" />
            </svg>
            Intercept
          </span>
          <span className="flex items-center gap-1">
            <svg width="20" height="4">
              <line x1="0" y1="2" x2="20" y2="2" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3,2" />
            </svg>
            Aerobrake
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12">
              <path d={trianglePath(5)} transform="translate(6,6)" fill="none" stroke="#fbbf24" strokeWidth="1.2" />
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
          style={{ background: 'rgba(17, 24, 39, 0.9)', border: '1px solid #1f2937', color: '#9ca3af', cursor: 'pointer' }}
          onClick={() => setTransform(t => ({ ...t, scale: Math.min(3, t.scale * 1.2) }))}>+</button>
        <button className="w-8 h-8 flex items-center justify-center rounded text-sm"
          style={{ background: 'rgba(17, 24, 39, 0.9)', border: '1px solid #1f2937', color: '#9ca3af', cursor: 'pointer' }}
          onClick={() => setTransform(t => ({ ...t, scale: Math.max(0.3, t.scale * 0.8) }))}>&#x2212;</button>
        <button className="w-8 h-8 flex items-center justify-center rounded text-xs"
          style={{ background: 'rgba(17, 24, 39, 0.9)', border: '1px solid #1f2937', color: '#9ca3af', cursor: 'pointer' }}
          onClick={() => setTransform({ x: -50, y: -100, scale: 0.85 })}>&#x2302;</button>
      </div>
    </div>
  );
}
