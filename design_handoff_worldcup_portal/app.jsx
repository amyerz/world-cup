// app.jsx — shell: topbar, favorite teams, language, nav, routing, watch modal, tweaks.
const { useState: uss, useEffect: ue } = React;

// Absolute kickoff (ms) for every match → renders in viewer's LOCAL timezone.
const LOAD_NOW = Date.now();
window.MATCHES.forEach(m=>{ m._kick = LOAD_NOW + (m.offsetMin||0)*60000; if(m.status==="upcoming") m._target = m._kick; });

const LS = "wc26.v2";
const loadLS = ()=>{ try{ return JSON.parse(localStorage.getItem(LS))||{}; }catch(e){ return {}; } };
const saveLS = (o)=>{ try{ localStorage.setItem(LS, JSON.stringify({ ...loadLS(), ...o })); }catch(e){} };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "style": "classic",
  "liveVariant": "takeover",
  "accent": "#1f6bff",
  "showLiveMini": true
}/*EDITMODE-END*/;

// Region-aware "where to watch" modal.
function WatchModal({ match, t, lang, region, setRegion, onClose }){
  if(!match) return null;
  const list = window.BROADCASTERS[region] || window.BROADCASTERS.global;
  const showScore = match.status==="live" || match.status==="finished";
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="watch-modal" onClick={e=>e.stopPropagation()}>
        <div className="wm-head">
          {match.status==="live" && <span className="live-badge"><span className="pulse"></span>{t.live} · {match.minute}{t.min}</span>}
          <div className="wm-teams">
            <div className="wm-team"><Flag code={match.home} w={120} cls="lg"/><b>{window.teamName(match.home)}</b></div>
            <span className="wm-score">{showScore ? `${match.hs}–${match.as}` : window.fmtTime(match._kick, lang)}</span>
            <div className="wm-team"><Flag code={match.away} w={120} cls="lg"/><b>{window.teamName(match.away)}</b></div>
          </div>
        </div>
        <div className="wm-body">
          <div className="wm-toprow">
            <div className="wm-lbl">{t.whereToWatch}</div>
            <div className="wm-region">
              <Icon name="globe" style={{width:15,height:15,opacity:.6}}/>
              <select value={region} onChange={e=>setRegion(e.target.value)}>
                {window.REGIONS.map(r=> <option key={r.code} value={r.code}>{r.name}</option>)}
              </select>
              <Icon name="chev" style={{width:14,height:14,opacity:.5}}/>
            </div>
          </div>
          <div className="wm-channels">
            {list.map(b=>(
              <a key={b.n} href={b.u} target="_blank" rel="noopener" className="wm-chan">
                <span className="wm-chan-logo">{b.n[0]}</span>
                <span className="wm-chan-name">{b.n}</span>
                <span className={"wm-tag "+b.t}>{b.t==="free" ? t.free : t.sub}</span>
                <span className="wm-open"><Icon name="play" style={{width:13,height:13}}/>{t.openApp}</span>
              </a>
            ))}
          </div>
          <button className="wm-closebtn" onClick={onClose}>{t.close}</button>
        </div>
      </div>
    </div>
  );
}

function LangMenu({ lang, setLang }){
  const [open,setOpen] = uss(false);
  ue(()=>{ const f=()=>setOpen(false); if(open){ document.addEventListener("click",f); return ()=>document.removeEventListener("click",f);} },[open]);
  return (
    <div className="lang" onClick={e=>e.stopPropagation()}>
      <button className="lang-btn" onClick={()=>setOpen(o=>!o)}>
        <Icon name="globe"/><span className="lang-name">{window.I18N[lang]._name}</span>
        <Icon name="chev" style={{width:14,height:14}}/>
      </button>
      {open && <div className="lang-menu">
        {window.LANG_ORDER.map(code=>(
          <button key={code} className={code===lang?"on":""} onClick={()=>{setLang(code);setOpen(false);}}>
            {window.I18N[code]._name}<span className="sub">{code.toUpperCase()}</span>
          </button>
        ))}
      </div>}
    </div>
  );
}

function App(){
  const init = loadLS();
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [lang, setLangS] = uss(init.lang || "en");
  const [tab, setTabS] = uss(init.tab || "home");
  const [team, setTeam] = uss(null);
  const [groupTarget, setGroupTarget] = uss(null);
  const [watch, setWatch] = uss(null);
  const [favs, setFavsS] = uss(init.favs || (init.fav ? [init.fav] : []));
  const [reminders, setRemindersS] = uss(init.reminders || []);
  const [region, setRegionS] = uss(init.region || window.LANG_REGION[init.lang||"en"] || "us-en");
  const [picker, setPicker] = uss(false);
  const [navOpen, setNavOpenS] = uss(init.navOpen || false);
  const setNavOpen = (v)=>{ setNavOpenS(v); saveLS({ navOpen:v }); };
  const t = window.I18N[lang];
  window.__lang = lang;

  // First-visit onboarding: open the picker once if no teams followed yet.
  ue(()=>{ if((!init.favs || !init.favs.length) && !init.fav && !init.pickerSeen){ const id=setTimeout(()=>setPicker(true), 650); return ()=>clearTimeout(id);} },[]);

  const setLang = (l)=>{
    setLangS(l); saveLS({ lang:l });
    if(!loadLS().regionSet){ const r = window.LANG_REGION[l]||"us-en"; setRegionS(r); saveLS({ region:r }); }
  };
  const setTab = (x)=>{ setTeam(null); setGroupTarget(null); setTabS(x); saveLS({ tab:x }); };
  const setRegion = (r)=>{ setRegionS(r); saveLS({ region:r, regionSet:true }); };
  const scheduleReminder = (m)=>{
    try{
      if(!("Notification" in window)) return;
      if(Notification.permission==="default") Notification.requestPermission();
      const lead = m._kick - Date.now() - 5*60000;
      if(lead>0 && lead < 24*3600*1000){
        setTimeout(()=>{ try{ if(Notification.permission==="granted") new Notification(window.teamName(m.home)+" vs "+window.teamName(m.away), { body:t.kickoffIn+" "+window.fmtTime(m._kick, lang) }); }catch(e){} }, lead);
      }
    }catch(e){}
  };
  // Following a team auto-arms reminders for all its upcoming matches.
  const toggleFav = (code)=>{
    setFavsS(prev=>{
      const has = prev.includes(code);
      const nextFavs = has ? prev.filter(c=>c!==code) : [...prev, code];
      const teamMatches = window.MATCHES.filter(m=>(m.home===code||m.away===code) && m.status==="upcoming");
      setRemindersS(prevR=>{
        let nextR = prevR.slice();
        if(!has){
          teamMatches.forEach(m=>{ if(nextR.indexOf(m.id)===-1){ nextR.push(m.id); scheduleReminder(m); } });
        } else {
          teamMatches.forEach(m=>{ const other = m.home===code ? m.away : m.home; if(nextFavs.indexOf(other)===-1) nextR = nextR.filter(id=>id!==m.id); });
        }
        saveLS({ reminders:nextR });
        return nextR;
      });
      saveLS({ favs:nextFavs, pickerSeen:true });
      return nextFavs;
    });
  };
  const closePicker = ()=>{ setPicker(false); saveLS({ pickerSeen:true }); };
  const onRemind = (m)=>{
    setRemindersS(prev=>{
      const has = prev.includes(m.id);
      const next = has ? prev.filter(x=>x!==m.id) : [...prev, m.id];
      saveLS({ reminders:next });
      if(!has) scheduleReminder(m);
      return next;
    });
  };
  const openTeam = (code)=>{ setTeam(code); const sc=document.querySelector(".scroll"); if(sc) sc.scrollTop=0; };
  const openGroup = (id)=>{ setTeam(null); setTabS("groups"); saveLS({ tab:"groups" }); setGroupTarget(id); const sc=document.querySelector(".scroll"); if(sc) sc.scrollTop=0; };

  ue(()=>{ document.documentElement.lang = lang; document.documentElement.dir = t._dir; }, [lang]);

  const live = window.MATCHES.find(m=>m.status==="live");
  const onWatch = (m)=> setWatch(m || live);

  const navItems = [
    ["home", t.nav_home], ["bracket", t.nav_bracket], ["countries", t.nav_countries],
    ["groups", t.nav_groups], ["stats", t.nav_stats],
  ];

  let screen;
  if(team){ screen = <TeamScreen code={team} t={t} lang={lang} fav={favs} setFav={toggleFav} region={region} reminders={reminders} onRemind={onRemind} onWatch={onWatch} onTeam={openTeam} onBack={()=>setTeam(null)} onGroup={openGroup} />; }
  else if(tab==="home"){ screen = <HomeScreen t={t} lang={lang} live={live} liveVariant={tw.liveVariant} fav={favs} region={region} reminders={reminders} onRemind={onRemind} onTeam={openTeam} onWatch={onWatch} onPick={()=>setPicker(true)} onSeeAll={()=>setTab("matches")} />; }
  else if(tab==="countries"){ screen = <CountriesScreen t={t} lang={lang} fav={favs} onTeam={openTeam} />; }
  else if(tab==="groups"){ screen = <GroupsScreen t={t} lang={lang} fav={favs} initGroup={groupTarget} region={region} reminders={reminders} onRemind={onRemind} onTeam={openTeam} onWatch={onWatch} />; }
  else if(tab==="stats"){ screen = <StatsScreen t={t} fav={favs} onTeam={openTeam} />; }
  else if(tab==="bracket"){ screen = <BracketScreen t={t} fav={favs} onTeam={openTeam} onGroup={openGroup} />; }
  else { screen = <MatchesScreen t={t} lang={lang} fav={favs} region={region} liveVariant={tw.liveVariant} reminders={reminders} onRemind={onRemind} onWatch={onWatch} onTeam={openTeam} />; }

  return (
    <div className="app" data-style={tw.style} style={{ "--blue":tw.accent }}>
      <div className="topbar">
        <div className="brand" onClick={()=>setTab("home")} style={{cursor:"pointer"}}>
          <div className="brand-mark"><Icon name="trophy"/></div>
          <div className="brand-txt">
            <span className="yr">{t.appName} <span style={{color:"var(--blue)"}}>{t.appYear}</span></span>
            <span className="nm">{t.appHost}</span>
          </div>
        </div>
        <div className="topbar-spacer"></div>
        <button className={"fav-chip"+(favs.length?" set":"")} onClick={()=>setPicker(true)}>
          {favs.length===0
            ? <><Icon name="starO" style={{width:16,height:16}}/><span className="fc-name">{t.follow}</span></>
            : <>
                <span className="fc-flags">{favs.slice(0,3).map(c=> <Flag key={c} code={c} w={40}/>)}</span>
                <span className="fc-name">{favs.length===1 ? window.teamName(favs[0]) : favs.length+" · "+t.myTeams}</span>
                <span className="fc-act">{t.change}</span>
              </>}
        </button>
        <LangMenu lang={lang} setLang={setLang} />
      </div>

      <nav className={"nav"+(navOpen?" open":"")}>
        <button className="nav-toggle" onClick={()=>setNavOpen(!navOpen)} title="Menu">
          <Icon name="menu" />
        </button>
        {navItems.map(([id,label])=>(
          <button key={id} className={"nav-item"+(tab===id&&!team?" on":"")} onClick={()=>setTab(id)}>
            <Icon name={id} /><span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="scroll" key={tab+(team||"")}>{screen}</div>

      {live && tw.showLiveMini && tw.liveVariant==="mini" && tab!=="matches" &&
        <LiveMatch match={live} t={t} variant="mini" onWatch={()=>onWatch(live)} />}

      <WatchModal match={watch} t={t} lang={lang} region={region} setRegion={setRegion} onClose={()=>setWatch(null)} />
      {picker && <TeamPicker t={t} fav={favs} setFav={toggleFav} onClose={closePicker} />}

      <TweaksPanel>
        <TweakSection label="Visual style" />
        <TweakRadio label="Theme" value={tw.style} options={["classic","midnight","vibrant"]} onChange={v=>setTweak("style",v)} />
        <TweakColor label="Accent" value={tw.accent} options={["#1f6bff","#e3097e","#16a45d","#f2b705","#7a18d6"]} onChange={v=>setTweak("accent",v)} />
        <TweakSection label="Live match" />
        <TweakRadio label="Treatment" value={tw.liveVariant} options={["takeover","hero","mini"]} onChange={v=>setTweak("liveVariant",v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
