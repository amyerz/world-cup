# Handoff: FIFA World Cup 2026 Portal & Display App

## Overview
A responsive companion app for the 2026 World Cup (USA · Canada · Mexico), designed for a **Meta Quest portal/display** form factor — it must work in **both landscape and portrait** and scale gracefully. It pulls (mocked) tournament data and lets a user follow teams, browse groups/standings/rosters, view the knockout bracket, track matches on a localized calendar, set watch reminders, and find where to stream — all in **8 languages**.

## About the Design Files
The files in this bundle are **design references created in HTML/CSS + in-browser React (Babel)** — a working prototype showing the intended look and behavior. They are **not production code to ship directly.** The task is to **recreate these designs in the target codebase's environment** (React Native / React / Vue / SwiftUI / native, etc.) using its established patterns, component library, navigation, i18n framework, and data layer. If no environment exists yet, pick the most appropriate stack for a Quest/WebXR panel app (a React + TypeScript SPA is a natural fit) and implement there.

Data is **mocked** in `data.js` / `players.js`. The structure is intentionally API-shaped — swap it for a real soccer feed (fixtures, standings, squads, scorers, broadcasters) at integration time.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, layouts, interactions, and motion are all specified. Recreate the UI faithfully using the codebase's libraries. Exact tokens are in `styles.css` `:root` (and reproduced under **Design Tokens** below).

---

## Information Architecture / Navigation
Top bar (logo + year, favourite-team chip, language switcher) is persistent. Primary nav has **5 destinations**, order: **Home · Bracket · Matches · Groups · Stats**.

- **Portrait / narrow:** nav is a bottom bar (icon + label).
- **Landscape / wide (`min-width:900px` AND `min-aspect-ratio:1/1`):** nav is a **left rail** that is **collapsible** — defaults to **collapsed (icons only, 72px)**, expands to icons+labels (166px) via a menu (hamburger) button; the open/closed state persists.

Tapping any team anywhere opens the **Team detail** view (a sub-view, not a tab). State persists to `localStorage` (key `wc26.v2`): `lang`, `tab`, `favs[]`, `region`, `reminders[]`, `navOpen`, `pickerSeen`.

---

## Screens / Views

### 1. Home (personalized dashboard)
Vertical stack, in this priority order:
1. **"Starting soon" alert** (red gradient banner) — appears when any **reminded** match is within **15 minutes** of kickoff. Shows STARTING SOON badge (pulsing dot), matchup (flags + names), a live **mm:ss** countdown (ticks every second), and a **Watch live** button (opens Where-to-watch). Multiple imminent matches stack.
2. **Pick-your-team banner** (magenta gradient) — only when the user follows 0 teams; opens the team picker.
3. **"Your Team" card(s)** — one per followed team; gold left-accent. Header: flag (84×56) + name (Barlow Condensed, ~33px, uppercase) + group. Stat chips row: **Position** (ordinal, green if top-2), **Pts**, **Chance to advance %**, **FIFA #rank** (each chip animates in with a slight pop/stagger). Footer "Your next match" row: flag + name · big local kickoff time + day (with "in N days" in blue) · flag + name; tapping a live one opens watch. **Layout:** single column; **2-up grid when >1 team** (`@media min-width:820px`).
4. **Live takeover** (if a match is live) — see Live treatment below.
5. **"Upcoming matches"** section — header row with a right-aligned **My matches / All matches** segmented toggle (defaults to **My matches**, showing a count). Body = the **Month Calendar** (see below).
6. **"All matches →"** button → jumps to Matches tab.

### 2. Month Calendar (shared by Home "Upcoming" and Matches)
- **Month tabs:** June · July (tournament months).
- **Weekday header:** localized, **week-start follows locale** — Sunday-first for en-US / ja-JP / pt-BR / zh-CN / zh-Hant, Monday-first elsewhere (uses `Intl.Locale().weekInfo.firstDay` with a fallback list).
- **Grid:** 7 columns, day cells (`min-height:74px`, grow to fit). Each cell shows the date number; days with matches list **all** that day's games as compact rows (16×11 → 13×9 flag pair + local kickoff time, blue); ceremony days show an icon marker (magenta star = Opening, gold trophy = Final).
- **Selected day** highlighted (gold ring; magenta ring for ceremony days). Clicking a day opens a **drawer below** the calendar (chosen over a right-hand drawer for responsiveness): a divider, the full date + match count, an optional **ceremony banner** (shows the localized name + **local start–end time · timezone**), then that day's matches as full cards. Re-animates on day change.
- **Legend:** gold dot = your matches, magenta star = Opening Ceremony, gold trophy = Final.

### 3. Live match treatment (3 variants, Tweakable)
- **Takeover** (default): full-width navy-gradient hero, LIVE badge (pulsing), Group · minute, big flags + team names + giant score (clamp 54–104px) with dash, "Live now · 67'" in gold, centered **Watch live** pill with broadcaster sublabel.
- **Hero**: compact bordered card (red left-accent), flags + names + score inline, live clock, small Watch button.
- **Mini**: fixed floating scoreboard (navy), bottom-right, live dot + score + watch.
The Matches screen reuses the same treatment as Home (mini falls back to hero there).

### 4. Bracket
Horizontal-scrolling knockout tree: **Round of 32 → Round of 16 → Quarter-finals → Semi-finals → Final → Champion** (trophy). Each tie is a 2-row card (flag + name + score). R32 carries projected matchups; later rounds are "Advancing…" placeholders. The user's followed team's R32 tie is marked with a **"YOUR TEAM"** gold tag and a one-time **attention pulse** (`favpulse`, 2 iterations), and on entering the screen the view **auto-scrolls** to focus that tie. The Final tie has a gold ring.

### 5. Matches
`Live now` (full live treatment) → the **Month Calendar** (all upcoming, browsable by date) → `Results` (finished matches as cards). Local-time note + timezone in the header.

### 6. Groups (tabbed A–L)
A row of **A–L tabs** (grid, fills the row; selected uses navy gradient; a gold star marks the tab containing a followed team). Auto-selects the followed team's group. Below: three panels —
- **Standings** (table: pos badge, flag, name, P W D L GD Pts; top-2 green pos badge, 3rd amber; followed team row tinted gold + star; the team column is forced to claim remaining width).
- **Chance to advance** (per-team probability bars; green for top-2, grey for last).
- **Matches** (that group's fixtures as compact vertical mini-cards).

### 7. Stats
Two leaderboards side-by-side (`split.two`): **Top Scorers** (by goals) and **Assists** (by assists). Rows: rank, flag, player, team, G/A stats; followed team tinted gold.

### 8. Team detail
Navy-gradient hero: flag, localized name (Barlow Condensed clamp 34–56px), group · position, head coach, recent form pills (W/D/L), a **Follow/Following** button, and a FIFA-rank badge. Then: **Overview** panel (stat tiles P/W/D/L, GF/GA/GD, Pts) + **Chance-to-advance** bar; **Matches** (that team's fixtures); and the **squad** laid out as a **by-position grid** (Goalkeepers / Defenders / Midfielders / Forwards columns, players stacked within each). Player card = number+initials avatar + name + club.

### 9. Team Picker (modal) — multi-select
Search field + grid of all 48 nations (sorted by FIFA rank), each a flag + name + star toggle. **Multi-select** (stays open), header shows count, **Done** closes. Following a team **auto-arms watch reminders** for all its upcoming matches; unfollowing clears them (unless the opponent is also followed).

### 10. Where-to-watch (modal)
Navy header with the matchup + score/time. Body: **"Where to watch"** + a **region `<select>`** (12 regions; defaults from language, persists once changed). Lists that region's broadcasters as launchable rows — logo monogram, name, **Free/Subscription** tag, **Open** (opens the broadcaster URL in a new tab).

### 11. Tweaks panel
Built on the standard tweaks-panel host protocol. Controls: **Theme** (classic / midnight / vibrant via `data-style`), **Accent** color (overrides `--blue`), **Live match treatment** (takeover / hero / mini).

---

## Interactions & Behavior
- **Reminders:** bell toggle on upcoming match cards → persists in `reminders[]`; requests the Notification permission and schedules a browser notification ~5 min before kickoff (only when within 24h). Following a team auto-arms its matches' reminders.
- **Live data simulation:** the live match's minute ticks up; countdowns tick every second; the "starting soon" / imminent logic re-evaluates each second via a `useNow()` 1s interval. Match kickoff times are computed at load as `Date.now() + offsetMin*60000` so countdowns/calendar are always relative to "now" and render in the **viewer's local timezone**.
- **i18n:** language switch updates everything live, including **country names** (see below). Direction is LTR for all 8 languages.
- **Entrance motion:** screens fade/translate in (`fade-in`, transform-only so content is never invisible if animation is paused); stat chips pop+stagger; ceremony/bracket use bespoke pulses. All gated so reduced-motion / print show the end state.

## State Management
React `useState` in a single `App` plus per-screen local state. Keys: `lang`, `tab`, `team` (detail target), `watch` (modal match), `favs[]`, `region`, `reminders[]`, `navOpen`, `picker` (open), plus tweak state (`style`, `liveVariant`, `accent`, `showLiveMini`). All non-ephemeral keys persist to `localStorage["wc26.v2"]`. A module global `window.__lang` is set each render so the `teamName()` helper can localize without prop-threading (replace with your i18n context in production).

## Localization (8 languages)
`en, de, es, fr, pt, ja, zh (Simplified), zt (Traditional)`. UI strings live in `i18n.js` (a base table + four merge layers). **Country/team names are localized at runtime via `Intl.DisplayNames(locale, {type:'region'})`** keyed off ISO-3166 codes — English keeps the curated names; subdivisions not covered by Intl (England `gb-eng`, Scotland `gb-sct`) have an explicit `SUBDIV_NAMES` map. Dates/times use `toLocaleDateString/TimeString` with a BCP-47 `LOCALE` map. Replace these with your platform's i18n + region-name APIs.

## Design Tokens
From `styles.css` `:root` (classic theme; `[data-style="midnight"]` and `[data-style="vibrant"]` override):
- **Colors:** `--navy #021149`, `--navy-2 #0a1f6e`, `--blue #1f6bff` (accent, tweakable), `--blue-ink #0a3fb0`, `--accent #e3097e` (WC26 magenta), `--gold #f2b705`, `--live #e11d2a`, `--green #16a45d`, `--amber #e8932a`.
- **Surfaces (light):** `--bg #eef1f7`, `--bg-2 #e3e8f2`, `--surface #ffffff`, `--surface-2 #f6f8fc`, `--line #dde3ee`, `--line-strong #c4cce0`.
- **Text:** `--ink #0a1130`, `--muted #5b657f`, `--muted-2 #8a93a8`.
- **Gradients:** `--grad-hero linear-gradient(120deg,#021149,#0a2a8c 55%,#1450c9)`, `--grad-accent linear-gradient(120deg,#e3097e,#7a18d6)`.
- **Radii:** `--radius 18px`, `--radius-sm 12px`, `--radius-lg 26px`. **Shadows:** `--shadow` and `--shadow-lg` (see file).
- **Type scale (px):** micro labels 11–12, secondary 13–14, body 14–15, names 15–16; numeric/headline stats use **Barlow Condensed** 18–40; hero numbers use `clamp()`.
- **Fonts:** body **Barlow**; condensed/display **Barlow Condensed**; CJK fallbacks **Noto Sans SC / Noto Sans JP** (Google Fonts). Flags via **flagcdn.com** at valid widths only (20/40/80/160/320…); broadcasters/regions in `data.js`.

## Assets
- **Flags:** flagcdn.com PNGs (`https://flagcdn.com/w{W}/{iso2}.png`) — snap requested width to a supported size. Replace with bundled flag assets for offline.
- **Icons:** inline SVGs (`icons.jsx`) — swap for your icon set.
- **Player photos:** not included (licensing); cards use a jersey-number + initials avatar. Wire a licensed source or user-supplied images if needed.

## Files (in this bundle)
- `World Cup 2026.html` — entry; loads fonts, styles, data (plain JS), then JSX via Babel.
- `styles.css` — all styling + tokens + theme variants + responsive rules.
- `i18n.js` — 8-language string tables + merges.
- `data.js` — teams, groups/standings, matches (group + knockout), scorers, stadiums, regions/broadcasters, locale + week-start + name helpers.
- `players.js` — squads per nation.
- `icons.jsx` — SVG icon set + `Flag`, `Countdown`, `useCountdown`, `useLiveMinute`.
- `components.jsx` — `Standings`, `LiveMatch` (3 variants), `FavButton`.
- `screens.jsx` — `HomeScreen`, `WatchCalendar`, `GroupsScreen`, `StatsScreen`, `TeamScreen`, `BracketScreen`, `MatchesScreen`, `TeamPicker`, `MatchCard`, `SoonBanner`, `YourTeamCard`.
- `app.jsx` — shell: top bar, language menu, collapsible nav, routing, Watch modal, Tweaks, persistence, reminder scheduling.
- `tweaks-panel.jsx` — Tweaks host-protocol shell + controls.

## Notes
- All data is mocked and API-shaped — the biggest integration task is wiring a real feed (fixtures/standings/squads/scorers/broadcasters) and real push notifications (the prototype uses the browser Notification API; on Quest, use the device's notification system; the saved `reminders[]` model is ready for it).
- Region broadcaster lists are realistic but curated samples for 12 markets — expand/correct per your rights data.
