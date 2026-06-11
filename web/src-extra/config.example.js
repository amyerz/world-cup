// config.example.js — copy to web/config.js (gitignored) and paste your key.
// The build copies web/config.js into assets/www/config.js; if web/config.js is
// missing, this example (empty key) is used and the app falls back to mock data.
window.WC_CONFIG = {
  apiKey: "",                                  // <-- your api-sports.io key
  apiBase: "https://v3.football.api-sports.io",
  league: 1,                                   // FIFA World Cup
  season: 2026
};
