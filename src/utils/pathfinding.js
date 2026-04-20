// Dijkstra's algorithm for finding optimal delta-v paths
import { buildGraph, parseNodeId, getNodeLabel, edges as allEdges } from '../data/systemData';

export function dijkstra(startNode, endNode) {
  const graph = buildGraph();

  if (!graph[startNode] || !graph[endNode]) {
    return null;
  }

  const distances = {};
  const previous = {};
  const edgeUsed = {};
  const visited = new Set();
  const queue = [];

  // Initialize
  for (const node of Object.keys(graph)) {
    distances[node] = Infinity;
    previous[node] = null;
    edgeUsed[node] = null;
  }
  distances[startNode] = 0;
  queue.push({ node: startNode, distance: 0 });

  while (queue.length > 0) {
    // Get node with smallest distance
    queue.sort((a, b) => a.distance - b.distance);
    const { node: current } = queue.shift();

    if (visited.has(current)) continue;
    visited.add(current);

    if (current === endNode) break;

    for (const neighbor of graph[current]) {
      if (visited.has(neighbor.node)) continue;

      const newDist = distances[current] + neighbor.deltaV;
      if (newDist < distances[neighbor.node]) {
        distances[neighbor.node] = newDist;
        previous[neighbor.node] = current;
        edgeUsed[neighbor.node] = neighbor;
        queue.push({ node: neighbor.node, distance: newDist });
      }
    }
  }

  if (distances[endNode] === Infinity) {
    return null;
  }

  // Reconstruct path
  const path = [];
  let current = endNode;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  // Build legs
  const legs = [];
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edge = edgeUsed[to];
    legs.push({
      from,
      to,
      fromLabel: getNodeLabel(from),
      toLabel: getNodeLabel(to),
      deltaV: edge.deltaV,
      aerobrake: edge.aerobrake,
      planeChange: edge.planeChange,
      label: edge.label,
    });
  }

  return {
    path,
    legs,
    totalDeltaV: distances[endNode],
  };
}

// Get all edge IDs that are part of a path
export function getPathEdgeIds(path) {
  if (!path) return new Set();
  const edgeIds = new Set();
  for (let i = 0; i < path.length - 1; i++) {
    // Edge ID is sorted pair
    const a = path[i];
    const b = path[i + 1];
    edgeIds.add(a < b ? `${a}|${b}` : `${b}|${a}`);
  }
  return edgeIds;
}

export function edgeId(from, to) {
  return from < to ? `${from}|${to}` : `${to}|${from}`;
}
