// config.example.js — copy to web/config.js (gitignored) and edit. The build copies
// web/config.js into the APK (assets/www/config.js); if it's missing, this example
// (empty key → free openfootball data) is used. NEVER put a key you can't afford to
// expose here — it ships inside the APK and is readable by anyone who unzips it.
window.WC_CONFIG = {
  source: "openfootball",   // free, no key, real 2026 data (default)
  refreshHours: 3,          // how often to re-pull the openfootball JSON

  // optional — only used if source:"apifootball" AND you have a PAID api-sports.io plan
  // (the free tier blocks season 2026). Treat any key here as exposed once a build ships.
  apiKey: "",
  apiBase: "https://v3.football.api-sports.io",
  league: 1,                // FIFA World Cup
  season: 2026
};
