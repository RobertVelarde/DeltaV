import { useMemo } from 'react';
import { COLORS, STROKES, FONT } from '../utils/theme';

/**
 * TransferArc — renders a single delta-v edge between two SVG positions.
 *
 * Arc geometry — quadratic Bézier curve
 * ──────────────────────────────────────
 * A quadratic Bézier B(t) = (1-t)²·P0 + 2(1-t)t·CP + t²·P1
 *
 * The control point CP is placed perpendicular to the chord P0→P1 at its
 * midpoint, offset by `curvature` units along the normal:
 *
 *   chord midpoint M  = (P0 + P1) / 2
 *   unit normal n̂    = (-dy, dx) / |P0P1|    (perpendicular, rotated 90°)
 *   CP               = M + n̂ · curvature
 *
 * The visual midpoint of the rendered arc (where the label sits) is the
 * Bézier point at t = 0.5:
 *
 *   B(0.5) = 0.25·P0 + 0.5·CP + 0.25·P1
 *
 * `curvature` is scaled with arc length so short local hops stay tight while
 * long interplanetary transfers sweep elegantly.  It is currently set to 0
 * (straight line) while the subway-style ellipse arcs handle visual routing;
 * un-commenting the curvature logic restores curved arcs if desired.
 *
 * @param {{ x: number, y: number }} from   - SVG start position
 * @param {{ x: number, y: number }} to     - SVG end position
 * @param {number}  deltaV                  - Manoeuvre cost in m/s
 * @param {boolean} [aerobrake]             - Render as dashed (aerobraking)
 * @param {boolean} [planeChange]           - Show plane-change triangle icon
 * @param {string}  [label]                 - Human-readable manoeuvre label
 * @param {boolean} isOnPath                - Whether this arc is on the active route
 * @param {number}  scale                   - Current SVG viewport scale (for font sizing)
 */
export default function TransferArc({ from, to, deltaV, aerobrake, planeChange, isOnPath, scale }) {
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

    // Curvature is currently 0 (straight lines); un-comment the block below
    // to restore Bézier curves scaled by transfer distance.
    const curvature = 0;

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

  const baseColor   = isOnPath ? COLORS.arcPath    : COLORS.arcDefault;
  const labelColor  = isOnPath ? COLORS.arcPath    : COLORS.panelTextDim;
  const strokeWidth = isOnPath ? STROKES.arcPath   : STROKES.arcDefault;
  const opacity     = isOnPath ? 1 : 0;

  const showLabel = scale > 0.5;
  const fontSize = Math.max(6, Math.min(8, 8 / scale));

  return (
    <g>

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
            fontFamily={FONT.mono}
            fontWeight={isOnPath ? 'bold' : 'normal'}
          >
            {deltaV} m/s
          </text>
        </g>
      )}

      {/* Plane change indicator (triangle) */}
      {planeChange && showLabel && (
        <g transform={`translate(${midpoint.x + 28}, ${midpoint.y - 3})`}
          style={{ pointerEvents: 'none' }}>
          <path
            d="M 0 -4 L 3.46 2 L -3.46 2 Z"
            fill="none"
            stroke={COLORS.planeChange}
            strokeWidth="1.2"
          />
        </g>
      )}
    </g>
  );
}
