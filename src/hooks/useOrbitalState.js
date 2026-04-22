import { useState, useMemo, useCallback } from 'react';
import { nodeId, parseNodeId, NODE_TYPES } from '../data/systemData';
import { layout } from '../layout/layoutEngine';
import { dijkstra, getPathEdgeIds, edgeId } from '../utils/pathfinding';

// Destructure the static layout values needed for highlight calculations.
// These never change at runtime, so they live at module scope.
const { bodyPositions, ellipticalOrbits, hohmannTransfers } = layout;

/**
 * Manages all interactive graph state for the orbital map:
 *  - Origin / destination node selection
 *  - Dijkstra path computation
 *  - Derived highlight sets: ellipse clip sides, Hohmann visibility, LO ring highlights
 *
 * Separating this logic from OrbitalGraph.jsx keeps the rendering component
 * focused purely on SVG output and pan/zoom interaction.
 *
 * @returns {{
 *   startNode: string|null,
 *   endNode: string|null,
 *   mission: object|null,
 *   pathEdges: Set<string>,
 *   nodesOnPath: Set<string>,
 *   ellipseClipSide: Record<string,'left'|'right'>,
 *   visibleHohmann: Set<string>,
 *   hohmannClipSide: Record<string,'left'|'right'>,
 *   lowOrbitHighlight: Record<string,'left'|'right'|'both'>,
 *   handleNodeClick: (nid: string) => void,
 *   clearSelection: () => void,
 *   nodeStatus: (nid: string) => 'start'|'end'|'path'|'default',
 *   nodeColor: (status: string, bodyColor?: string) => string,
 * }}
 */
export function useOrbitalState() {
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);

  // Compute the route reactively — no effect needed since dijkstra is pure and
  // synchronous.  Using useMemo avoids an extra render cycle compared to
  // useEffect + setState, and satisfies the react-hooks/set-state-in-effect rule.
  const mission = useMemo(() => {
    if (!startNode || !endNode) return null;
    return dijkstra(startNode, endNode);
  }, [startNode, endNode]);

  const pathEdges = useMemo(() => {
    if (!mission) return new Set();
    return getPathEdgeIds(mission.path);
  }, [mission]);

  /** Set of every node ID that appears anywhere on the active route. */
  const nodesOnPath = useMemo(
    () => new Set(mission?.path ?? []),
    [mission]
  );

  /**
   * Determines which half of a departure ellipse to render for a given body.
   *
   * Kerbin defaults to the right half (pointing away from Kerbol), but flips
   * to the left half when the destination body lies to Kerbin's right, so the
   * rendered arc points toward the target.
   *
   * All other bodies: render the left half if they sit left of Kerbin on the
   * ecliptic, and the right half otherwise.
   *
   * @param {string} bodyId
   * @returns {'left'|'right'}
   */
  const getSideForBody = useCallback((bodyId) => {
    const kerbinX = bodyPositions?.kerbin?.x ?? 0;
    if (bodyId === 'kerbin') {
      if (endNode) {
        const destX = bodyPositions?.[parseNodeId(endNode).bodyId]?.x;
        if (typeof destX === 'number' && destX > kerbinX) return 'left';
        const sourceX = startNode
          ? (bodyPositions?.[parseNodeId(startNode).bodyId]?.x)
          : undefined;
        if (typeof sourceX === 'number' && destX === kerbinX && sourceX > kerbinX) return 'left';
      }
      return 'right';
    }
    const posX = bodyPositions?.[bodyId]?.x;
    return typeof posX === 'number' && posX < kerbinX ? 'left' : 'right';
  }, [endNode, startNode]);

  /**
   * Maps each body to the half ('left'|'right') of its departure ellipse that
   * should be rendered.  Only bodies whose ellipse or SOI node appears on the
   * active route receive an entry.
   */
  const ellipseClipSide = useMemo(() => {
    const map = {};
    if (!ellipticalOrbits) return map;
    for (const bodyId of Object.keys(ellipticalOrbits)) {
      const ellNodeId = nodeId(bodyId, NODE_TYPES.ELLIPTICAL_ORBIT);
      const soiNodeId = nodeId(bodyId, NODE_TYPES.SOI_INTERCEPT);
      const loNodeId  = nodeId(bodyId, NODE_TYPES.LOW_ORBIT);
      if (!nodesOnPath.has(ellNodeId) && !nodesOnPath.has(soiNodeId)) continue;

      // Show only a half-ellipse when the path skips the elliptical orbit node
      // (direct SOI ↔ LO edge) or when the ellipse node is not the trip endpoint.
      const usesSoiLoEdge = pathEdges.has(edgeId(soiNodeId, loNodeId)) || pathEdges.has(edgeId(loNodeId, soiNodeId));
      const ellIsEndpoint = ellNodeId === startNode || ellNodeId === endNode;
      if (usesSoiLoEdge || !ellIsEndpoint) {
        map[bodyId] = getSideForBody(bodyId);
      }
    }
    return map;
  }, [nodesOnPath, pathEdges, startNode, endNode, getSideForBody]);

  /**
   * Set of Hohmann-transfer keys (format: "planetId:moonId") that are part of
   * the currently active route.
   */
  const visibleHohmann = useMemo(() => {
    const set = new Set();
    if (!hohmannTransfers) return set;
    for (const htKey of Object.keys(hohmannTransfers)) {
      const [planetId, moonId] = htKey.split(':');
      if (!planetId || !moonId) continue;
      const loNodeId  = nodeId(planetId, NODE_TYPES.LOW_ORBIT);
      const ellNodeId = nodeId(planetId, NODE_TYPES.ELLIPTICAL_ORBIT);
      const mSoiId    = nodeId(moonId, NODE_TYPES.SOI_INTERCEPT);
      if (pathEdges.has(edgeId(loNodeId, mSoiId))  || pathEdges.has(edgeId(mSoiId, loNodeId)) ||
          pathEdges.has(edgeId(ellNodeId, mSoiId)) || pathEdges.has(edgeId(mSoiId, ellNodeId))) {
        set.add(htKey);
      }
    }
    return set;
  }, [pathEdges]);

  /**
   * Maps each visible Hohmann arc key to the clip side ('left'|'right').
   * Mirrors `getSideForBody`, keyed by the parent planet.
   */
  const hohmannClipSide = useMemo(() => {
    const map = {};
    if (!hohmannTransfers) return map;
    for (const htKey of Object.keys(hohmannTransfers)) {
      if (!visibleHohmann.has(htKey)) continue;
      const [planetId] = htKey.split(':');
      map[htKey] = getSideForBody(planetId);
    }
    return map;
  }, [visibleHohmann, getSideForBody]);

  /**
   * Maps each planet that has at least one visible Hohmann arc to the half of
   * its low-orbit ring that should be highlighted cyan.
   * When arcs exist on both sides the full ring is highlighted ('both').
   */
  const lowOrbitHighlight = useMemo(() => {
    const map = {};
    if (!hohmannTransfers) return map;
    for (const htKey of Object.keys(hohmannTransfers)) {
      if (!visibleHohmann.has(htKey)) continue;
      const [planetId] = htKey.split(':');
      const side     = hohmannClipSide[htKey] ?? getSideForBody(planetId);
      const opposite = side === 'right' ? 'left' : 'right';
      if (!map[planetId]) map[planetId] = opposite;
      else if (map[planetId] !== opposite) map[planetId] = 'both';
    }
    return map;
  }, [visibleHohmann, hohmannClipSide, getSideForBody]);

  /**
   * Cycles through origin → destination → reset.
   *  • First click: set origin.
   *  • Second click (different node): set destination and trigger pathfinding.
   *  • Any further click: restart with the clicked node as the new origin.
   */
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

  /** Resets all selection and pathfinding state. */
  const clearSelection = useCallback(() => {
    setStartNode(null);
    setEndNode(null);
  }, []);

  /**
   * Returns the visual status of a node for styling purposes.
   * @param {string} nid
   * @returns {'start'|'end'|'path'|'default'}
   */
  const nodeStatus = useCallback((nid) => {
    if (nid === startNode) return 'start';
    if (nid === endNode) return 'end';
    if (mission?.path.includes(nid)) return 'path';
    // SOI_INTERCEPT and ELLIPTICAL_ORBIT share the same map position for planets
    // that have an elliptical orbit node. If the elliptical orbit is on the path,
    // treat the co-located SOI diamond as on-path too.
    const { bodyId, nodeType } = parseNodeId(nid);
    if (nodeType === NODE_TYPES.SOI_INTERCEPT) {
      const ellId = nodeId(bodyId, NODE_TYPES.ELLIPTICAL_ORBIT);
      if (mission?.path.includes(ellId)) return 'path';
    }
    return 'default';
  }, [startNode, endNode, mission]);

  /**
   * Maps a node status to its neon highlight color, falling back to the body's
   * own color (or neutral gray) when the node is not on the active route.
   * @param {'start'|'end'|'path'|'default'} st
   * @param {string} [bodyColor]
   * @returns {string} CSS color value
   */
  const nodeColor = useCallback((st, bodyColor) => {
    if (st === 'start') return '#00ff88';
    if (st === 'end')   return '#ff4488';
    if (st === 'path')  return '#00ffff';
    return bodyColor || '#6b7280';
  }, []);

  return {
    startNode,
    endNode,
    mission,
    pathEdges,
    nodesOnPath,
    ellipseClipSide,
    visibleHohmann,
    hohmannClipSide,
    lowOrbitHighlight,
    handleNodeClick,
    clearSelection,
    nodeStatus,
    nodeColor,
  };
}
