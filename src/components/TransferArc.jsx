import { useMemo } from 'react';

// Renders a curved transfer arc between two nodes
export default function TransferArc({ from, to, deltaV, aerobrake, planeChange, label, isOnPath, scale }) {
  const { path, midpoint } = useMemo(() => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.1) {
      return {
        path: `M ${from.x} ${from.y} L ${to.x} ${to.y}`,
        midpoint: { x: from.x, y: from.y },
      };
    }

    // Perpendicular direction (consistently curve upward/left)
    const nx = -dy / dist;
    const ny = dx / dist;

    // Scale curvature with distance - larger arcs for interplanetary transfers
    let curvature;
    if (dist > 200) {
      // Long interplanetary arcs - large elegant curves above the ecliptic
      curvature = dist * 0.25;
    } else if (dist > 80) {
      // Medium transfers
      curvature = dist * 0.2;
    } else {
      // Short local transfers (surface to orbit, etc.)
      curvature = Math.max(10, dist * 0.3);
    }

    const cx = (from.x + to.x) / 2 + nx * curvature;
    const cy = (from.y + to.y) / 2 + ny * curvature;

    // Quadratic bezier midpoint is at t=0.5: B(0.5) = 0.25*P0 + 0.5*CP + 0.25*P1
    const mx = 0.25 * from.x + 0.5 * cx + 0.25 * to.x;
    const my = 0.25 * from.y + 0.5 * cy + 0.25 * to.y;

    return {
      path: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`,
      midpoint: { x: mx, y: my },
    };
  }, [from, to]);

  const baseColor = isOnPath ? '#00ffff' : '#2a3448';
  const labelColor = isOnPath ? '#00ffff' : '#4b5563';
  const strokeWidth = isOnPath ? 2.5 : 0.7;
  const opacity = isOnPath ? 1 : 0.6;

  const showLabel = scale > 0.5;
  const fontSize = Math.max(6, Math.min(8, 8 / scale));

  return (
    <g>
      {/* Glow underlay for path arcs */}
      {isOnPath && (
        <path
          d={path}
          fill="none"
          stroke="#00ffff"
          strokeWidth={5}
          strokeDasharray={aerobrake ? '6,4' : 'none'}
          opacity={0.15}
        />
      )}

      {/* Main arc */}
      <path
        d={path}
        fill="none"
        stroke={baseColor}
        strokeWidth={strokeWidth}
        strokeDasharray={aerobrake ? '5,3' : 'none'}
        opacity={opacity}
      />

      {/* Delta-V label on arc */}
      {showLabel && (
        <g style={{ pointerEvents: 'none' }}>
          {/* Label background */}
          <rect
            x={midpoint.x - 22}
            y={midpoint.y - 11}
            width={44}
            height={12}
            rx={2}
            fill={isOnPath ? 'rgba(0, 255, 255, 0.1)' : 'rgba(10, 14, 23, 0.8)'}
            stroke="none"
          />
          <text
            x={midpoint.x}
            y={midpoint.y - 2}
            textAnchor="middle"
            fill={labelColor}
            fontSize={fontSize}
            fontFamily="'Courier New', monospace"
            fontWeight={isOnPath ? 'bold' : 'normal'}
          >
            {deltaV} m/s
          </text>
        </g>
      )}

      {/* Plane change indicator (SVG triangle) */}
      {planeChange && showLabel && (
        <g transform={`translate(${midpoint.x + 28}, ${midpoint.y - 3})`}
          style={{ pointerEvents: 'none' }}>
          <path
            d="M 0 -4 L 3.46 2 L -3.46 2 Z"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.2"
          />
        </g>
      )}
    </g>
  );
}
