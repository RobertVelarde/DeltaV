// Kerbol System Data - Physical constants, orbital data, and delta-v graph edges
// Based on the KSP Delta-V Subway Map

export const NODE_TYPES = {
  SURFACE: 'SURFACE',
  LOW_ORBIT: 'LOW_ORBIT',
  SOI_INTERCEPT: 'SOI_INTERCEPT',
};

export const bodies = {
  kerbol: {
    name: 'Kerbol',
    type: 'star',
    radius: 261600,
    gravity: 17.1,
    color: '#ffdd44',
    parent: null,
    semiMajorAxis: 0,
    atmosphere: 600,
    lowOrbit: null,
    soiRadius: null,
    displayRadius: 100,
  },
  moho: {
    name: 'Moho',
    type: 'planet',
    radius: 250,
    gravity: 2.70,
    color: '#c47832',
    parent: 'kerbol',
    semiMajorAxis: 5263138,
    atmosphere: 0,
    lowOrbit: 50,
    soiRadius: 9646,
    displayRadius: 8,
    moons: [],
  },
  eve: {
    name: 'Eve',
    type: 'planet',
    radius: 700,
    gravity: 16.7,
    color: '#9b3dbb',
    parent: 'kerbol',
    semiMajorAxis: 9832684,
    atmosphere: 90,
    lowOrbit: 100,
    soiRadius: 85109,
    displayRadius: 14,
    moons: ['gilly'],
  },
  gilly: {
    name: 'Gilly',
    type: 'moon',
    radius: 13,
    gravity: 0.049,
    color: '#8b7355',
    parent: 'eve',
    semiMajorAxis: 31500,
    atmosphere: 0,
    lowOrbit: 10,
    soiRadius: 126,
    displayRadius: 4,
  },
  kerbin: {
    name: 'Kerbin',
    type: 'planet',
    radius: 600,
    gravity: 9.81,
    color: '#3dbb6f',
    parent: 'kerbol',
    semiMajorAxis: 13599840,
    atmosphere: 70,
    lowOrbit: 80,
    soiRadius: 84159,
    displayRadius: 13,
    moons: ['mun', 'minmus'],
  },
  mun: {
    name: 'Mun',
    type: 'moon',
    radius: 200,
    gravity: 1.63,
    color: '#9b9b9b',
    parent: 'kerbin',
    semiMajorAxis: 12000,
    atmosphere: 0,
    lowOrbit: 14,
    soiRadius: 2430,
    displayRadius: 7,
  },
  minmus: {
    name: 'Minmus',
    type: 'moon',
    radius: 60,
    gravity: 0.491,
    color: '#66ddbb',
    parent: 'kerbin',
    semiMajorAxis: 47000,
    atmosphere: 0,
    lowOrbit: 10,
    soiRadius: 2247,
    displayRadius: 5,
  },
  duna: {
    name: 'Duna',
    type: 'planet',
    radius: 320,
    gravity: 2.94,
    color: '#dd5533',
    parent: 'kerbol',
    semiMajorAxis: 20726155,
    atmosphere: 50,
    lowOrbit: 60,
    soiRadius: 47922,
    displayRadius: 10,
    moons: ['ike'],
  },
  ike: {
    name: 'Ike',
    type: 'moon',
    radius: 130,
    gravity: 1.10,
    color: '#7b7b7b',
    parent: 'duna',
    semiMajorAxis: 3200,
    atmosphere: 0,
    lowOrbit: 50,
    soiRadius: 1050,
    displayRadius: 6,
  },
  dres: {
    name: 'Dres',
    type: 'planet',
    radius: 138,
    gravity: 1.13,
    color: '#8a8a7b',
    parent: 'kerbol',
    semiMajorAxis: 40839348,
    atmosphere: 0,
    lowOrbit: 12,
    soiRadius: 32833,
    displayRadius: 6,
    moons: [],
  },
  jool: {
    name: 'Jool',
    type: 'planet',
    radius: 6000,
    gravity: 7.85,
    color: '#55cc55',
    parent: 'kerbol',
    semiMajorAxis: 68773560,
    atmosphere: 200,
    lowOrbit: 210,
    soiRadius: 2455985,
    displayRadius: 22,
    moons: ['laythe', 'vall', 'tylo', 'bop', 'pol'],
  },
  laythe: {
    name: 'Laythe',
    type: 'moon',
    radius: 500,
    gravity: 7.85,
    color: '#3388cc',
    parent: 'jool',
    semiMajorAxis: 27184,
    atmosphere: 50,
    lowOrbit: 60,
    soiRadius: 3724,
    displayRadius: 9,
  },
  vall: {
    name: 'Vall',
    type: 'moon',
    radius: 300,
    gravity: 2.31,
    color: '#7799bb',
    parent: 'jool',
    semiMajorAxis: 43152,
    atmosphere: 0,
    lowOrbit: 15,
    soiRadius: 2406,
    displayRadius: 7,
  },
  tylo: {
    name: 'Tylo',
    type: 'moon',
    radius: 600,
    gravity: 7.85,
    color: '#aa9988',
    parent: 'jool',
    semiMajorAxis: 68500,
    atmosphere: 0,
    lowOrbit: 25,
    soiRadius: 10856,
    displayRadius: 10,
  },
  bop: {
    name: 'Bop',
    type: 'moon',
    radius: 65,
    gravity: 0.589,
    color: '#665544',
    parent: 'jool',
    semiMajorAxis: 128500,
    atmosphere: 0,
    lowOrbit: 25,
    soiRadius: 993,
    displayRadius: 4,
  },
  pol: {
    name: 'Pol',
    type: 'moon',
    radius: 44,
    gravity: 0.373,
    color: '#ccbb55',
    parent: 'jool',
    semiMajorAxis: 179890,
    atmosphere: 0,
    lowOrbit: 10,
    soiRadius: 1042,
    displayRadius: 4,
  },
  eeloo: {
    name: 'Eeloo',
    type: 'planet',
    radius: 210,
    gravity: 1.69,
    color: '#aaddee',
    parent: 'kerbol',
    semiMajorAxis: 90118820,
    atmosphere: 0,
    lowOrbit: 10,
    soiRadius: 119083,
    displayRadius: 7,
    moons: [],
  },
};

// Planet order along the ecliptic line (left to right)
export const planetOrder = ['moho', 'eve', 'kerbin', 'duna', 'dres', 'jool', 'eeloo'];

// Node ID helpers
export function nodeId(bodyId, nodeType) {
  return `${bodyId}:${nodeType}`;
}

export function parseNodeId(id) {
  const [bodyId, nodeType] = id.split(':');
  return { bodyId, nodeType };
}

export function getNodeLabel(id) {
  const { bodyId, nodeType } = parseNodeId(id);
  const body = bodies[bodyId];
  if (!body) return id;
  switch (nodeType) {
    case NODE_TYPES.SURFACE: return `${body.name} Surface`;
    case NODE_TYPES.LOW_ORBIT: return `${body.name} Low Orbit (${body.lowOrbit}km)`;
    case NODE_TYPES.SOI_INTERCEPT: return `${body.name} SOI`;
    default: return id;
  }
}

// Delta-V graph edges (m/s) - bidirectional
// Based on KSP community delta-v map
export const edges = [
  // === KERBIN SYSTEM ===
  { from: 'kerbin:SURFACE', to: 'kerbin:LOW_ORBIT', deltaV: 3400, aerobrake: true, label: 'Launch' },
  { from: 'kerbin:LOW_ORBIT', to: 'mun:SOI_INTERCEPT', deltaV: 860, aerobrake: false, label: 'Transfer' },
  { from: 'mun:SOI_INTERCEPT', to: 'mun:LOW_ORBIT', deltaV: 310, aerobrake: false, label: 'Capture' },
  { from: 'mun:LOW_ORBIT', to: 'mun:SURFACE', deltaV: 580, aerobrake: false, label: 'Land' },
  { from: 'kerbin:LOW_ORBIT', to: 'minmus:SOI_INTERCEPT', deltaV: 930, aerobrake: false, planeChange: true, label: 'Transfer' },
  { from: 'minmus:SOI_INTERCEPT', to: 'minmus:LOW_ORBIT', deltaV: 160, aerobrake: false, label: 'Capture' },
  { from: 'minmus:LOW_ORBIT', to: 'minmus:SURFACE', deltaV: 180, aerobrake: false, label: 'Land' },

  // === KERBIN ESCAPE / INTERPLANETARY ===
  { from: 'kerbin:LOW_ORBIT', to: 'kerbin:SOI_INTERCEPT', deltaV: 950, aerobrake: false, label: 'Escape' },

  // === MOHO ===
  { from: 'kerbin:SOI_INTERCEPT', to: 'moho:SOI_INTERCEPT', deltaV: 760, aerobrake: false, planeChange: true, label: 'Transfer' },
  { from: 'moho:SOI_INTERCEPT', to: 'moho:LOW_ORBIT', deltaV: 2410, aerobrake: false, label: 'Capture' },
  { from: 'moho:LOW_ORBIT', to: 'moho:SURFACE', deltaV: 870, aerobrake: false, label: 'Land' },

  // === EVE SYSTEM ===
  { from: 'kerbin:SOI_INTERCEPT', to: 'eve:SOI_INTERCEPT', deltaV: 90, aerobrake: false, label: 'Transfer' },
  { from: 'eve:SOI_INTERCEPT', to: 'eve:LOW_ORBIT', deltaV: 1330, aerobrake: true, label: 'Capture' },
  { from: 'eve:LOW_ORBIT', to: 'eve:SURFACE', deltaV: 8000, aerobrake: true, label: 'Land' },
  { from: 'eve:LOW_ORBIT', to: 'gilly:SOI_INTERCEPT', deltaV: 60, aerobrake: false, label: 'Transfer' },
  { from: 'gilly:SOI_INTERCEPT', to: 'gilly:LOW_ORBIT', deltaV: 10, aerobrake: false, label: 'Capture' },
  { from: 'gilly:LOW_ORBIT', to: 'gilly:SURFACE', deltaV: 30, aerobrake: false, label: 'Land' },

  // === DUNA SYSTEM ===
  { from: 'kerbin:SOI_INTERCEPT', to: 'duna:SOI_INTERCEPT', deltaV: 130, aerobrake: false, label: 'Transfer' },
  { from: 'duna:SOI_INTERCEPT', to: 'duna:LOW_ORBIT', deltaV: 250, aerobrake: true, label: 'Capture' },
  { from: 'duna:LOW_ORBIT', to: 'duna:SURFACE', deltaV: 1450, aerobrake: true, label: 'Land' },
  { from: 'duna:LOW_ORBIT', to: 'ike:SOI_INTERCEPT', deltaV: 30, aerobrake: false, label: 'Transfer' },
  { from: 'ike:SOI_INTERCEPT', to: 'ike:LOW_ORBIT', deltaV: 180, aerobrake: false, label: 'Capture' },
  { from: 'ike:LOW_ORBIT', to: 'ike:SURFACE', deltaV: 390, aerobrake: false, label: 'Land' },

  // === DRES ===
  { from: 'kerbin:SOI_INTERCEPT', to: 'dres:SOI_INTERCEPT', deltaV: 610, aerobrake: false, planeChange: true, label: 'Transfer' },
  { from: 'dres:SOI_INTERCEPT', to: 'dres:LOW_ORBIT', deltaV: 1290, aerobrake: false, label: 'Capture' },
  { from: 'dres:LOW_ORBIT', to: 'dres:SURFACE', deltaV: 430, aerobrake: false, label: 'Land' },

  // === JOOL SYSTEM ===
  { from: 'kerbin:SOI_INTERCEPT', to: 'jool:SOI_INTERCEPT', deltaV: 980, aerobrake: false, label: 'Transfer' },
  { from: 'jool:SOI_INTERCEPT', to: 'jool:LOW_ORBIT', deltaV: 2810, aerobrake: true, label: 'Capture' },
  { from: 'jool:LOW_ORBIT', to: 'laythe:SOI_INTERCEPT', deltaV: 930, aerobrake: false, label: 'Transfer' },
  { from: 'laythe:SOI_INTERCEPT', to: 'laythe:LOW_ORBIT', deltaV: 1070, aerobrake: true, label: 'Capture' },
  { from: 'laythe:LOW_ORBIT', to: 'laythe:SURFACE', deltaV: 2900, aerobrake: true, label: 'Land' },
  { from: 'jool:LOW_ORBIT', to: 'vall:SOI_INTERCEPT', deltaV: 620, aerobrake: false, label: 'Transfer' },
  { from: 'vall:SOI_INTERCEPT', to: 'vall:LOW_ORBIT', deltaV: 910, aerobrake: false, label: 'Capture' },
  { from: 'vall:LOW_ORBIT', to: 'vall:SURFACE', deltaV: 860, aerobrake: false, label: 'Land' },
  { from: 'jool:LOW_ORBIT', to: 'tylo:SOI_INTERCEPT', deltaV: 400, aerobrake: false, label: 'Transfer' },
  { from: 'tylo:SOI_INTERCEPT', to: 'tylo:LOW_ORBIT', deltaV: 1100, aerobrake: false, label: 'Capture' },
  { from: 'tylo:LOW_ORBIT', to: 'tylo:SURFACE', deltaV: 2270, aerobrake: false, label: 'Land' },
  { from: 'jool:LOW_ORBIT', to: 'bop:SOI_INTERCEPT', deltaV: 220, aerobrake: false, planeChange: true, label: 'Transfer' },
  { from: 'bop:SOI_INTERCEPT', to: 'bop:LOW_ORBIT', deltaV: 900, aerobrake: false, label: 'Capture' },
  { from: 'bop:LOW_ORBIT', to: 'bop:SURFACE', deltaV: 220, aerobrake: false, label: 'Land' },
  { from: 'jool:LOW_ORBIT', to: 'pol:SOI_INTERCEPT', deltaV: 160, aerobrake: false, planeChange: true, label: 'Transfer' },
  { from: 'pol:SOI_INTERCEPT', to: 'pol:LOW_ORBIT', deltaV: 820, aerobrake: false, label: 'Capture' },
  { from: 'pol:LOW_ORBIT', to: 'pol:SURFACE', deltaV: 130, aerobrake: false, label: 'Land' },

  // === EELOO ===
  { from: 'kerbin:SOI_INTERCEPT', to: 'eeloo:SOI_INTERCEPT', deltaV: 1140, aerobrake: false, planeChange: true, label: 'Transfer' },
  { from: 'eeloo:SOI_INTERCEPT', to: 'eeloo:LOW_ORBIT', deltaV: 1370, aerobrake: false, label: 'Capture' },
  { from: 'eeloo:LOW_ORBIT', to: 'eeloo:SURFACE', deltaV: 620, aerobrake: false, label: 'Land' },
];

// Build adjacency list (bidirectional graph)
export function buildGraph() {
  const graph = {};
  for (const edge of edges) {
    if (!graph[edge.from]) graph[edge.from] = [];
    if (!graph[edge.to]) graph[edge.to] = [];
    graph[edge.from].push({ node: edge.to, deltaV: edge.deltaV, aerobrake: edge.aerobrake, planeChange: edge.planeChange, label: edge.label });
    graph[edge.to].push({ node: edge.from, deltaV: edge.deltaV, aerobrake: edge.aerobrake, planeChange: edge.planeChange, label: edge.label });
  }
  return graph;
}

// Get all unique node IDs from the graph
export function getAllNodes() {
  const nodes = new Set();
  for (const edge of edges) {
    nodes.add(edge.from);
    nodes.add(edge.to);
  }
  return Array.from(nodes);
}
