// Kerbol System Data - Physical constants, orbital data, and delta-v graph edges
// Based on the KSP Delta-V Subway Map

export const NODE_TYPES = {
  SURFACE: 'SURFACE',
  LOW_ORBIT: 'LOW_ORBIT',
  ELLIPTICAL_ORBIT: 'ELLIPTICAL_ORBIT',
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
    lowOrbit: 610,
    soiRadius: null,
    displayRadius: 100,
    isMoon: false,
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
    lowOrbit: 20,
    soiRadius: 9646,
    displayRadius: 8,
    moons: [],
    isMoon: false,
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
    isMoon: false,
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
    isMoon: true,
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
    isMoon: false,
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
    isMoon: true,
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
    isMoon: true,
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
    isMoon: false,
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
    isMoon: true,
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
    isMoon: false,
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
    isMoon: false,
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
    isMoon: true,
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
    isMoon: true,
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
    isMoon: true,
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
    isMoon: true,
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
    isMoon: true,
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
    isMoon: false,
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
    case NODE_TYPES.ELLIPTICAL_ORBIT: return `${body.name} Elliptical Orbit`;
    default: return id;
  }
}

// Delta-V graph edges (m/s) - unidirectional
// Based on KSP community delta-v map
export const edges = [
  // === KERBIN SYSTEM ===
  { from: 'kerbin:SURFACE', to: 'kerbin:LOW_ORBIT', deltaV: 3400, aerobrake: false, label: 'Launch to Low Orbit over Kerbin' },
  { from: 'kerbin:LOW_ORBIT', to: 'kerbin:SURFACE', deltaV: 3400, aerobrake: true, label: 'Land on Kerbin' },

  // Kerbin to Mun and back
  { from: 'kerbin:LOW_ORBIT', to: 'mun:SOI_INTERCEPT', deltaV: 860, aerobrake: false, label: 'Hohmann Transfer to Mun' },
  { from: 'mun:SOI_INTERCEPT', to: 'mun:LOW_ORBIT', deltaV: 310, aerobrake: false, label: 'Low-Orbit Insertion on Mun' },
  { from: 'mun:LOW_ORBIT', to: 'mun:SURFACE', deltaV: 580, aerobrake: false, label: 'Land on Mun' },
  { from: 'mun:SURFACE', to: 'mun:LOW_ORBIT', deltaV: 580, aerobrake: false, label: 'Launch to Low Orbit over Mun' },
  { from: 'mun:LOW_ORBIT', to: 'mun:SOI_INTERCEPT', deltaV: 310, aerobrake: false, label: 'Escape from Mun' },
  { from: 'mun:SOI_INTERCEPT', to: 'kerbin:LOW_ORBIT', deltaV: 860, aerobrake: false, label: 'Low Orbit Insertion on Kerbin' },

  // Kerbin to Minmus and back
  { from: 'kerbin:LOW_ORBIT', to: 'minmus:SOI_INTERCEPT', deltaV: 930, aerobrake: false, planeChange: 340, label: 'Hohmann Transfer to Minmus' },
  { from: 'minmus:SOI_INTERCEPT', to: 'minmus:LOW_ORBIT', deltaV: 160, aerobrake: false, label: 'Low-Orbit Insertion on Minmus' },
  { from: 'minmus:LOW_ORBIT', to: 'minmus:SURFACE', deltaV: 180, aerobrake: false, label: 'Land on Minmus' },
  { from: 'minmus:SURFACE', to: 'minmus:LOW_ORBIT', deltaV: 180, aerobrake: false, label: 'Launch to Low Orbit over Minmus' },
  { from: 'minmus:LOW_ORBIT', to: 'minmus:SOI_INTERCEPT', deltaV: 160, aerobrake: false, label: 'Escape from Minmus' },
  { from: 'minmus:SOI_INTERCEPT', to: 'kerbin:LOW_ORBIT', deltaV: 930, aerobrake: true, planeChange: 340, label: 'Low Orbit Insertion on Kerbin' },

  // === KERBIN ESCAPE / INTERPLANETARY ===
  { from: 'kerbin:LOW_ORBIT', to: 'kerbin:ELLIPTICAL_ORBIT', deltaV: 950, aerobrake: false, label: 'Raise Orbit to Elliptical-Orbit over Kerbin' },
  { from: 'kerbin:ELLIPTICAL_ORBIT', to: 'kerbin:LOW_ORBIT', deltaV: 950, aerobrake: true, label: 'Lower Orbit to Low-Orbit over Kerbin' },

  // === MOHO ===
  { from: 'kerbin:ELLIPTICAL_ORBIT', to: 'moho:SOI_INTERCEPT', deltaV: 760, aerobrake: false, planeChange: 2520, label: 'Heliocentric Transfer to Moho' },
  { from: 'moho:SOI_INTERCEPT', to: 'moho:LOW_ORBIT', deltaV: 2410, aerobrake: false, label: 'Low-Orbit Insertion on Moho' },
  { from: 'moho:LOW_ORBIT', to: 'moho:SURFACE', deltaV: 870, aerobrake: false, label: 'Land on Moho' },
  { from: 'moho:SURFACE', to: 'moho:LOW_ORBIT', deltaV: 870, aerobrake: false, label: 'Launch to Low-Orbit over Moho' },
  { from: 'moho:LOW_ORBIT', to: 'moho:SOI_INTERCEPT', deltaV: 2410, aerobrake: false, label: 'Escape from Moho' },
  { from: 'moho:SOI_INTERCEPT', to: 'kerbin:ELLIPTICAL_ORBIT', deltaV: 760, aerobrake: false, planeChange: 2520, label: 'Elliptical-Orbit Insertion on Kerbin' },

  // === EVE SYSTEM ===
  // Eve
  { from: 'kerbin:ELLIPTICAL_ORBIT', to: 'eve:SOI_INTERCEPT', deltaV: 90, aerobrake: false, planeChange: 430, label: 'Heliocentric Transfer to Eve' },
  { from: 'eve:SOI_INTERCEPT', to: 'eve:ELLIPTICAL_ORBIT', deltaV: 80, aerobrake: true, label: 'Elliptical-Orbit Insertion on Eve' },
  { from: 'eve:ELLIPTICAL_ORBIT', to: 'eve:LOW_ORBIT', deltaV: 1330, aerobrake: true, label: 'Lower Orbit to Low-Orbit over Eve' },
  { from: 'eve:SOI_INTERCEPT', to: 'eve:LOW_ORBIT', deltaV: 1410, aerobrake: true, label: 'Low-Orbit Insertion on Eve' },
  { from: 'eve:LOW_ORBIT', to: 'eve:SURFACE', deltaV: 8000, aerobrake: true, label: 'Land on Eve' },
  { from: 'eve:SURFACE', to: 'eve:LOW_ORBIT', deltaV: 8000, aerobrake: false, label: 'Launch to Low-Orbit over Eve' },
  { from: 'eve:LOW_ORBIT', to: 'eve:SOI_INTERCEPT', deltaV: 1410, aerobrake: false, label: 'Escape from Eve' },
  { from: 'eve:LOW_ORBIT', to: 'eve:ELLIPTICAL_ORBIT', deltaV: 1330, aerobrake: false, label: 'Raise Orbit to Elliptical Orbit over Eve' },
  { from: 'eve:ELLIPTICAL_ORBIT', to: 'eve:SOI_INTERCEPT', deltaV: 80, aerobrake: false, label: 'Escape from Eve' },
  { from: 'eve:SOI_INTERCEPT', to: 'kerbin:ELLIPTICAL_ORBIT', deltaV: 90, aerobrake: false, planeChange: 430, label: 'Heliocentric Transfer to Kerbin' },

  // Gilly
  { from: 'eve:ELLIPTICAL_ORBIT', to: 'gilly:SOI_INTERCEPT', deltaV: 60, aerobrake: false, label: 'Hohmann Transfer to Gilly' },
  { from: 'gilly:SOI_INTERCEPT', to: 'gilly:LOW_ORBIT', deltaV: 410, aerobrake: false, label: 'Low-Orbit Insertion on Gilly' },
  { from: 'gilly:LOW_ORBIT', to: 'gilly:SURFACE', deltaV: 30, aerobrake: false, label: 'Land on Gilly' },
  { from: 'gilly:SURFACE', to: 'gilly:LOW_ORBIT', deltaV: 30, aerobrake: false, label: 'Launch to Low Orbit over Gilly' },
  { from: 'gilly:LOW_ORBIT', to: 'gilly:SOI_INTERCEPT', deltaV: 410, aerobrake: false, label: 'Escape from Gilly' },
  { from: 'gilly:SOI_INTERCEPT', to: 'eve:ELLIPTICAL_ORBIT', deltaV: 60, aerobrake: false, label: 'Elliptical-Orbit Insertion on Eve' },

  // === DUNA SYSTEM ===
  // Duna
  { from: 'kerbin:ELLIPTICAL_ORBIT', to: 'duna:SOI_INTERCEPT', deltaV: 130, aerobrake: false, planeChange: 10, label: 'Heliocentric Transfer to Duna' },
  { from: 'duna:SOI_INTERCEPT', to: 'duna:ELLIPTICAL_ORBIT', deltaV: 250, aerobrake: true, label: 'Elliptical-Orbit Insertion on Duna' },
  { from: 'duna:ELLIPTICAL_ORBIT', to: 'duna:LOW_ORBIT', deltaV: 360, aerobrake: true, label: 'Lower Orbit to Low-Orbit over Duna' },
  { from: 'duna:SOI_INTERCEPT', to: 'duna:LOW_ORBIT', deltaV: 610, aerobrake: true, label: 'Low-Orbit Insertion on over Duna' },
  { from: 'duna:LOW_ORBIT', to: 'duna:SURFACE', deltaV: 1450, aerobrake: true, label: 'Land on Duna' },
  { from: 'duna:SURFACE', to: 'duna:LOW_ORBIT', deltaV: 1450, aerobrake: false, label: 'Launch to Low-Orbit over Duna' },
  { from: 'duna:LOW_ORBIT', to: 'duna:SOI_INTERCEPT', deltaV: 610, aerobrake: false, label: 'Escape from Duna' },
  { from: 'duna:LOW_ORBIT', to: 'duna:ELLIPTICAL_ORBIT', deltaV: 360, aerobrake: false, label: 'Raise Orbit to Elliptical-Orbit over Duna' },
  { from: 'duna:ELLIPTICAL_ORBIT', to: 'duna:SOI_INTERCEPT', deltaV: 250, aerobrake: false, label: 'Escape from Duna' },
  { from: 'duna:SOI_INTERCEPT', to: 'kerbin:ELLIPTICAL_ORBIT', deltaV: 130, aerobrake: true, planeChange: 10, label: 'Elliptical-Orbit Insertion on Kerbin' },

  // Ike
  { from: 'duna:ELLIPTICAL_ORBIT', to: 'ike:SOI_INTERCEPT', deltaV: 30, aerobrake: false, label: 'Hohmann Transfer to Ike' },
  { from: 'ike:SOI_INTERCEPT', to: 'ike:LOW_ORBIT', deltaV: 180, aerobrake: false, label: 'Low-Orbit Insertion on Ike' },
  { from: 'ike:LOW_ORBIT', to: 'ike:SURFACE', deltaV: 390, aerobrake: false, label: 'Land on Ike' },
  { from: 'ike:SURFACE', to: 'ike:LOW_ORBIT', deltaV: 390, aerobrake: false, label: 'Launch to Low-Orbit over Ike' },
  { from: 'ike:LOW_ORBIT', to: 'ike:SOI_INTERCEPT', deltaV: 180, aerobrake: false, label: 'Escape from Ike' },
  { from: 'ike:SOI_INTERCEPT', to: 'duna:ELLIPTICAL_ORBIT', deltaV: 30, aerobrake: false, label: 'Elliptical-Orbit Insertion on Duna' },

  // === DRES ===
  { from: 'kerbin:ELLIPTICAL_ORBIT', to: 'dres:SOI_INTERCEPT', deltaV: 610, aerobrake: false, planeChange: 1010, label: 'Heliocentric Transfer to Dres' },
  { from: 'dres:SOI_INTERCEPT', to: 'dres:LOW_ORBIT', deltaV: 1290, aerobrake: false, label: 'Low-Orbit Insertion on Dres' },
  { from: 'dres:LOW_ORBIT', to: 'dres:SURFACE', deltaV: 430, aerobrake: false, label: 'Land on Dres' },
  { from: 'dres:SURFACE', to: 'dres:LOW_ORBIT', deltaV: 430, aerobrake: false, label: 'Launch to Low-Orbit over Dres' },
  { from: 'dres:LOW_ORBIT', to: 'dres:SOI_INTERCEPT', deltaV: 1290, aerobrake: false, label: 'Escape from Dres' },
  { from: 'dres:SOI_INTERCEPT', to: 'kerbin:ELLIPTICAL_ORBIT', deltaV: 610, aerobrake: true, planeChange: 1010, label: 'Elliptical-Orbit Insertion on Kerbin' },

  // === JOOL SYSTEM ===
  { from: 'kerbin:ELLIPTICAL_ORBIT', to: 'jool:SOI_INTERCEPT', deltaV: 980, aerobrake: false, planeChange: 270, label: 'Heliocentric Transfer to Jool' },
  { from: 'jool:SOI_INTERCEPT', to: 'jool:ELLIPTICAL_ORBIT', deltaV: 160, aerobrake: true, label: 'Elliptical-Orbit Insertion on Jool' },
  { from: 'jool:ELLIPTICAL_ORBIT', to: 'jool:SOI_INTERCEPT', deltaV: 160, aerobrake: false, label: 'Escape from Jool' },
  { from: 'jool:SOI_INTERCEPT', to: 'kerbin:ELLIPTICAL_ORBIT', deltaV: 980, aerobrake: true, planeChange: 270, label: 'Elliptical-Orbit Insertion on Kerbin' },

  // Jool
  { from: 'jool:ELLIPTICAL_ORBIT', to: 'jool:LOW_ORBIT', deltaV: 2810, aerobrake: true, label: 'Lower Orbit to Low-Orbit over Jool' },
  { from: 'jool:SOI_INTERCEPT', to: 'jool:LOW_ORBIT', deltaV: 2970, aerobrake: true, label: 'Low-Orbit Insertion on Jool' },
  { from: 'jool:LOW_ORBIT', to: 'jool:SURFACE', deltaV: 14000, aerobrake: true, label: 'Land on Jool' },
  { from: 'jool:SURFACE', to: 'jool:LOW_ORBIT', deltaV: 14000, aerobrake: false, label: 'Launch to Low-Orbit over Jool' },
  { from: 'jool:LOW_ORBIT', to: 'jool:SOI_INTERCEPT', deltaV: 2970, aerobrake: false, label: 'Escape from Jool' },
  { from: 'jool:LOW_ORBIT', to: 'jool:ELLIPTICAL_ORBIT', deltaV: 2810, aerobrake: false, label: 'Raise Orbit to Elliptical-Orbit over Jool' },

  // Laythe
  { from: 'jool:ELLIPTICAL_ORBIT', to: 'laythe:SOI_INTERCEPT', deltaV: 930, aerobrake: false, label: 'Hohmann Transfer to Laythe' },
  { from: 'laythe:SOI_INTERCEPT', to: 'laythe:LOW_ORBIT', deltaV: 1070, aerobrake: true, label: 'Low-Orbit Insertion on Laythe' },
  { from: 'laythe:LOW_ORBIT', to: 'laythe:SURFACE', deltaV: 2900, aerobrake: true, label: 'Land on Laythe' },
  { from: 'laythe:SURFACE', to: 'laythe:LOW_ORBIT', deltaV: 2900, aerobrake: false, label: 'Launch to Low-Orbit over Laythe' },
  { from: 'laythe:LOW_ORBIT', to: 'laythe:SOI_INTERCEPT', deltaV: 1070, aerobrake: false, label: 'Escape from Laythe' },
  { from: 'laythe:SOI_INTERCEPT', to: 'jool:ELLIPTICAL_ORBIT', deltaV: 930, aerobrake: false, label: 'Elliptical-Orbit Insertion on Jool' },

  // Vall
  { from: 'jool:ELLIPTICAL_ORBIT', to: 'vall:SOI_INTERCEPT', deltaV: 620, aerobrake: false, label: 'Hohmann Transfer to Vall' },
  { from: 'vall:SOI_INTERCEPT', to: 'vall:LOW_ORBIT', deltaV: 910, aerobrake: false, label: 'Low-Orbit Insertion on Vall' },
  { from: 'vall:LOW_ORBIT', to: 'vall:SURFACE', deltaV: 860, aerobrake: false, label: 'Land on Vall' },
  { from: 'vall:SURFACE', to: 'vall:LOW_ORBIT', deltaV: 860, aerobrake: false, label: 'Launch to Low-Orbit over Vall' },
  { from: 'vall:LOW_ORBIT', to: 'vall:SOI_INTERCEPT', deltaV: 910, aerobrake: false, label: 'Escape from Vall' },
  { from: 'vall:SOI_INTERCEPT', to: 'jool:ELLIPTICAL_ORBIT', deltaV: 620, aerobrake: false, label: 'Elliptical-Orbit Insertion on Jool' },

  // Tylo
  { from: 'jool:ELLIPTICAL_ORBIT', to: 'tylo:SOI_INTERCEPT', deltaV: 400, aerobrake: false, label: 'Hohmann Transfer to Tylo' },
  { from: 'tylo:SOI_INTERCEPT', to: 'tylo:LOW_ORBIT', deltaV: 1100, aerobrake: false, label: 'Low-Orbit Insertion on Tylo' },
  { from: 'tylo:LOW_ORBIT', to: 'tylo:SURFACE', deltaV: 2270, aerobrake: false, label: 'Land on Tylo' },
  { from: 'tylo:SURFACE', to: 'tylo:LOW_ORBIT', deltaV: 2270, aerobrake: false, label: 'Launch to Low-Orbit over Tylo' },
  { from: 'tylo:LOW_ORBIT', to: 'tylo:SOI_INTERCEPT', deltaV: 1100, aerobrake: false, label: 'Escape from Tylo' },
  { from: 'tylo:SOI_INTERCEPT', to: 'jool:ELLIPTICAL_ORBIT', deltaV: 400, aerobrake: false, label: 'Elliptical-Orbit Insertion on Jool' },

  // Bop
  { from: 'jool:ELLIPTICAL_ORBIT', to: 'bop:SOI_INTERCEPT', deltaV: 220, aerobrake: false, planeChange: 2440, label: 'Hohmann Transfer to Bop' },
  { from: 'bop:SOI_INTERCEPT', to: 'bop:LOW_ORBIT', deltaV: 900, aerobrake: false, label: 'Low-Orbit Insertion on Bop' },
  { from: 'bop:LOW_ORBIT', to: 'bop:SURFACE', deltaV: 230, aerobrake: false, label: 'Land on Bop' },
  { from: 'bop:SURFACE', to: 'bop:LOW_ORBIT', deltaV: 230, aerobrake: false, label: 'Launch to Low-Orbit over Bop' },
  { from: 'bop:LOW_ORBIT', to: 'bop:SOI_INTERCEPT', deltaV: 900, aerobrake: false, label: 'Escape from Bop' },
  { from: 'bop:SOI_INTERCEPT', to: 'jool:ELLIPTICAL_ORBIT', deltaV: 220, aerobrake: false, planeChange: 2440, label: 'Elliptical-Orbit Insertion on Jool' },

  // Pol
  { from: 'jool:ELLIPTICAL_ORBIT', to: 'pol:SOI_INTERCEPT', deltaV: 160, aerobrake: false, planeChange: 700, label: 'Hohmann Transfer to Pol' },
  { from: 'pol:SOI_INTERCEPT', to: 'pol:LOW_ORBIT', deltaV: 820, aerobrake: false, label: 'Low-Orbit Insertion on Pol' },
  { from: 'pol:LOW_ORBIT', to: 'pol:SURFACE', deltaV: 130, aerobrake: false, label: 'Land on Pol' },
  { from: 'pol:SURFACE', to: 'pol:LOW_ORBIT', deltaV: 130, aerobrake: false, label: 'Launch to Low-Orbit over Pol' },
  { from: 'pol:LOW_ORBIT', to: 'pol:SOI_INTERCEPT', deltaV: 820, aerobrake: false, label: 'Escape from Pol' },
  { from: 'pol:SOI_INTERCEPT', to: 'jool:ELLIPTICAL_ORBIT', deltaV: 160, aerobrake: false, planeChange: 700, label: 'Elliptical-Orbit Insertion on Jool' },

  // === EELOO ===
  { from: 'kerbin:ELLIPTICAL_ORBIT', to: 'eeloo:SOI_INTERCEPT', deltaV: 1140, aerobrake: false, planeChange: 1330, label: 'Heliocentric Transfer to Eeloo' },
  { from: 'eeloo:SOI_INTERCEPT', to: 'eeloo:LOW_ORBIT', deltaV: 1370, aerobrake: false, label: 'Low-Orbit Insertion on Eeloo' },
  { from: 'eeloo:LOW_ORBIT', to: 'eeloo:SURFACE', deltaV: 620, aerobrake: false, label: 'Land on Eeloo' },
  { from: 'eeloo:SURFACE', to: 'eeloo:LOW_ORBIT', deltaV: 620, aerobrake: false, label: 'Launch to Low-Orbit over Eeloo' },
  { from: 'eeloo:LOW_ORBIT', to: 'eeloo:SOI_INTERCEPT', deltaV: 1370, aerobrake: false, label: 'Escape from Eeloo' },
  { from: 'eeloo:SOI_INTERCEPT', to: 'kerbin:ELLIPTICAL_ORBIT', deltaV: 1140, aerobrake: false, planeChange: 1330, label: 'Heliocentric Transfer to Kerbin' }
];

// Build adjacency list (unidirectional graph)
export function buildGraph() {
  const graph = {};
  for (const edge of edges) {
    if (!graph[edge.from]) graph[edge.from] = [];
    if (!graph[edge.to]) graph[edge.to] = [];
    graph[edge.from].push({ node: edge.to, deltaV: edge.deltaV, aerobrake: edge.aerobrake, planeChange: edge.planeChange, label: edge.label });
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

// ── Data Validation ──────────────────────────────────────────────────────────

/**
 * Fields that every celestial body must define for the app to function.
 * Adding new required fields here will surface missing data as early as
 * possible during development, before rendering attempts to use them.
 */
const REQUIRED_BODY_FIELDS = [
  'name', 'type', 'radius', 'gravity', 'color',
  'parent', 'semiMajorAxis', 'lowOrbit', 'displayRadius',
];

/**
 * Validates the `bodies` dictionary at startup.
 *
 * Checks that every body has the required fields, that parent references
 * resolve to known bodies, and that planets declare a `moons` array.
 * Non-star bodies must also provide `soiRadius`.
 *
 * Errors are logged to the console and returned as an array so tests can
 * assert on them.  No exception is thrown so the app can still attempt to
 * render a partially-valid dataset in development.
 *
 * @returns {string[]} List of validation error messages (empty when valid).
 */
export function validateSystemData() {
  const errors = [];

  for (const [id, body] of Object.entries(bodies)) {
    // Check all required scalar fields are present
    for (const field of REQUIRED_BODY_FIELDS) {
      if (body[field] === undefined || body[field] === null) {
        errors.push(`Body "${id}" is missing required field "${field}"`);
      }
    }

    // Parent reference must resolve (only the star may have parent === null)
    if (body.parent !== null && !bodies[body.parent]) {
      errors.push(`Body "${id}" references unknown parent "${body.parent}"`);
    }

    // Planets must declare their moon list (even if empty)
    if (body.type === 'planet' && !Array.isArray(body.moons)) {
      errors.push(`Planet "${id}" is missing the "moons" array`);
    }

    // Non-star bodies need an SOI radius for pathfinding and layout
    if (body.type !== 'star' && (body.soiRadius === undefined || body.soiRadius === null)) {
      errors.push(`Body "${id}" (type: ${body.type}) is missing "soiRadius"`);
    }
  }

  if (errors.length > 0) {
    console.error('[DeltaV] System data validation failed:\n' + errors.join('\n'));
  }

  return errors;
}
