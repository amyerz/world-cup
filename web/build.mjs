// build.mjs — produce a fully self-contained, offline web bundle for the Portal APK.
//
// Pipeline:
//   1. Concatenate the handoff sources (i18n/data/players + JSX) IN LOAD ORDER, plus a
//      local flag-URL override and the live-data adapter, then run esbuild.transform ONCE
//      on the combined source (jsx loader, target es2019). Single-unit transform preserves
//      the shared classic-script global scope the files rely on and dedupes any helpers.
//   2. Vendor React/ReactDOM production UMD locally.
//   3. Vendor Barlow + Barlow Condensed (Latin) woff2 + a local fonts.css. CJK falls back
//      to the device system font (keeps the APK small).
//   4. Prefetch flag PNGs (flagcdn) for every team/region code at the widths the UI requests,
//      and rewrite window.flagUrl to point at the local copies.
//   5. Emit index.html (no CDN, no Babel) + app.css (styles.css + Portal top-inset/scrim).
//   6. Copy config (web/config.js if present, else the empty example).
//
// Output: android/app/src/main/assets/www/
import { transform } from "esbuild";
import { readFile, writeFile, mkdir, rm, cp, access } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SRC = join(ROOT, "design_handoff_worldcup_portal");
const EXTRA = join(HERE, "src-extra");
const OUT = join(ROOT, "android", "app", "src", "main", "assets", "www");

const FLAG_WIDTHS = [40, 80, 160, 320];
const TARGET = "es2019";

const log = (...a) => console.log(...a);

// ---- small concurrent fetch-to-file helper with retry ----
async function fetchBuf(url, tries = 4) {
  let err;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return Buffer.from(await r.arrayBuffer());
    } catch (e) { err = e; await new Promise(r => setTimeout(r, 250 * (i + 1))); }
  }
  throw err;
}
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx], idx); }
  }));
  return out;
}

// ---------------------------------------------------------------- 1. JS bundle
const FLAG_OVERRIDE = `
/* --- Portal: serve flags from bundled assets instead of flagcdn --- */
window.flagUrl = function (code, w) {
  var FW = [${FLAG_WIDTHS.join(", ")}];
  var px = FW.find(function (x) { return x >= (w || 80); }) || ${FLAG_WIDTHS[FLAG_WIDTHS.length - 1]};
  return "flags/" + code + "/w" + px + ".png";
};
`;

async function buildBundle() {
  const read = (p) => readFile(p, "utf8");
  const liveData = existsSync(join(EXTRA, "live-data.js"))
    ? await read(join(EXTRA, "live-data.js")) : "";

  // Patch app.jsx's root render so the app re-renders when the live adapter
  // dispatches "wc:data" (re-running App re-reads window.MATCHES/GROUPS/SCORERS;
  // hook state is preserved across root.render of the same component).
  let appSrc = await read(join(SRC, "app.jsx"));
  const RENDER_RE = /ReactDOM\.createRoot\(document\.getElementById\("root"\)\)\.render\(<App\s*\/>\);/;
  if (!RENDER_RE.test(appSrc)) throw new Error("build: could not find App root render line to patch");
  appSrc = appSrc.replace(RENDER_RE,
    `window.__wcRoot = ReactDOM.createRoot(document.getElementById("root"));
window.__wcRoot.render(<App />);
window.addEventListener("wc:data", function () { window.__wcRoot.render(<App />); });`);

  // ---- Hidden nav destinations (reversible). Remove an entry here to re-enable. ----
  const patch = (s, find, repl, label) =>
    s.includes(find) ? s.split(find).join(repl) : (console.warn("  patch miss:", label), s);
  const HIDDEN_TABS = ["stats"];
  if (HIDDEN_TABS.includes("stats")) {
    appSrc = patch(appSrc, '["groups", t.nav_groups], ["stats", t.nav_stats],',
      '["groups", t.nav_groups],', "nav: drop stats");
    appSrc = patch(appSrc, 'else if(tab==="stats"){ screen = <StatsScreen t={t} fav={favs} onTeam={openTeam} />; }',
      '', "route: drop stats");
  }

  // Exact load order from the original HTML, with live-data inserted after the
  // mock data (so mock acts as seed/fallback) and the flag override after data.js.
  const parts = [
    await read(join(SRC, "i18n.js")),
    await read(join(SRC, "data.js")),
    FLAG_OVERRIDE,
    await read(join(SRC, "players.js")),
    liveData,
    await read(join(SRC, "tweaks-panel.jsx")),
    await read(join(SRC, "icons.jsx")),
    await read(join(SRC, "components.jsx")),
    await read(join(SRC, "screens.jsx")),
    appSrc,
  ];
  const combined = parts.join("\n;\n");
  const res = await transform(combined, {
    loader: "jsx",
    jsx: "transform",            // classic runtime -> React.createElement / React.Fragment
    target: TARGET,
    legalComments: "none",
  });
  await writeFile(join(OUT, "app.bundle.js"), res.code);
  log(`  app.bundle.js  ${(res.code.length / 1024).toFixed(0)} KB`);

  // collect team/region codes from data.js for flag prefetch
  const dataTxt = parts[1];
  const codes = new Set();
  for (const m of dataTxt.matchAll(/"([a-z]{2}(?:-[a-z]{3})?)":\s*\{name:/g)) codes.add(m[1]);
  for (const m of dataTxt.matchAll(/flag:\s*"([a-z-]+)"/g)) codes.add(m[1]);
  // Nations in the real 2026 field (openfootball) that aren't in the bundled mock set —
  // ensure their flags ship too. (Bosnia, Czechia, DR Congo, Haiti, Iraq, S.Africa,
  // Sweden, Poland, Wales.)
  ["pl", "gb-wls", "ba", "cz", "cd", "ht", "iq", "za", "se"].forEach(c => codes.add(c));
  return [...codes];
}

// ---------------------------------------------------------------- 2. React
async function vendorReact(force) {
  if (!force && existsSync(join(OUT, "vendor", "react-dom.production.min.js"))) { log("  vendor/react* (cached)"); return; }
  await mkdir(join(OUT, "vendor"), { recursive: true });
  const files = [
    ["react.production.min.js", "https://unpkg.com/react@18.3.1/umd/react.production.min.js"],
    ["react-dom.production.min.js", "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"],
  ];
  await pool(files, 2, async ([name, url]) => {
    await writeFile(join(OUT, "vendor", name), await fetchBuf(url));
  });
  log("  vendor/react*.production.min.js");
}

// ---------------------------------------------------------------- 3. Fonts
async function vendorFonts(force) {
  if (!force && existsSync(join(OUT, "fonts.css"))) { log("  fonts.css (cached)"); return; }
  await mkdir(join(OUT, "fonts"), { recursive: true });
  const cssUrl =
    "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800" +
    "&family=Barlow+Condensed:wght@600;700;800&display=swap";
  const css = (await fetchBuf(cssUrl)).toString("utf8");
  const blocks = css.split("@font-face").slice(1);
  let out = "";
  let i = 0;
  const jobs = [];
  for (const b of blocks) {
    const fam = (/font-family:\s*'([^']+)'/.exec(b) || [])[1];
    const wght = (/font-weight:\s*(\d+)/.exec(b) || [])[1] || "400";
    const style = (/font-style:\s*(\w+)/.exec(b) || [])[1] || "normal";
    const range = (/unicode-range:\s*([^;]+);/.exec(b) || [])[1] || "";
    const url = (/src:\s*url\(([^)]+)\)/.exec(b) || [])[1];
    if (!fam || !url) continue;
    const file = `${fam.replace(/\s+/g, "")}-${wght}-${i}.woff2`;
    jobs.push([url, file]);
    out += `@font-face{font-family:'${fam}';font-style:${style};font-weight:${wght};` +
      `font-display:swap;src:url(fonts/${file}) format('woff2');unicode-range:${range};}\n`;
    i++;
  }
  await pool(jobs, 8, async ([url, file]) => {
    await writeFile(join(OUT, "fonts", file), await fetchBuf(url));
  });
  await writeFile(join(OUT, "fonts.css"), out);
  log(`  fonts.css + ${jobs.length} woff2 (Latin)`);
}

// ---------------------------------------------------------------- 4. Flags
async function vendorFlags(codes, force) {
  if (!force && existsSync(join(OUT, "flags"))) { log("  flags (cached)"); return; }
  const jobs = [];
  for (const code of codes)
    for (const w of FLAG_WIDTHS)
      jobs.push([code, w, `https://flagcdn.com/w${w}/${code}.png`]);
  let ok = 0, fail = 0;
  await pool(jobs, 16, async ([code, w, url]) => {
    try {
      const buf = await fetchBuf(url);
      await mkdir(join(OUT, "flags", code), { recursive: true });
      await writeFile(join(OUT, "flags", code, `w${w}.png`), buf);
      ok++;
    } catch { fail++; console.warn("    flag miss:", code, w); }
  });
  log(`  flags: ${ok} ok${fail ? `, ${fail} missing` : ""} (${codes.length} codes)`);
}

// ---------------------------------------------------------------- 4b. openfootball snapshot
// Bundle a copy of the public-domain 2026 schedule/results for offline use. The runtime
// adapter prefers the live jsDelivr copy and falls back to this snapshot when offline.
async function vendorOpenfootball(force) {
  const dst = join(OUT, "data", "worldcup-2026.json");
  if (!force && existsSync(dst)) { log("  data/worldcup-2026.json (cached)"); return; }
  await mkdir(join(OUT, "data"), { recursive: true });
  try {
    const buf = await fetchBuf("https://cdn.jsdelivr.net/gh/openfootball/worldcup.json@master/2026/worldcup.json");
    await writeFile(dst, buf);
    log("  data/worldcup-2026.json (openfootball snapshot)");
  } catch (e) { console.warn("  openfootball snapshot failed (offline fallback will be missing):", e + ""); }
}

// ---------------------------------------------------------------- 5. HTML + CSS
async function emitHtmlCss() {
  const styles = await readFile(join(SRC, "styles.css"), "utf8");
  const portalCss = `

/* ===== Portal device overrides (top system-overlay safe area) ===== */
:root{ --portal-top-inset:64px; }
.app{ padding-top:var(--portal-top-inset); }
/* Lift the top bar (and its language/team dropdowns) above the nav. In portrait the
   nav sits directly below the top bar as a sibling with the same z-index, so without
   this the nav paints over the dropdown menus. */
.topbar{ z-index:60; }
.portal-topscrim{
  position:fixed; top:0; left:0; right:0; height:var(--portal-top-inset);
  background:#021149; z-index:100; pointer-events:none;
}
[data-style="midnight"] .portal-topscrim{ background:#070b1c; }
[data-style="vibrant"]  .portal-topscrim{ background:#1b0a3a; }

/* Portrait / narrow: nav sits directly under the top bar as a fixed-height bar,
   and the scrollable content takes the remaining space. (Default grid is
   auto/1fr/auto with DOM order topbar,nav,scroll — which would auto-flow nav into
   the stretchy 1fr row; override the rows to auto/auto/1fr so nav stays compact
   at the top and never varies in height between tabs.) */
@media not all and (min-width:900px) and (min-aspect-ratio:1/1){
  .app{ grid-template-rows:auto auto 1fr; }
  .app > .nav{ border-top:none; border-bottom:1px solid var(--line); }
}

/* ===== Live-only: hide features without a free live data source =====
   (Bracket is live now; FIFA rank is shown in Stats; coach removed in source.)
   To re-enable, delete this block. */
/* squads / rosters (bundled, incomplete) */
.roster-grid{ display:none !important; }
/* where-to-watch + live ticker (bundled broadcasters / no real-time minute) */
.watch-btn, .mcard-watch, .watch-sm, .lm-watch, .soon-watch,
.live-takeover, .live-hero, .live-mini, .soon-banner{ display:none !important; }
/* chance-to-advance % (heuristic, not real): groups panel, team bar, your-team tile */
.content > .panel:nth-child(4){ display:none !important; }   /* Groups: "Chance to advance" panel */
.tm-adv, .tm-adv-top{ display:none !important; }              /* Team detail bar */
/* (your-team chance tile is removed in screens.jsx, so no nth-child rule needed) */
/* per-scorer assists column (no assist data on the free source) */
.scorer .stat .g:nth-child(2){ display:none !important; }
/* hard-coded ceremony markers in the calendar */
.wcal-ceremony, .wcal-evico{ display:none !important; }
.wcal-legend span:nth-child(2), .wcal-legend span:nth-child(3){ display:none !important; }

/* ===== Center the month pills + larger tap targets (tabletop distance) ===== */
.wcal-tabs{ justify-content:center; }
.wcal-tab{ padding:12px 32px; font-size:17px; }
.group-tab{ height:58px; font-size:26px; }
.group-tabs{ grid-template-columns:repeat(auto-fit,minmax(54px,1fr)); gap:9px; }
.seg-toggle button{ padding:12px 24px; font-size:15.5px; }
.nav-item{ font-size:14.5px; padding:9px 20px; }
.nav-item svg{ width:26px; height:26px; }
.lang-btn, .fav-chip, .host-pill{ padding:11px 18px; font-size:15.5px; }
.lang-menu button{ padding:12px 14px; font-size:16px; }
.backbtn{ padding:12px 20px; font-size:15px; }
.see-all-btn{ padding:19px; font-size:17px; }
.pick-banner .pb-cta{ padding:13px 22px; font-size:15px; }
.picker-team{ padding:13px 16px; }
.picker-done, .picker-search{ font-size:16px; }
.picker-done{ padding:13px 22px; }
.wcal-tab, .seg-toggle button, .group-tab{ font-weight:700; }
.mc-bell{ width:36px; height:36px; }
.watch-btn, .soon-watch, .mcard-watch, .watch-sm, .wm-chan{ padding:13px 22px; font-size:16px; }

/* ===== Calendar: uniform day height (fits 6 games) + flag spacing ===== */
.wcal-cell{ height:140px; min-height:0; justify-content:flex-start; }
.wcal-evts{ gap:4px; }
.wcal-evt{ gap:5px; }
.wcal-evt .ev-flags{ gap:4px; }
.wcal-evt .ev-flags .flag{ width:15px; height:10px; }
.wcal-evt .ev-time{ font-size:9.5px; }
`;
  await writeFile(join(OUT, "app.css"), styles + portalCss);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>World Cup 2026</title>
<link rel="stylesheet" href="fonts.css" />
<link rel="stylesheet" href="app.css" />
</head>
<body>
<div class="portal-topscrim"></div>
<div id="root"></div>
<script src="vendor/react.production.min.js"></script>
<script src="vendor/react-dom.production.min.js"></script>
<script src="config.js"></script>
<script src="app.bundle.js"></script>
</body>
</html>
`;
  await writeFile(join(OUT, "index.html"), html);
  log("  index.html + app.css");
}

// ---------------------------------------------------------------- 6. Config
async function emitConfig() {
  const dst = join(OUT, "config.js");
  const userCfg = join(HERE, "config.js");
  if (existsSync(userCfg)) {
    await cp(userCfg, dst);
    log("  config.js (from web/config.js)");
  } else {
    await cp(join(EXTRA, "config.example.js"), dst);
    log("  config.js (example — empty key, mock data)");
  }
  // also ship the example for reference
  await cp(join(EXTRA, "config.example.js"), join(OUT, "config.example.js"));
}

// ---------------------------------------------------------------- run
async function main() {
  const force = process.argv.includes("--force");   // re-download vendored assets
  const skipNet = process.argv.includes("--offline");
  log("Building web bundle ->", OUT);
  await mkdir(OUT, { recursive: true });

  // Always regenerate the code/markup; vendored assets are reused unless --force.
  const codes = await buildBundle();
  await emitHtmlCss();
  await emitConfig();

  if (skipNet) log("  (--offline: skipped vendored asset downloads)");
  else await Promise.all([vendorReact(force), vendorFonts(force), vendorFlags(codes, force), vendorOpenfootball(force)]);
  log("Done.");
}
main().catch(e => { console.error(e); process.exit(1); });
