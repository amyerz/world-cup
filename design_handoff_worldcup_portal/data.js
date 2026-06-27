// data.js — mocked but realistic FIFA World Cup 2026 tournament data.
// Flags rendered via flagcdn.com using the codes below.

// 48 nations: code -> { name, rank (FIFA), coach }
window.TEAMS = {
  "mx":{name:"Mexico",rank:14,coach:"Javier Aguirre"},
  "hr":{name:"Croatia",rank:9,coach:"Zlatko Dalić"},
  "cm":{name:"Cameroon",rank:53,coach:"Marc Brys"},
  "uz":{name:"Uzbekistan",rank:57,coach:"Timur Kapadze"},
  "ca":{name:"Canada",rank:30,coach:"Jesse Marsch"},
  "be":{name:"Belgium",rank:8,coach:"Rudi Garcia"},
  "ci":{name:"Ivory Coast",rank:41,coach:"Emerse Faé"},
  "nz":{name:"New Zealand",rank:86,coach:"Darren Bazeley"},
  "us":{name:"United States",rank:16,coach:"Mauricio Pochettino"},
  "nl":{name:"Netherlands",rank:6,coach:"Ronald Koeman"},
  "eg":{name:"Egypt",rank:34,coach:"Hossam Hassan"},
  "jm":{name:"Jamaica",rank:55,coach:"Steve McClaren"},
  "ar":{name:"Argentina",rank:1,coach:"Lionel Scaloni"},
  "no":{name:"Norway",rank:28,coach:"Ståle Solbakken"},
  "au":{name:"Australia",rank:24,coach:"Tony Popovic"},
  "pa":{name:"Panama",rank:39,coach:"Thomas Christiansen"},
  "fr":{name:"France",rank:2,coach:"Didier Deschamps"},
  "sn":{name:"Senegal",rank:18,coach:"Pape Thiaw"},
  "jp":{name:"Japan",rank:15,coach:"Hajime Moriyasu"},
  "cw":{name:"Curaçao",rank:90,coach:"Dick Advocaat"},
  "br":{name:"Brazil",rank:5,coach:"Carlo Ancelotti"},
  "ch":{name:"Switzerland",rank:19,coach:"Murat Yakin"},
  "kr":{name:"South Korea",rank:23,coach:"Hong Myung-bo"},
  "cv":{name:"Cape Verde",rank:70,coach:"Bubista"},
  "es":{name:"Spain",rank:3,coach:"Luis de la Fuente"},
  "uy":{name:"Uruguay",rank:11,coach:"Marcelo Bielsa"},
  "ir":{name:"Iran",rank:20,coach:"Amir Ghalenoei"},
  "cr":{name:"Costa Rica",rank:54,coach:"Miguel Herrera"},
  "gb-eng":{name:"England",rank:4,coach:"Thomas Tuchel"},
  "co":{name:"Colombia",rank:13,coach:"Néstor Lorenzo"},
  "qa":{name:"Qatar",rank:36,coach:"Julen Lopetegui"},
  "tn":{name:"Tunisia",rank:49,coach:"Sami Trabelsi"},
  "pt":{name:"Portugal",rank:7,coach:"Roberto Martínez"},
  "dk":{name:"Denmark",rank:21,coach:"Brian Riemer"},
  "sa":{name:"Saudi Arabia",rank:58,coach:"Hervé Renard"},
  "gh":{name:"Ghana",rank:73,coach:"Otto Addo"},
  "de":{name:"Germany",rank:10,coach:"Julian Nagelsmann"},
  "ec":{name:"Ecuador",rank:25,coach:"Sebastián Beccacece"},
  "ng":{name:"Nigeria",rank:42,coach:"Éric Chelle"},
  "gb-sct":{name:"Scotland",rank:38,coach:"Steve Clarke"},
  "it":{name:"Italy",rank:12,coach:"Gennaro Gattuso"},
  "py":{name:"Paraguay",rank:46,coach:"Gustavo Alfaro"},
  "dz":{name:"Algeria",rank:37,coach:"Vladimir Petković"},
  "jo":{name:"Jordan",rank:62,coach:"Jamal Sellami"},
  "rs":{name:"Serbia",rank:31,coach:"Dragan Stojković"},
  "ma":{name:"Morocco",rank:17,coach:"Walid Regragui"},
  "tr":{name:"Türkiye",rank:26,coach:"Vincenzo Montella"},
  "at":{name:"Austria",rank:22,coach:"Ralf Rangnick"},
};

// Groups A–L. Each team carries current standings after 2 matchdays.
// adv = modelled chance to reach knockouts (%). p/w/d/l/gf/ga from played matches.
window.GROUPS = [
  {id:"A", teams:[
    {code:"mx", p:2,w:2,d:0,l:0,gf:4,ga:1,adv:88},
    {code:"hr", p:2,w:1,d:1,l:0,gf:3,ga:1,adv:74},
    {code:"cm", p:2,w:0,d:1,l:1,gf:1,ga:3,adv:31},
    {code:"uz", p:2,w:0,d:0,l:2,gf:1,ga:4,adv:14},
  ]},
  {id:"B", teams:[
    {code:"be", p:2,w:1,d:1,l:0,gf:4,ga:2,adv:79},
    {code:"ca", p:2,w:1,d:1,l:0,gf:3,ga:2,adv:71},
    {code:"ci", p:2,w:1,d:0,l:1,gf:2,ga:2,adv:44},
    {code:"nz", p:2,w:0,d:0,l:2,gf:1,ga:4,adv:9},
  ]},
  {id:"C", teams:[
    {code:"nl", p:2,w:2,d:0,l:0,gf:5,ga:1,adv:91},
    {code:"us", p:2,w:1,d:0,l:1,gf:3,ga:2,adv:66},
    {code:"eg", p:2,w:1,d:0,l:1,gf:2,ga:3,adv:38},
    {code:"jm", p:2,w:0,d:0,l:2,gf:1,ga:5,adv:11},
  ]},
  {id:"D", teams:[
    {code:"ar", p:2,w:2,d:0,l:0,gf:5,ga:0,adv:95},
    {code:"no", p:2,w:1,d:0,l:1,gf:4,ga:2,adv:62},
    {code:"au", p:2,w:1,d:0,l:1,gf:2,ga:3,adv:35},
    {code:"pa", p:2,w:0,d:0,l:2,gf:0,ga:6,adv:7},
  ]},
  {id:"E", teams:[
    {code:"fr", p:2,w:1,d:1,l:0,gf:4,ga:2,adv:84},
    {code:"jp", p:2,w:1,d:1,l:0,gf:3,ga:1,adv:69},
    {code:"sn", p:2,w:1,d:0,l:1,gf:3,ga:3,adv:48},
    {code:"cw", p:2,w:0,d:0,l:2,gf:1,ga:5,adv:6},
  ]},
  {id:"F", teams:[
    {code:"br", p:2,w:2,d:0,l:0,gf:6,ga:1,adv:93},
    {code:"ch", p:2,w:1,d:0,l:1,gf:3,ga:3,adv:58},
    {code:"kr", p:2,w:1,d:0,l:1,gf:2,ga:2,adv:42},
    {code:"cv", p:2,w:0,d:0,l:2,gf:1,ga:6,adv:8},
  ]},
  {id:"G", teams:[
    {code:"es", p:2,w:2,d:0,l:0,gf:5,ga:1,adv:92},
    {code:"uy", p:2,w:1,d:1,l:0,gf:3,ga:2,adv:73},
    {code:"ir", p:2,w:0,d:1,l:1,gf:1,ga:3,adv:27},
    {code:"cr", p:2,w:0,d:0,l:2,gf:1,ga:4,adv:13},
  ]},
  {id:"H", teams:[
    {code:"gb-eng", p:2,w:2,d:0,l:0,gf:4,ga:0,adv:90},
    {code:"co", p:2,w:1,d:0,l:1,gf:3,ga:2,adv:64},
    {code:"tn", p:2,w:0,d:1,l:1,gf:1,ga:3,adv:30},
    {code:"qa", p:2,w:0,d:1,l:1,gf:1,ga:4,adv:18},
  ]},
  {id:"I", teams:[
    {code:"pt", p:2,w:2,d:0,l:0,gf:5,ga:2,adv:89},
    {code:"dk", p:2,w:1,d:0,l:1,gf:3,ga:2,adv:61},
    {code:"sa", p:2,w:1,d:0,l:1,gf:2,ga:3,adv:36},
    {code:"gh", p:2,w:0,d:0,l:2,gf:1,ga:4,adv:14},
  ]},
  {id:"J", teams:[
    {code:"de", p:2,w:1,d:1,l:0,gf:4,ga:2,adv:82},
    {code:"ec", p:2,w:1,d:1,l:0,gf:2,ga:0,adv:70},
    {code:"ng", p:2,w:1,d:0,l:1,gf:3,ga:3,adv:46},
    {code:"gb-sct", p:2,w:0,d:0,l:2,gf:1,ga:5,adv:12},
  ]},
  {id:"K", teams:[
    {code:"it", p:2,w:2,d:0,l:0,gf:4,ga:1,adv:85},
    {code:"py", p:2,w:1,d:0,l:1,gf:2,ga:2,adv:52},
    {code:"dz", p:2,w:1,d:0,l:1,gf:2,ga:2,adv:45},
    {code:"jo", p:2,w:0,d:0,l:2,gf:1,ga:4,adv:15},
  ]},
  {id:"L", teams:[
    {code:"ma", p:2,w:2,d:0,l:0,gf:5,ga:1,adv:87},
    {code:"tr", p:2,w:1,d:0,l:1,gf:3,ga:2,adv:60},
    {code:"rs", p:2,w:1,d:0,l:1,gf:2,ga:2,adv:50},
    {code:"at", p:2,w:0,d:0,l:2,gf:1,ga:6,adv:13},
  ]},
];

// 16 host stadiums of the 2026 World Cup.
window.STADIUMS = [
  {id:"azteca", name:"Estadio Azteca", city:"Mexico City", country:"mx", cap:87523, matches:5, note:"Hosted the opener; the only stadium to stage three World Cups."},
  {id:"metlife", name:"MetLife Stadium", city:"New York / New Jersey", country:"us", cap:82500, matches:8, note:"Hosts the 2026 Final on July 19."},
  {id:"att", name:"AT&T Stadium", city:"Dallas", country:"us", cap:80000, matches:9, note:"Retractable roof; the most matches of any venue."},
  {id:"arrowhead", name:"Arrowhead Stadium", city:"Kansas City", country:"us", cap:76416, matches:6, note:"Among the loudest stadiums in world sport."},
  {id:"nrg", name:"NRG Stadium", city:"Houston", country:"us", cap:72220, matches:7, note:"Climate-controlled with a retractable roof."},
  {id:"sofi", name:"SoFi Stadium", city:"Los Angeles", country:"us", cap:70240, matches:8, note:"Indoor-outdoor canopy roof in Inglewood."},
  {id:"lincoln", name:"Lincoln Financial Field", city:"Philadelphia", country:"us", cap:69596, matches:6, note:"Open-air home of the Eagles."},
  {id:"levis", name:"Levi's Stadium", city:"San Francisco Bay Area", country:"us", cap:68500, matches:6, note:"Tech-forward venue in Santa Clara."},
  {id:"lumen", name:"Lumen Field", city:"Seattle", country:"us", cap:68740, matches:6, note:"Famous for its roaring atmosphere."},
  {id:"gillette", name:"Gillette Stadium", city:"Boston", country:"us", cap:65878, matches:7, note:"In Foxborough, just south of Boston."},
  {id:"hardrock", name:"Hard Rock Stadium", city:"Miami", country:"us", cap:64767, matches:7, note:"Hosts the third-place play-off."},
  {id:"akron", name:"Estadio Akron", city:"Guadalajara", country:"mx", cap:48071, matches:4, note:"Sunken bowl design inspired by a volcano."},
  {id:"bbva", name:"Estadio BBVA", city:"Monterrey", country:"mx", cap:53500, matches:4, note:"Framed by the Cerro de la Silla mountain."},
  {id:"bcplace", name:"BC Place", city:"Vancouver", country:"ca", cap:54500, matches:7, note:"Retractable-roof stadium downtown."},
  {id:"bmo", name:"BMO Field", city:"Toronto", country:"ca", cap:45000, matches:6, note:"Expanded for the tournament; Canada's opener."},
  {id:"mercedes", name:"Mercedes-Benz Stadium", city:"Atlanta", country:"us", cap:71000, matches:8, note:"Retractable petal roof; hosts a semi-final."},
];

// Matches. offsetMin = minutes from page load until kickoff (negative = already played).
// App computes m._kick (absolute ms) so dates/times render in the viewer's LOCAL timezone.
window.MATCHES = [
  // live now
  {id:"m-live", group:"A", home:"mx", away:"hr", stadium:"azteca", status:"live",
   hs:1, as:1, minute:67, stream:"FOX Sports", offsetMin:-67},
  // finished earlier
  {id:"f6", group:"L", home:"ma", away:"tr", stadium:"bbva", status:"finished", hs:2, as:1, stream:"Telemundo", offsetMin:-1260},
  {id:"f1", group:"B", home:"ca", away:"be", stadium:"bmo", status:"finished", hs:1, as:1, stream:"TSN", offsetMin:-1140},
  {id:"f2", group:"H", home:"gb-eng", away:"co", stadium:"att", status:"finished", hs:2, as:0, stream:"FOX Sports", offsetMin:-330},
  {id:"f3", group:"I", home:"pt", away:"dk", stadium:"lumen", status:"finished", hs:3, as:2, stream:"Telemundo", offsetMin:-255},
  {id:"f5", group:"K", home:"it", away:"py", stadium:"nrg", status:"finished", hs:2, as:1, stream:"FOX Sports", offsetMin:-180},
  // upcoming — today
  {id:"m1", group:"C", home:"us", away:"nl", stadium:"metlife", status:"upcoming", stream:"Telemundo", offsetMin:175},
  {id:"m2", group:"D", home:"ar", away:"no", stadium:"att", status:"upcoming", stream:"FOX Sports", offsetMin:355},
  // +1 day
  {id:"m3", group:"E", home:"fr", away:"sn", stadium:"sofi", status:"upcoming", stream:"FOX Sports", offsetMin:1500},
  {id:"m4", group:"F", home:"br", away:"ch", stadium:"hardrock", status:"upcoming", stream:"Telemundo", offsetMin:1620},
  {id:"m5", group:"G", home:"es", away:"uy", stadium:"levis", status:"upcoming", stream:"FOX Sports", offsetMin:1740},
  {id:"m7", group:"J", home:"de", away:"gb-sct", stadium:"gillette", status:"upcoming", stream:"FOX Sports", offsetMin:1860},
  // +2 days
  {id:"m8", group:"E", home:"jp", away:"cw", stadium:"bcplace", status:"upcoming", stream:"FOX Sports", offsetMin:2940},
  {id:"m9", group:"F", home:"kr", away:"cv", stadium:"lumen", status:"upcoming", stream:"FOX Sports", offsetMin:3060},
  {id:"m10", group:"I", home:"pt", away:"sa", stadium:"sofi", status:"upcoming", stream:"Telemundo", offsetMin:3180},
  {id:"m11", group:"H", home:"gb-eng", away:"tn", stadium:"att", status:"upcoming", stream:"FOX Sports", offsetMin:3300},
  // +3 days
  {id:"m12", group:"J", home:"ng", away:"ec", stadium:"mercedes", status:"upcoming", stream:"FOX Sports", offsetMin:4380},
  {id:"m13", group:"A", home:"cm", away:"uz", stadium:"akron", status:"upcoming", stream:"Telemundo", offsetMin:4500},
  // Knockout stage (projected) — spans late June into July
  {id:"k1", round:"r32", home:"ar", away:"eg", stadium:"att", status:"upcoming", stream:"FOX Sports", offsetMin:24480},   // ~Jun 28
  {id:"k2", round:"r32", home:"nl", away:"dz", stadium:"sofi", status:"upcoming", stream:"Telemundo", offsetMin:25920},   // ~Jun 29
  {id:"k3", round:"r16", home:"br", away:"kr", stadium:"hardrock", status:"upcoming", stream:"FOX Sports", offsetMin:31680}, // ~Jul 3
  {id:"k4", round:"r16", home:"fr", away:"sn", stadium:"metlife", status:"upcoming", stream:"Telemundo", offsetMin:33120}, // ~Jul 4
  {id:"k5", round:"qf",  home:"es", away:"nl", stadium:"att", status:"upcoming", stream:"FOX Sports", offsetMin:41760},   // ~Jul 10
  {id:"k6", round:"qf",  home:"gb-eng", away:"br", stadium:"sofi", status:"upcoming", stream:"FOX Sports", offsetMin:43200}, // ~Jul 11
  {id:"k7", round:"sf",  home:"ar", away:"br", stadium:"att", status:"upcoming", stream:"FOX Sports", offsetMin:48960},   // ~Jul 15
  {id:"k8", round:"sf",  home:"fr", away:"es", stadium:"metlife", status:"upcoming", stream:"Telemundo", offsetMin:50400}, // ~Jul 16
  {id:"k9", round:"final", home:"ar", away:"fr", stadium:"metlife", status:"upcoming", stream:"FOX Sports", offsetMin:54720}, // Jul 19
];

// Knockout bracket — Round of 32 (real 2026 matchups, correct visual order).
// Ordered so consecutive pairs feed the same R16 game (ESPN / FIFA bracket layout):
// pair(0,1)→R16#89→QF#97, pair(2,3)→R16#90→QF#97, pair(4,5)→R16#93→QF#98,
// pair(6,7)→R16#94→QF#98, pair(8,9)→R16#91→QF#99, pair(10,11)→R16#92→QF#99,
// pair(12,13)→R16#95→QF#100, pair(14,15)→R16#96→QF#100.
window.KO_R32 = [
  {h:"de"},          // #74 Germany vs 3rd A/B/C/D/F (TBD)
  {h:"fr"},          // #77 France vs 3rd C/D/F/G/H (TBD)
  {h:"za", a:"ca"},  // #73 South Africa vs Canada
  {h:"nl", a:"ma"},  // #75 Netherlands vs Morocco
  {},                // #83 2nd K vs 2nd L (both TBD)
  {h:"es"},          // #84 Spain vs 2nd J (TBD)
  {h:"us"},          // #81 USA vs 3rd B/E/F/I/J (TBD)
  {h:"be"},          // #82 Belgium vs 3rd A/E/H/I/J (TBD)
  {h:"br", a:"jp"},  // #76 Brazil vs Japan
  {h:"ci", a:"no"},  // #78 Ivory Coast vs Norway
  {h:"mx"},          // #79 Mexico vs 3rd C/E/F/H/I (TBD)
  {},                // #80 1st L vs 3rd E/H/I/J/K (both TBD)
  {h:"ar", a:"cv"},  // #86 Argentina vs Cape Verde
  {h:"au", a:"eg"},  // #88 Australia vs Egypt
  {h:"ch"},          // #85 Switzerland vs 3rd E/F/G/I/J (TBD)
  {},                // #87 1st K vs 3rd D/E/I/J/L (both TBD)
];

// Golden Boot race.
window.SCORERS = [
  {code:"ar", player:"Lionel Messi", g:4, a:2},
  {code:"fr", player:"Kylian Mbappé", g:3, a:1},
  {code:"br", player:"Vinícius Júnior", g:3, a:2},
  {code:"no", player:"Erling Haaland", g:3, a:0},
  {code:"gb-eng", player:"Harry Kane", g:3, a:1},
  {code:"pt", player:"Cristiano Ronaldo", g:2, a:1},
  {code:"nl", player:"Cody Gakpo", g:2, a:1},
  {code:"es", player:"Lamine Yamal", g:2, a:3},
  {code:"mx", player:"Santiago Giménez", g:2, a:0},
  {code:"ma", player:"Brahim Díaz", g:2, a:1},
];

// flagcdn only serves specific widths — snap any request up to the nearest valid one.
const FLAG_W = [20, 40, 80, 160, 320, 640, 1280, 2560];
window.flagUrl = (code, w) => { const px = FLAG_W.find(x => x >= (w||80)) || 2560; return `https://flagcdn.com/w${px}/${code}.png`; };
// Subdivision names (not covered by Intl region names).
window.SUBDIV_NAMES = {
  "gb-eng":{ en:"England", de:"England", es:"Inglaterra", fr:"Angleterre", pt:"Inglaterra", ja:"イングランド", zh:"英格兰", zt:"英格蘭" },
  "gb-sct":{ en:"Scotland", de:"Schottland", es:"Escocia", fr:"Écosse", pt:"Escócia", ja:"スコットランド", zh:"苏格兰", zt:"蘇格蘭" },
};
const _dnCache = {};
window.teamName = (code) => {
  if (!code) return "TBD";
  const lang = window.__lang || "en";
  const sub = window.SUBDIV_NAMES[code];
  if(sub && sub[lang]) return sub[lang];
  if(lang==="en" || code.indexOf("-")!==-1) return window.TEAMS[code] ? window.TEAMS[code].name : code;
  try{
    const loc = window.LOCALE[lang] || "en-US";
    let dn = _dnCache[loc]; if(!dn){ dn = new Intl.DisplayNames([loc],{type:"region"}); _dnCache[loc]=dn; }
    const n = dn.of(code.toUpperCase());
    if(n && n.toLowerCase()!==code.toLowerCase()) return n;
  }catch(e){}
  return window.TEAMS[code] ? window.TEAMS[code].name : code;
};

// BCP-47 locale per UI language, for local-time formatting.
window.LOCALE = { en:"en-US", de:"de-DE", es:"es-ES", fr:"fr-FR", pt:"pt-BR", ja:"ja-JP", zh:"zh-CN", zt:"zh-Hant" };
window.fmtTime = (ms, lang) => new Date(ms).toLocaleTimeString(window.LOCALE[lang]||"en-US", { hour:"2-digit", minute:"2-digit" });
window.fmtDay  = (ms, lang) => new Date(ms).toLocaleDateString(window.LOCALE[lang]||"en-US", { weekday:"long", month:"long", day:"numeric" });
window.fmtDayShort = (ms, lang) => new Date(ms).toLocaleDateString(window.LOCALE[lang]||"en-US", { weekday:"short", month:"short", day:"numeric" });
window.dayKeyOf = (ms) => { const d=new Date(ms); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
window.tzName = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g," "); } catch(e){ return "local"; } };

// Favorites helper (favs is an array of team codes).
window.isF = (favs, code) => Array.isArray(favs) && favs.indexOf(code) !== -1;

// Region-aware broadcasters (where to watch). type: free | sub.
window.REGIONS = [
  { code:"us-en", flag:"us", name:"United States (English)" },
  { code:"us-es", flag:"us", name:"Estados Unidos (Español)" },
  { code:"ca",    flag:"ca", name:"Canada" },
  { code:"uk",    flag:"gb", name:"United Kingdom" },
  { code:"de",    flag:"de", name:"Deutschland" },
  { code:"es",    flag:"es", name:"España" },
  { code:"fr",    flag:"fr", name:"France" },
  { code:"br",    flag:"br", name:"Brasil" },
  { code:"mx",    flag:"mx", name:"México" },
  { code:"jp",    flag:"jp", name:"日本" },
  { code:"cn",    flag:"cn", name:"中国" },
  { code:"global",flag:null, name:"Global / Other" },
];
window.BROADCASTERS = {
  "us-en":[{n:"FOX Sports",u:"https://www.foxsports.com/live",t:"free"},{n:"Fubo",u:"https://www.fubo.tv",t:"sub"},{n:"DAZN",u:"https://www.dazn.com",t:"sub"}],
  "us-es":[{n:"Telemundo",u:"https://www.telemundodeportes.com",t:"free"},{n:"Peacock",u:"https://www.peacocktv.com",t:"sub"}],
  "ca":[{n:"TSN",u:"https://www.tsn.ca",t:"sub"},{n:"CTV",u:"https://www.ctv.ca",t:"free"},{n:"RDS",u:"https://www.rds.ca",t:"sub"}],
  "uk":[{n:"BBC iPlayer",u:"https://www.bbc.co.uk/iplayer",t:"free"},{n:"ITVX",u:"https://www.itv.com/watch",t:"free"}],
  "de":[{n:"ARD",u:"https://www.ardmediathek.de",t:"free"},{n:"ZDF",u:"https://www.zdf.de",t:"free"},{n:"MagentaTV",u:"https://www.telekom.de/magenta-tv",t:"sub"}],
  "es":[{n:"RTVE Play",u:"https://www.rtve.es/play",t:"free"},{n:"Telecinco",u:"https://www.mitele.es",t:"free"}],
  "fr":[{n:"TF1",u:"https://www.tf1.fr",t:"free"},{n:"beIN Sports",u:"https://www.beinsports.com",t:"sub"}],
  "br":[{n:"Globoplay",u:"https://globoplay.globo.com",t:"free"},{n:"SporTV",u:"https://www.sportv.com",t:"sub"}],
  "mx":[{n:"TUDN",u:"https://www.tudn.com",t:"free"},{n:"ViX",u:"https://www.vix.com",t:"sub"}],
  "jp":[{n:"ABEMA",u:"https://abema.tv",t:"free"},{n:"NHK",u:"https://www.nhk.or.jp",t:"free"},{n:"DAZN",u:"https://www.dazn.com",t:"sub"}],
  "cn":[{n:"CCTV-5",u:"https://tv.cctv.com",t:"free"},{n:"Migu",u:"https://www.migu.cn",t:"sub"}],
  "global":[{n:"FIFA+",u:"https://www.fifa.com/fifaplus",t:"free"},{n:"DAZN",u:"https://www.dazn.com",t:"sub"}],
};
window.LANG_REGION = { en:"us-en", de:"de", es:"es", fr:"fr", pt:"br", ja:"jp", zh:"cn", zt:"global" };
window.primaryBroadcaster = (region) => { const b = window.BROADCASTERS[region] || window.BROADCASTERS.global; return b[0].n; };
