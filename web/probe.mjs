// probe.mjs — sanity-check the API-Football key + WC2026 data shape. Prints summaries only.
import { readFileSync } from "node:fs";
const cfg = readFileSync(new URL("./config.js", import.meta.url), "utf8");
const KEY = (cfg.match(/apiKey:\s*"([^"]+)"/) || [])[1];
const BASE = "https://v3.football.api-sports.io";
if (!KEY || KEY === "YOUR_KEY_HERE") { console.error("no key"); process.exit(1); }
const get = async (p) => {
  const r = await fetch(BASE + p, { headers: { "x-apisports-key": KEY } });
  return r.json();
};
const j = (x) => JSON.stringify(x);

const status = await get("/status");
console.log("STATUS:", j(status.response?.subscription || status.response || status.errors));
console.log("  requests:", j(status.response?.requests));

const std = await get("/standings?league=1&season=2026");
const tables = std.response?.[0]?.league?.standings || [];
console.log("\nSTANDINGS: errors=", j(std.errors), " groups=", tables.length);
console.log("  sample group[0]:", (tables[0] || []).map(r => `${r.group}|${r.team?.name}`).slice(0, 4).join("  "));
const allTeamNames = new Set();
tables.forEach(g => g.forEach(r => allTeamNames.add(r.team?.name)));

const fix = await get("/fixtures?league=1&season=2026");
const fl = fix.response || [];
console.log("\nFIXTURES: errors=", j(fix.errors), " count=", fl.length);
const byStatus = {}, rounds = new Set();
fl.forEach(f => { const s = f.fixture?.status?.short; byStatus[s] = (byStatus[s] || 0) + 1; rounds.add(f.league?.round); });
console.log("  status breakdown:", j(byStatus));
console.log("  rounds:", [...rounds].join(" | "));
fl.forEach(f => { allTeamNames.add(f.teams?.home?.name); allTeamNames.add(f.teams?.away?.name); });
const live = fl.filter(f => ["1H", "2H", "HT", "ET", "LIVE"].includes(f.fixture?.status?.short));
console.log("  live now:", live.map(f => `${f.teams?.home?.name} ${f.goals?.home}-${f.goals?.away} ${f.teams?.away?.name} (${f.fixture?.status?.elapsed}')`).join(" ; ") || "none");

const ts = await get("/players/topscorers?league=1&season=2026");
console.log("\nTOPSCORERS: errors=", j(ts.errors), " count=", (ts.response || []).length);
console.log("  sample:", (ts.response || []).slice(0, 3).map(p => `${p.player?.name} (${p.statistics?.[0]?.team?.name}) g${p.statistics?.[0]?.goals?.total}`).join(" ; "));

console.log("\nALL TEAM NAMES (", allTeamNames.size, "):");
console.log([...allTeamNames].filter(Boolean).sort().join(", "));
