// live-data.js — free, no-paid-tier data layer for World Cup 2026.
//
// Default source is **openfootball** (github, public domain, NO API KEY): real schedule,
// groups, results (filled daily as matches play) and goal scorers. From it we derive the
// app's existing globals — MATCHES, GROUPS (standings computed client-side), SCORERS
// (Golden Boot from goal data) — so no screen code changes. A bundled snapshot
// (data/worldcup-2026.json) is the offline fallback.
//
// An optional "apifootball" source is kept for anyone with a paid api-sports.io plan
// (adds true real-time minute + assists), but the app needs NOTHING paid to run.
//
// What stays on bundled mock data (no free live source, and largely static): squads
// (PLAYERS), stadiums, broadcasters, FIFA ranks/coaches.
(function () {
  var CFG = window.WC_CONFIG || {};
  var SOURCE = CFG.source || "openfootball";

  // ---------- shared: team name -> our ISO-ish code ----------
  function norm(s) {
    s = String(s == null ? "" : s).toLowerCase();
    try { s = s.normalize("NFD").replace(/[̀-ͯ]/g, ""); } catch (e) {}
    return s.replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim();
  }
  // Nations in the real 2026 field that aren't in the bundled mock TEAMS. Flags for
  // these codes are prefetched by build.mjs. Ranks are approximate (display only).
  var SUPPLEMENT = {
    "pl": { name: "Poland", rank: 27, coach: "" },
    "gb-wls": { name: "Wales", rank: 30, coach: "" },
    "ba": { name: "Bosnia & Herzegovina", rank: 74, coach: "" },
    "cz": { name: "Czechia", rank: 40, coach: "" },
    "cd": { name: "DR Congo", rank: 56, coach: "" },
    "ht": { name: "Haiti", rank: 83, coach: "" },
    "iq": { name: "Iraq", rank: 58, coach: "" },
    "za": { name: "South Africa", rank: 63, coach: "" },
    "se": { name: "Sweden", rank: 43, coach: "" }
  };
  window.TEAMS = window.TEAMS || {};
  Object.keys(SUPPLEMENT).forEach(function (c) { if (!window.TEAMS[c]) window.TEAMS[c] = SUPPLEMENT[c]; });

  // Current FIFA world ranking for the 48 qualified teams (pulled 11 Jun 2026 from
  // football-ranking.com / whereig.com). Overrides the bundled ranks for accuracy.
  var FIFA_RANKS = {
    ar: 1, es: 2, fr: 3, "gb-eng": 4, pt: 5, br: 6, ma: 7, nl: 8, be: 9, de: 10,
    hr: 11, co: 13, mx: 14, sn: 15, uy: 16, us: 17, jp: 18, ch: 19, ir: 21, tr: 22,
    ec: 23, at: 24, kr: 25, au: 27, dz: 28, eg: 29, ca: 30, no: 31, ci: 33, pa: 34,
    se: 38, cz: 39, py: 40, "gb-sct": 42, cd: 45, tn: 46, uz: 50, qa: 56, iq: 57,
    za: 60, sa: 61, jo: 63, ba: 64, cv: 67, gh: 73, cw: 82, ht: 83, nz: 85
  };
  Object.keys(FIFA_RANKS).forEach(function (c) { if (window.TEAMS[c]) window.TEAMS[c].rank = FIFA_RANKS[c]; });
  window.SUBDIV_NAMES = window.SUBDIV_NAMES || {};
  if (!window.SUBDIV_NAMES["gb-wls"]) window.SUBDIV_NAMES["gb-wls"] =
    { en: "Wales", de: "Wales", es: "Gales", fr: "Pays de Galles", pt: "País de Gales", ja: "ウェールズ", zh: "威尔士", zt: "威爾斯" };

  // name variants where the feed differs from our TEAMS labels (normalised keys)
  var ALIASES = {
    "usa": "us", "united states of america": "us",
    "korea republic": "kr", "south korea": "kr",
    "ir iran": "ir", "iran": "ir",
    "turkey": "tr", "turkiye": "tr",
    "cote d ivoire": "ci", "ivory coast": "ci",
    "cape verde islands": "cv", "cape verde": "cv", "cabo verde": "cv",
    "curacao": "cw",
    "czech republic": "cz", "czechia": "cz",
    "england": "gb-eng", "scotland": "gb-sct", "wales": "gb-wls", "poland": "pl",
    "republic of ireland": "ie", "north macedonia": "mk",
    "bosnia and herzegovina": "ba", "bosnia herzegovina": "ba",
    "dr congo": "cd", "congo dr": "cd", "democratic republic of congo": "cd",
    "south africa": "za", "sweden": "se", "iraq": "iq", "haiti": "ht"
  };
  var NAME2CODE = {};
  Object.keys(window.TEAMS).forEach(function (c) { NAME2CODE[norm(window.TEAMS[c].name)] = c; });
  var unmapped = {};
  function codeOf(name) {
    var n = norm(name);
    if (!n) return null;
    var c = NAME2CODE[n] || ALIASES[n] || null;
    if (!c && !unmapped[n]) { unmapped[n] = 1; if (!/^[0-9]|^[wl][0-9]/.test(n)) console.warn("[wc] unmapped team:", name); }
    return c;  // null for knockout placeholders (2A, W73, 3A/B/...) and unknowns
  }

  // ---------- localStorage cache + re-render signal ----------
  function cGet(k) { try { return JSON.parse(localStorage.getItem("wc26." + k)); } catch (e) { return null; } }
  function cSet(k, data) { try { localStorage.setItem("wc26." + k, JSON.stringify({ t: Date.now(), data: data })); } catch (e) {} }
  function emit() { try { window.dispatchEvent(new Event("wc:data")); } catch (e) {} }

  // =========================================================================
  //  OPENFOOTBALL adapter (default, free, no key)
  // =========================================================================
  function openfootball() {
    // Source order = FRESHNESS. raw.githubusercontent serves openfootball's master with a
    // ~5min CDN cache (and sends CORS), while jsDelivr caches the mutable @master ref for ~12h
    // — so jsDelivr can lag real results by up to half a day. Try raw first, jsDelivr as a
    // reliable fallback, then the bundled snapshot (offline).
    var URLS = CFG.openfootballUrls || (CFG.openfootballUrl ? [CFG.openfootballUrl] : [
      "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json",
      "https://cdn.jsdelivr.net/gh/openfootball/worldcup.json@master/2026/worldcup.json"
    ]);
    var LOCAL = "data/worldcup-2026.json";          // bundled offline snapshot
    var TTL = (CFG.refreshHours || 1) * 3600e3;     // re-pull cadence (results fill through the day)

    function parseKick(date, time) {
      var t = String(time || "00:00").trim();
      var m = t.match(/^(\d{1,2}):(\d{2})\s*(?:UTC\s*([+-]\d{1,2})(?::?(\d{2}))?)?/i);
      if (!m) return Date.parse(date + "T00:00:00Z") || Date.now();
      var hh = ("0" + m[1]).slice(-2), mm = m[2], off = "Z";
      if (m[3] != null) {
        var sign = m[3][0] === "-" ? "-" : "+";
        var oh = ("0" + Math.abs(parseInt(m[3], 10))).slice(-2);
        off = sign + oh + ":" + (m[4] || "00");
      }
      return Date.parse(date + "T" + hh + ":" + mm + ":00" + off) || Date.now();
    }
    function roundOf(r) {
      if (/round of 32/i.test(r)) return "r32";
      if (/round of 16/i.test(r)) return "r16";
      if (/quarter/i.test(r)) return "qf";
      if (/semi/i.test(r)) return "sf";
      if (/third place/i.test(r)) return "third"; // not part of the bracket tree
      if (/final/i.test(r)) return "final";
      return null; // group ("Matchday N")
    }
    // Human label for an unresolved knockout slot: "1A" -> "1st A", "3A/B/.." -> "3rd A/B/..",
    // "W73"/"L73" -> null (stays generic, since match numbers aren't meaningful to users).
    function koLabel(tok) {
      tok = String(tok || "").trim();
      var m;
      if ((m = tok.match(/^([123])([A-L])$/))) return ({ "1": "1st", "2": "2nd", "3": "3rd" }[m[1]]) + " " + m[2];
      if ((m = tok.match(/^3([A-L\/]+)$/))) return "3rd " + m[1];
      return null;
    }

    function map(data) {
      var src = (data && data.matches) || [];
      var matches = [], scorers = {};
      var ko = { r32: [], r16: [], qf: [], sf: [], final: [] };   // bracket tree (incl. TBD slots)
      src.forEach(function (m, i) {
        var home = codeOf(m.team1), away = codeOf(m.team2);
        var has = m.score && m.score.ft;
        var rd = roundOf(m.round || "");
        // Bracket keeps EVERY knockout tie, even with unresolved placeholders (h/a = null).
        if (rd && ko[rd]) {
          ko[rd].push({
            h: home, a: away,
            hl: home ? null : koLabel(m.team1), al: away ? null : koLabel(m.team2), // slot labels until resolved
            hs: has ? m.score.ft[0] : null, as: has ? m.score.ft[1] : null, num: m.num || 0
          });
        }
        if (!home || !away) return;                 // MATCHES/scorers: resolved teams only
        var kick = parseKick(m.date, m.time);
        var mm = {
          id: "of-" + (m.num != null ? m.num : (m.round + "-" + i)).toString().replace(/\s+/g, ""),
          home: home, away: away,
          status: has ? "finished" : "upcoming",
          hs: has ? m.score.ft[0] : 0,
          as: has ? m.score.ft[1] : 0,
          minute: 0, stream: "", _kick: kick
        };
        if (rd) mm.round = rd; else mm.group = String(m.group || "").replace(/group\s*/i, "");
        if (mm.status === "upcoming") mm._target = kick;
        matches.push(mm);

        if (has) {
          var add = function (arr, code) {
            (arr || []).forEach(function (g) {
              if (!g || g.owngoal || !g.name) return;
              var key = g.name + "|" + code;
              (scorers[key] || (scorers[key] = { code: code, player: g.name, g: 0, a: 0 })).g++;
            });
          };
          add(m.goals1, home); add(m.goals2, away);
        }
      });
      Object.keys(ko).forEach(function (k) { ko[k].sort(function (a, b) { return a.num - b.num; }); });
      return { matches: matches, scorers: scorers, ko: ko };
    }

    // standings computed from finished group matches (seeds all drawn teams at 0).
    function standings(matches) {
      var G = {};
      matches.forEach(function (m) {
        if (!m.group || !m.home || !m.away) return;
        var g = G[m.group] || (G[m.group] = {});
        [m.home, m.away].forEach(function (c) { g[c] || (g[c] = { code: c, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, adv: 0 }); });
        if (m.status !== "finished") return;
        var h = g[m.home], a = g[m.away];
        h.p++; a.p++; h.gf += m.hs; h.ga += m.as; a.gf += m.as; a.ga += m.hs;
        if (m.hs > m.as) { h.w++; a.l++; } else if (m.hs < m.as) { a.w++; h.l++; } else { h.d++; a.d++; }
      });
      return Object.keys(G).sort().map(function (letter) {
        var teams = Object.keys(G[letter]).map(function (c) { return G[letter][c]; });
        var ranked = teams.slice().sort(function (a, b) {
          return (b.w * 3 + b.d) - (a.w * 3 + a.d) || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf;
        });
        ranked.forEach(function (t, i) { t.adv = [88, 64, 34, 12][i] != null ? [88, 64, 34, 12][i] : 20; });
        return { id: letter, teams: teams };
      });
    }

    function apply(data) {
      if (!data || !data.matches) return false;
      var r = map(data);
      if (!r.matches.length) return false;
      window.MATCHES = r.matches;
      // Prune TEAMS to the real field so the picker/search matches the live groups
      // (keep mock coach/rank where we have it, else the supplement/placeholder).
      var present = {};
      r.matches.forEach(function (m) { if (m.home) present[m.home] = 1; if (m.away) present[m.away] = 1; });
      var keys = Object.keys(present);
      if (keys.length >= 24) {
        var pruned = {};
        keys.forEach(function (c) { pruned[c] = window.TEAMS[c] || SUPPLEMENT[c] || { name: c, rank: 0, coach: "" }; });
        window.TEAMS = pruned;
      }
      var groups = standings(r.matches);
      if (groups.length) window.GROUPS = groups;
      var sc = Object.keys(r.scorers).map(function (k) { return r.scorers[k]; })
        .sort(function (a, b) { return b.g - a.g || b.a - a.a; }).slice(0, 12);
      window.SCORERS = sc;   // real goals only (empty until the first goals are scored — no mock)
      if (r.ko && (r.ko.r32.length || r.ko.r16.length || r.ko.final.length)) window.BRACKET = r.ko;
      return true;
    }

    function fetchLocal() {
      // Offline fallback ships as a <script> global (window.__WC_OF_SNAPSHOT): a file:// page
      // can't fetch() a sibling local file under the secure allowFileAccessFromFileURLs=false
      // default, so reading the global is what actually works offline. fetch() stays as a
      // last-ditch fallback for non-file hosting.
      if (window.__WC_OF_SNAPSHOT) return Promise.resolve(window.__WC_OF_SNAPSHOT);
      return fetch(LOCAL).then(function (r) { return r.json(); }).catch(function () { return null; });
    }

    // Try each source in order; resolve with the first that returns a valid {matches} payload.
    function fetchFirst(urls, i) {
      if (i >= urls.length) return Promise.reject(new Error("all sources failed"));
      return fetch(urls[i]).then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
        .then(function (j) { if (j && j.matches) return j; throw new Error("empty"); })
        .catch(function () { return fetchFirst(urls, i + 1); });
    }

    function load() {
      var cached = cGet("of");
      if (cached && (Date.now() - cached.t) < TTL) { if (apply(cached.data)) emit(); return; }
      fetchFirst(URLS, 0).then(function (j) {
        cSet("of", j); if (apply(j)) emit();
      }).catch(function (e) {
        console.warn("[wc] openfootball fetch failed, using cache/snapshot:", e + "");
        if (cached && apply(cached.data)) { emit(); return; }
        fetchLocal().then(function (j) { if (apply(j)) emit(); });
      });
    }
    load();

    // Auto-refresh so finished games update themselves — without polling all day. Only re-pulls
    // when a match is in its "result window": past its expected finish but not yet marked
    // finished in our data. Re-checks every ~15 min until the result posts, then that match
    // drops out of the window. Pauses when the screen is off (document.hidden).
    var EXPECT_FINISH = 120 * 60000;   // a match is assumed over ~2h after kickoff
    var GIVE_UP = 6 * 3600e3;          // stop chasing a result 6h after kickoff (handles ET/PKs + posting lag)
    var CHECK_EVERY = 15 * 60000;      // re-evaluate every 15 min
    function resultPending(now) {
      return (window.MATCHES || []).some(function (m) {
        return m.status !== "finished" &&
               now >= m._kick + EXPECT_FINISH && now <= m._kick + GIVE_UP;
      });
    }
    setInterval(function () {
      if (document.hidden || !resultPending(Date.now())) return;
      fetchFirst(URLS, 0).then(function (j) { cSet("of", j); if (apply(j)) emit(); }).catch(function () {});
    }, CHECK_EVERY);
  }

  // =========================================================================
  //  API-FOOTBALL adapter (optional, paid plan only — kept for completeness)
  // =========================================================================
  function apifootball() {
    if (!CFG.apiKey || CFG.apiKey === "YOUR_KEY_HERE") { console.warn("[wc] apifootball source but no key — staying on bundled data"); return; }
    var BASE = (CFG.apiBase || "https://v3.football.api-sports.io").replace(/\/$/, "");
    var LEAGUE = CFG.league || 1, SEASON = CFG.season || 2026;
    var DAILY_MAX = CFG.dailyMax || 95, SLOW = (CFG.refreshHours || 6) * 3600e3, LIVE = (CFG.livePollSec || 60) * 1000;
    function day() { var d = new Date(); return d.getUTCFullYear() + "." + d.getUTCMonth() + "." + d.getUTCDate(); }
    function cnt() { try { var o = JSON.parse(localStorage.getItem("wc26.apicount") || "{}"); return o.d === day() ? (o.n || 0) : 0; } catch (e) { return 0; } }
    function bump() { try { localStorage.setItem("wc26.apicount", JSON.stringify({ d: day(), n: cnt() + 1 })); } catch (e) {} }
    function get(path, ttl, force) {
      var c = cGet("api." + path);
      if (c && !force && (Date.now() - c.t) < ttl) return Promise.resolve(c.data);
      if (cnt() >= DAILY_MAX) return Promise.resolve(c ? c.data : null);
      bump();
      return fetch(BASE + path, { headers: { "x-apisports-key": CFG.apiKey } }).then(function (r) { return r.json(); })
        .then(function (j) { var resp = j && j.response; if (resp && resp.length) { cSet("api." + path, resp); return resp; } if (j && j.errors) console.warn("[wc] api error", j.errors); return c ? c.data : null; })
        .catch(function (e) { console.warn("[wc] fetch failed", e + ""); return c ? c.data : null; });
    }
    var groupOf = {};
    function applyStd(resp) {
      var tabs = resp && resp[0] && resp[0].league && resp[0].league.standings; if (!tabs) return;
      var oldAdv = {}; (window.GROUPS || []).forEach(function (g) { g.teams.forEach(function (t) { oldAdv[t.code] = t.adv; }); });
      var groups = [];
      tabs.forEach(function (rows) {
        var letter = ((rows[0].group || "").match(/group\s+([a-l])/i) || [])[1] || rows[0].group;
        var teams = [];
        rows.forEach(function (r, i) {
          var c = codeOf(r.team && r.team.name); if (!c) return; groupOf[c] = letter;
          var all = r.all || {}, gl = all.goals || {};
          teams.push({ code: c, p: all.played || 0, w: all.win || 0, d: all.draw || 0, l: all.lose || 0, gf: gl.for || 0, ga: gl.against || 0, adv: oldAdv[c] != null ? oldAdv[c] : [85, 60, 30, 10][i] || 20 });
        });
        if (teams.length) groups.push({ id: letter, teams: teams });
      });
      if (groups.length) window.GROUPS = groups.sort(function (a, b) { return String(a.id).localeCompare(b.id); });
    }
    function st(s) { return ["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"].indexOf(s) !== -1 ? "live" : (["FT", "AET", "PEN"].indexOf(s) !== -1 ? "finished" : "upcoming"); }
    function mapFix(f) {
      var h = codeOf(f.teams && f.teams.home && f.teams.home.name), a = codeOf(f.teams && f.teams.away && f.teams.away.name); if (!h || !a) return null;
      var s = (f.fixture && f.fixture.status) || {}, g = f.goals || {}, k = Date.parse((f.fixture && f.fixture.date) || "") || Date.now();
      var m = { id: "api-" + f.fixture.id, home: h, away: a, status: st(s.short), hs: g.home == null ? 0 : g.home, as: g.away == null ? 0 : g.away, minute: s.elapsed || 0, stream: "", _kick: k };
      if (m.status === "upcoming") m._target = k;
      var rd = String((f.league && f.league.round) || ""); var R = /round of 32/i.test(rd) ? "r32" : /round of 16/i.test(rd) ? "r16" : /quarter/i.test(rd) ? "qf" : /semi/i.test(rd) ? "sf" : /final/i.test(rd) ? "final" : null;
      if (R) m.round = R; else m.group = groupOf[h] || "?";
      return m;
    }
    function applyFix(resp) { var l = []; resp.forEach(function (f) { var m = mapFix(f); if (m) l.push(m); }); if (l.length) window.MATCHES = l; }
    function applyTs(resp) { var o = []; resp.forEach(function (p) { var s = (p.statistics && p.statistics[0]) || {}, c = codeOf(s.team && s.team.name); if (!c) return; o.push({ code: c, player: (p.player && p.player.name) || "", g: (s.goals && s.goals.total) || 0, a: (s.goals && s.goals.assists) || 0 }); }); if (o.length) window.SCORERS = o.slice(0, 12); }
    var P = { s: "/standings?league=" + LEAGUE + "&season=" + SEASON, f: "/fixtures?league=" + LEAGUE + "&season=" + SEASON, t: "/players/topscorers?league=" + LEAGUE + "&season=" + SEASON, live: "/fixtures?live=all&league=" + LEAGUE };
    Promise.all([get(P.s, SLOW), get(P.f, SLOW), get(P.t, SLOW)]).then(function (r) {
      if (r[0]) applyStd(r[0]); if (r[1]) applyFix(r[1]); if (r[2]) applyTs(r[2]); emit();
      setInterval(function () { if (document.hidden) return; get(P.live, 0, true).then(function (live) { if (!live || !live.length) return; var by = {}; (window.MATCHES || []).forEach(function (m) { by[m.id] = m; }); var ch = false; live.forEach(function (f) { var m = mapFix(f); if (!m) return; var e = by[m.id]; if (e) { e.hs = m.hs; e.as = m.as; e.minute = m.minute; e.status = m.status; ch = true; } }); if (ch) emit(); }); }, LIVE);
    });
  }

  // ---------- run ----------
  function go() { (SOURCE === "apifootball" ? apifootball : openfootball)(); }
  if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", go);
  else setTimeout(go, 0);
})();
