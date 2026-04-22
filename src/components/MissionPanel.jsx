import { getNodeLabel, parseNodeId, bodies } from '../data/systemData';
import { COLORS, FONT } from '../utils/theme';

/**
 * MissionPanel — overlay that displays the selected route and delta-v budget.
 *
 * States:
 *  • No selection     → instructional empty state (prompts user to pick a start)
 *  • Origin only      → shows origin, prompts for destination
 *  • Both selected    → shows full leg breakdown and total ΔV
 *  • Both selected, no path → error message
 *
 * @param {string|null}  startNode  - Origin node ID (e.g. 'kerbin:SURFACE')
 * @param {string|null}  endNode    - Destination node ID
 * @param {{
 *   totalDeltaV: number,
 *   totalPlaneChange: number,
 *   legs: Array<{
 *     from: string, to: string, deltaV: number,
 *     aerobrake: boolean, planeChange: number, label: string
 *   }>,
 *   path: string[]
 * }|null} mission - Computed route from Dijkstra; null when unresolved.
 * @param {() => void}   onClear    - Callback that resets all selection state.
 */
export default function MissionPanel({ startNode, endNode, mission, onClear }) {
  const startBody = startNode ? bodies[parseNodeId(startNode).bodyId] : null;
  const endBody   = endNode   ? bodies[parseNodeId(endNode).bodyId]   : null;

  const panelStyle = {
    background: COLORS.panelBg,
    border: `2px solid ${COLORS.panelBorder}`,
    fontFamily: FONT.mono,
    backdropFilter: 'blur(0px)',
  };

  const separatorStyle = { borderBottom: `1px solid ${COLORS.panelBorder}` };
  return (
    <div
      role="region"
      aria-label="Mission Manifest"
      className="absolute top-4 right-4 w-120 rounded-lg overflow-hidden"
      style={panelStyle}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={separatorStyle}>
        <span className="text-xs font-bold tracking-widest" style={{ color: COLORS.accentGreen }}>
          MISSION MANIFEST
        </span>
        {(startNode || endNode) && (
          <button
          aria-label="Clear mission selection"
            onClick={onClear}
            className="text-xs px-2 py-1 rounded"
            style={{ background: COLORS.panelBorder, color: COLORS.panelText, cursor: 'pointer', border: 'none' }}
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Empty state — no node selected yet */}
      {!startNode && !endNode && (
        <div className="px-4 py-4 text-xs" style={{ color: COLORS.panelText }}>
          <p>Click any node on the map to set your</p>
          <p className="mt-1" style={{ color: COLORS.accentGreen }}>▸ ORIGIN</p>
          <p className="mt-1">then click a second node for your</p>
          <p className="mt-1" style={{ color: '#ff4488' }}>▸ DESTINATION</p>
        </div>
      )}

      {/* Route */}
      {(startNode || endNode) && (
        <div className="px-4 py-3" style={separatorStyle}>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: COLORS.nodeStart }} />
            <span style={{ color: startBody?.color || COLORS.panelText }}>
              {startNode ? getNodeLabel(startNode) : 'Select start…'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: COLORS.nodeEnd }} />
            <span style={{ color: endBody?.color || COLORS.panelText }}>
              {endNode ? getNodeLabel(endNode) : 'Select destination…'}
            </span>
          </div>
        </div>
      )}

      {/* Mission legs */}
      {mission && (
        <div className="px-4 py-3" aria-live="polite" aria-atomic="true">
          {/* Total ΔV */}
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-xs" style={{ color: COLORS.panelTextDim }}>TOTAL ΔV</span>
            <div className="flex flex-col items-end">
              {mission.totalPlaneChange > 0 && (
                <span style={{ color: COLORS.planeChange, fontSize: '12px' }}>
                  +{mission.totalPlaneChange.toLocaleString()} m/s ▲i
                </span>
              )}
              <span className="text-lg font-bold" style={{ color: COLORS.totalDeltaV }}>
                {mission.totalDeltaV.toLocaleString()} m/s
              </span>
            </div>
          </div>

          {/* Leg breakdown */}
          <div className="space-y-1">
            {mission.legs.map((leg, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs py-1"
                style={{ borderTop: `1px solid ${COLORS.panelRowSeparator}` }}
              >
                <div className="flex items-center gap-1" style={{ color: COLORS.panelText, maxWidth: '65%' }}>
                  {!leg.aerobrake && !(leg.planeChange > 0) && (
                    <span style={{ color: COLORS.accentGreen, fontSize: '16px' }}>▸</span>
                  )}
                  {leg.aerobrake && (
                    <svg width="12" height="12" viewBox="0 0 10 10" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                      <path d="M 5 10 L 10 0 L 0 0 Z" fill={COLORS.aerobrake} />
                    </svg>
                  )}
                  {(leg.planeChange > 0) && (
                    <svg width="12" height="12" viewBox="0 0 10 10" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                      <path d="M 5 1 L 9 9 L 1 9 Z" fill="none" stroke={COLORS.planeChange} strokeWidth="1.5" />
                    </svg>
                  )}
                </div>
                <div className="text-xs py-0.5 flex-1 text-left">
                  {leg.label || 'Transfer'}
                </div>
                <div className="flex flex-col items-end">
                  {leg.planeChange > 0 && (
                    <span style={{ color: COLORS.planeChange, fontSize: '10px' }}>
                      +{leg.planeChange.toLocaleString()} m/s ▲i
                    </span>
                  )}
                  <span style={{ color: COLORS.panelTextLight }}>
                    {leg.deltaV.toLocaleString()} m/s
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed route */}
          <div className="mt-3 pt-2" style={{ borderTop: `1px solid ${COLORS.panelBorder}` }}>
            <div className="text-xs mb-1" style={{ color: COLORS.panelTextDim }}>ROUTE</div>
            {mission.legs.map((leg, i) => {
              const fromBody = bodies[parseNodeId(leg.from).bodyId];
              const toBody   = bodies[parseNodeId(leg.to).bodyId];
              return (
                <div key={i} className="text-xs py-0.5 flex items-start gap-1">
                  <span style={{ color: COLORS.panelBorder }}>│</span>
                  <div>
                    <span style={{ color: fromBody?.color || COLORS.panelText, whiteSpace: 'normal' }}>
                      {getNodeLabel(leg.from)}
                    </span>
                    <span style={{ color: '#4b5563' }}> → </span>
                    <span style={{ color: toBody?.color || COLORS.panelText, whiteSpace: 'normal' }}>
                      {getNodeLabel(leg.to)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No path found */}
      {startNode && endNode && !mission && (
        <div className="px-4 py-3 text-xs" style={{ color: '#ef4444' }}>
          No valid path found between these nodes.
        </div>
      )}
    </div>
  );
}
