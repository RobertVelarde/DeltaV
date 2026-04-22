/**
 * Mission Control theme — single source of truth for all visual constants.
 *
 * Centralising colors, stroke widths, and filter references here means a
 * one-line change is all it takes to adjust the map's look and feel without
 * hunting through every component for hard-coded hex strings.
 *
 * To add a new color system (e.g. Sol, Outer Planets Mod), extend COLORS with
 * a new key or swap out individual values via theme overrides.
 */

/** Neon color palette used throughout the orbital map */
export const COLORS = {
  // ── Viewport ─────────────────────────────────────────────────────────────
  background: '#0a0e17',
  ecliptic: '#1a2640',
  star: '#ffffff',

  // ── Interactive node state highlights ────────────────────────────────────
  nodeStart: '#00ff88',   // selected origin
  nodeEnd: '#ff4488',     // selected destination
  nodePath: '#00ffff',    // nodes lying on the computed route
  nodeDefault: '#6b7280', // unselected / inactive fallback

  // ── Transfer arc states ───────────────────────────────────────────────────
  arcPath: '#00ffff',
  arcDefault: '#2a3448',

  // ── Special-manoeuvre badges ──────────────────────────────────────────────
  aerobrake: '#60a5fa',
  planeChange: '#fbbf24',

  // ── UI panel chrome ───────────────────────────────────────────────────────
  panelBg: 'rgba(17, 24, 39, 0.95)',
  panelBorder: '#1f2937',
  panelText: '#9ca3af',
  panelTextLight: '#e5e7eb',
  panelTextDim: '#6b7280',
  panelRowSeparator: '#111827',

  // ── Accent used in headers, key labels, and primary actions ──────────────
  accentGreen: '#4ade80',
  totalDeltaV: '#00ffff',
};

/** Stroke widths for recurring SVG elements (pixels at scale 1) */
export const STROKES = {
  loRing: 1.5,        // planet low-orbit ring
  moonLoRing: 1.5,      // moon low-orbit ring
  moonOrbitRing: 2,   // concentric ring drawn around a parent planet
  soiCircle: 1,       // dashed SOI boundary circle
  nodeActiveBonus: 1, // extra width added when a node is highlighted
  ellipse: 2.5,       // highlighted departure / Hohmann transfer ellipse
  arcPath: 2.5,       // active (on-route) transfer arc
  arcDefault: 0.7,    // inactive transfer arc
};

/** Monospace font stack shared across all SVG labels and UI panels */
export const FONT = {
  mono: "'Space Mono', 'Courier New', 'Consolas', monospace",
  sizeHeader: 12,
  sizePlanetLabel: 10,
  sizeMoonLabel: 8,
  sizeEclipticLabel: 7,
};

/** SVG filter reference strings — must match the <filter> elements in OrbitalGraph */
export const FILTERS = {
  glow: 'url(#glow)',
  glowStrong: 'url(#glow-strong)',
};
