/**
 * Dijkstra's algorithm — generic weighted shortest-path implementation.
 *
 * The algorithm operates on a plain adjacency-list graph (see the Graph typedef
 * below) and has no knowledge of KSP bodies, node types, or delta-v semantics.
 * That separation means the same function can be reused for any future system
 * dataset (Sol, Outer Planets Mod, etc.) by simply passing a different graph.
 *
 * Time complexity: O((V + E) log V) with a binary heap; this implementation
 * uses Array#sort as a simple priority queue, which is O(E log E) — acceptable
 * for the small graphs used here (<100 nodes).
 */
import { buildGraph, getNodeLabel } from '../data/systemData';

/**
 * @typedef {{ node: string, deltaV: number, aerobrake?: boolean, planeChange?: boolean, label?: string }} GraphEdge
 * @typedef {{ [nodeId: string]: GraphEdge[] }} Graph
 */

/**
 * Finds the minimum delta-v path between two nodes using Dijkstra's algorithm.
 *
 * @param {string} startNode  - Origin node ID (e.g. 'kerbin:SURFACE')
 * @param {string} endNode    - Destination node ID
 * @param {Graph}  [graph]    - Adjacency list to search; defaults to the full
 *                              Kerbol system graph so callers need not build it.
 * @returns {{ path: string[], legs: object[], totalDeltaV: number, totalPlaneChange: number } | null}
 *   Returns null if no path exists between the two nodes.
 */
export function dijkstra(startNode, endNode, graph = buildGraph()) {
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
      planeChange: edge.planeChange === null ? 0 : edge.planeChange,
      label: edge.label,
    });
  }

  return {
    path,
    legs,
    totalDeltaV: distances[endNode],
    totalPlaneChange: legs.reduce((sum, leg) => sum + (leg.planeChange || 0), 0),
  };
}

// Get all edge IDs that are part of a path, in traversal direction (directed).
export function getPathEdgeIds(path) {
  if (!path) return new Set();
  const edgeIds = new Set();
  for (let i = 0; i < path.length - 1; i++) {
    edgeIds.add(`${path[i]}|${path[i + 1]}`);
  }
  return edgeIds;
}

// Returns a directed edge ID: "from|to" in the order given.
export function edgeId(from, to) {
  return `${from}|${to}`;
}
