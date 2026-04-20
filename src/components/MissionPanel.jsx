import { getNodeLabel, parseNodeId, bodies } from '../data/systemData';

export default function MissionPanel({ startNode, endNode, mission, onClear }) {
  if (!startNode && !endNode) return null;

  const startBody = startNode ? bodies[parseNodeId(startNode).bodyId] : null;
  const endBody = endNode ? bodies[parseNodeId(endNode).bodyId] : null;

  return (
    <div
      className="absolute top-4 right-4 w-72 rounded-lg overflow-hidden"
      style={{
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid #1f2937',
        fontFamily: "'Courier New', monospace",
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1f2937' }}>
        <span className="text-xs font-bold tracking-widest" style={{ color: '#4ade80' }}>
          MISSION MANIFEST
        </span>
        <button
          onClick={onClear}
          className="text-xs px-2 py-1 rounded"
          style={{ background: '#1f2937', color: '#9ca3af', cursor: 'pointer', border: 'none' }}
        >
          CLEAR
        </button>
      </div>

      {/* Route */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1f2937' }}>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#00ff88' }} />
          <span style={{ color: startBody?.color || '#9ca3af' }}>
            {startNode ? getNodeLabel(startNode) : 'Select start...'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs mt-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#ff4488' }} />
          <span style={{ color: endBody?.color || '#9ca3af' }}>
            {endNode ? getNodeLabel(endNode) : 'Select destination...'}
          </span>
        </div>
      </div>

      {/* Mission legs */}
      {mission && (
        <div className="px-4 py-3">
          {/* Total */}
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-xs" style={{ color: '#6b7280' }}>TOTAL ΔV</span>
            <span className="text-lg font-bold" style={{ color: '#00ffff' }}>
              {mission.totalDeltaV.toLocaleString()} m/s
            </span>
          </div>

          {/* Leg breakdown */}
          <div className="space-y-1">
            {mission.legs.map((leg, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs py-1"
                style={{ borderTop: i > 0 ? '1px solid #111827' : 'none' }}
              >
                <div className="flex items-center gap-1" style={{ color: '#9ca3af', maxWidth: '65%' }}>
                  <span style={{ color: '#4ade80', fontSize: '8px' }}>▸</span>
                  <span className="truncate">
                    {leg.label || 'Transfer'}
                  </span>
                  {leg.aerobrake && (
                    <span
                      className="px-1 rounded text-xs"
                      style={{ background: '#1f2937', color: '#60a5fa', fontSize: '7px' }}
                    >
                      AERO
                    </span>
                  )}
                  {leg.planeChange && (
                    <svg width="10" height="10" viewBox="0 0 10 10" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                      <path d="M 5 1 L 8.46 7 L 1.54 7 Z" fill="none" stroke="#fbbf24" strokeWidth="1.2" />
                    </svg>
                  )}
                </div>
                <span style={{ color: '#e5e7eb' }}>
                  {leg.deltaV.toLocaleString()} m/s
                </span>
              </div>
            ))}
          </div>

          {/* Detailed path */}
          <div className="mt-3 pt-2" style={{ borderTop: '1px solid #1f2937' }}>
            <div className="text-xs mb-1" style={{ color: '#6b7280' }}>ROUTE</div>
            {mission.legs.map((leg, i) => {
              const fromBody = bodies[parseNodeId(leg.from).bodyId];
              const toBody = bodies[parseNodeId(leg.to).bodyId];
              return (
                <div key={i} className="text-xs py-0.5 flex items-start gap-1">
                  <span style={{ color: '#374151' }}>│</span>
                  <div>
                    <span style={{ color: fromBody?.color || '#9ca3af' }}>
                      {getNodeLabel(leg.from).split(' ').slice(-1)[0]}
                    </span>
                    <span style={{ color: '#4b5563' }}> → </span>
                    <span style={{ color: toBody?.color || '#9ca3af' }}>
                      {getNodeLabel(leg.to).split(' ').slice(-1)[0]}
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
