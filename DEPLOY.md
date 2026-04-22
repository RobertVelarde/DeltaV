# Delta-V — Deployment Guide

## Overview

This project is a React + Vite single-page application that deploys to GitHub
Pages under the custom sub-domain **deltav.robertvelardejr.com** via an
automated GitHub Actions CI/CD pipeline.

---

## 1. Local Testing

### Development server

```bash
npm install
npm run dev
```

Vite starts a hot-module-replacement dev server at `http://localhost:5173`.
System data validation runs automatically and any missing fields are logged to
the browser console.

### Production preview

Always verify the production bundle locally before pushing to `main`:

```bash
npm run build      # compile → dist/
npm run preview    # serve dist/ at http://localhost:4173
```

`preview` serves the exact files that will be deployed so you can catch any
routing or asset-path issues before they reach production.

---

## 2. Environment Variables

| Variable            | Purpose                                     | Default                              |
|---------------------|---------------------------------------------|--------------------------------------|
| `VITE_SITE_URL`     | Canonical URL used in `og:url` meta tag     | `https://deltav.robertvelardejr.com` |
| `VITE_APP_TITLE`    | Page `<title>` and `og:title`               | `Kerbol System ΔV Map`               |

Copy `.env.example` to `.env` for local overrides.  Never commit `.env.local`.

---

## 3. Automated Deployment (GitHub Actions)

The workflow in `.github/workflows/deploy.yml` runs on every push to `main`:

1. Checks out the repository.
2. Installs Node 22 dependencies with `npm ci` (uses the lock-file for
   reproducible installs).
3. Runs `npm run build` with production environment variables injected.
4. Verifies that `dist/CNAME` is present (Vite copies `public/CNAME` into
   `dist/` automatically).
5. Pushes the `dist/` folder to the `gh-pages` branch using
   [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages).

No secrets beyond the auto-provisioned `GITHUB_TOKEN` are required.

---

## 4. GitHub Repository Settings

### Enable GitHub Pages

1. Go to **Settings → Pages** in your repository.
2. Under **Source**, select **Deploy from a branch**.
3. Set the branch to `gh-pages` and the folder to `/ (root)`.
4. Click **Save**.

### Custom domain

1. In **Settings → Pages → Custom domain**, enter `deltav.robertvelardejr.com`.
2. GitHub will confirm the CNAME file is present and validate DNS.

### DNS records (robertvelardejr.com DNS provider)

Add the following DNS record at your registrar or DNS provider:

| Type  | Host                    | Value                    | TTL  |
|-------|-------------------------|--------------------------|------|
| CNAME | `deltav`                | `<username>.github.io.`  | 3600 |

Replace `<username>` with your GitHub username.  DNS propagation typically
takes up to 30 minutes.

### Enforce HTTPS

Once GitHub shows a green "DNS check successful" message in **Settings → Pages**,
tick **Enforce HTTPS**.  GitHub automatically provisions a Let's Encrypt TLS
certificate.

---

## 5. Adding a New Planetary System to `systemData.js`

The data layer is designed to be extended without touching any rendering code.

### Step 1 — Add body definitions

Add new entries to the `bodies` object in `src/data/systemData.js`:

```js
export const bodies = {
  // … existing bodies …

  sun: {
    name: 'Sun',
    type: 'star',
    radius: 696000,
    gravity: 274,
    color: '#fff7aa',
    parent: null,
    semiMajorAxis: 0,
    atmosphere: 0,
    lowOrbit: 0,
    soiRadius: null,
    displayRadius: 120,
    isMoon: false,
  },
  earth: {
    name: 'Earth',
    type: 'planet',
    radius: 6371,
    gravity: 9.81,
    color: '#4488ff',
    parent: 'sun',
    semiMajorAxis: 149597870,
    atmosphere: 100,
    lowOrbit: 160,
    soiRadius: 924000,
    displayRadius: 14,
    moons: ['luna'],
    isMoon: false,
  },
  // …
};
```

Every body must include the fields listed in `REQUIRED_BODY_FIELDS` (see the
data validation section of `systemData.js`).  Running `npm run dev` will log
any missing fields to the console via `validateSystemData()`.

### Step 2 — Add graph edges

Append delta-v edges to the `edges` array.  Each edge is **unidirectional** —
add both directions if travel is possible either way:

```js
export const edges = [
  // … existing edges …

  { from: 'earth:LOW_ORBIT', to: 'luna:SOI_INTERCEPT', deltaV: 3140, aerobrake: false, label: 'Trans-Lunar Injection' },
  { from: 'luna:SOI_INTERCEPT', to: 'luna:LOW_ORBIT',  deltaV: 850,  aerobrake: false, label: 'Lunar Orbit Insertion' },
  // …
];
```

`buildGraph()` rebuilds the adjacency list from the edges array every time it
is called by `dijkstra()`, so no extra wiring is needed.

### Step 3 — Add the planet to `planetOrder`

```js
export const planetOrder = ['mercury', 'venus', 'earth', /* … */];
```

The layout engine positions planets along the ecliptic in this order,
left-to-right.

### Step 4 — Layout (optional)

Open `src/layout/layoutEngine.js` to adjust orbital ring radii, Hohmann
transfer ellipse definitions, or the horizontal spacing between planets if the
new system requires it.

---

## 6. Troubleshooting

| Symptom                                  | Cause                                              | Fix                                                  |
|------------------------------------------|----------------------------------------------------|------------------------------------------------------|
| White page after deploy                  | Asset paths broken (wrong `base` in vite.config)   | Confirm `base: '/'` in `vite.config.js`              |
| Custom domain resets after each deploy   | CNAME missing from `dist/`                         | Confirm `public/CNAME` exists and contains the domain|
| "No valid path found" for a valid route  | Missing edge in `systemData.js`                    | Add the bidirectional edges for the missing leg      |
| 404 on direct URL navigation             | GitHub Pages doesn't handle SPA routing by default | Add a `public/404.html` that redirects to `index.html` with a script |
