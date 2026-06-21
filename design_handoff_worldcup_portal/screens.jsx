// screens.jsx — Home, Groups, Team, Bracket, Matches, TeamPicker. Exports to window.
const { useState: useS, useMemo, useEffect: useE } = React;

/* ---------- shared helpers ---------- */
function CdText({ target, t }){
  const { d, h, m, s } = window.useCountdown(target);
  let str = d>0 ? `${d}${t.days} ${h}${t.hrs}`
          : h>0 ? `${h}${t.hrs} ${String(m).padStart(2,"0")}${t.mins}`
          : `${m}${t.mins} ${String(s).padStart(2,"0")}${t.secs}`;
  return <span>{str}</span>;
}

function dayLabel(ms, t, lang){
  const k = window.dayKeyOf(ms), now = Date.now();
  if(k===window.dayKeyOf(now)) return t.today;
  if(k===window.dayKeyOf(now+86400000)) return t.tomorrow;
  return window.fmtDay(ms, lang);
}
function relDays(ms, t){
  const d0=new Date(); d0.setHours(0,0,0,0);
  const d1=new Date(ms); d1.setHours(0,0,0,0);
  const diff=Math.round((d1-d0)/86400000);
  if(diff<2) return null;
  return (t.inDaysTpl||"in {n} days").replace("{n}", diff);
}
function useNow(){
  const [n,setN] = useS(Date.now());
  useE(()=>{ const id=setInterval(()=>setN(Date.now()),1000); return ()=>clearInterval(id); },[]);
  return n;
}

/* Prominent alert when a reminded match kicks off within minutes */
function SoonBanner({ m, t, onWatch }){
  const { h, m:mm, s } = window.useCountdown(m._kick);
  const cd = h>0 ? `${h}:${String(mm).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${mm}:${String(s).padStart(2,"0")}`;
  return (
    <div className="soon-banner">
      <div className="soon-glow"></div>
      <span className="soon-badge"><span className="soon-dot"></span>{t.startingSoon}</span>
      <div className="soon-match">
        <Flag code={m.home} w={80}/>
        <b>{window.teamName(m.home)}</b>
        <span className="soon-v">{t.vs}</span>
        <b>{window.teamName(m.away)}</b>
        <Flag code={m.away} w={80}/>
      </div>
      <div className="soon-cd"><Icon name="clock" style={{width:17,height:17}}/><span>{cd}</span></div>
      <button className="soon-watch" onClick={()=>onWatch(m)}><Icon name="play" style={{width:15,height:15}}/>{t.watchLive}</button>
    </div>
  );
}

/* Shared match card (compact stacked layout — robust at narrow widths) */
function MatchCard({ m, t, lang, fav, region, reminders, onRemind, onWatch, onTeam, big, hideRel }){
  const minute = window.useLiveMinute(m.status==="live" ? m.minute : 0);
  const isFav = window.isF(fav, m.home) || window.isF(fav, m.away);
  const reminded = reminders && reminders.indexOf(m.id)!==-1;
  const isPast = m.status==="finished" || (m.status==="upcoming" && m._kick < Date.now());
  const showScore = m.status!=="upcoming";
  const winH = m.status==="finished" && m.hs>m.as, winA = m.status==="finished" && m.as>m.hs;
  return (
    <div className={"mcard"+(big?" big":"")+(isFav?" fav":"")+(m.status==="live"?" islive":"")+(isPast?" past":"")}>
      <div className="mc-top">
        <span className="mc-when">
          {m.status==="upcoming" && <><b>{window.fmtTime(m._kick, lang)}</b>{!hideRel && relDays(m._kick, t) && <em>· {relDays(m._kick, t)}</em>}</>}
          {m.status==="live" && <span className="mc-live"><i></i>{t.live} · {minute}{t.min}</span>}
          {m.status==="finished" && <span className="mc-ft">{t.finished}</span>}
        </span>
        <span className="mc-grp">{m.round ? t[m.round] : t.group+" "+m.group}</span>
        {m.status==="upcoming" && !isPast && onRemind &&
          <button className={"mc-bell"+(reminded?" on":"")} title={reminded?t.reminderOn:t.remindMe} onClick={(e)=>{ e.stopPropagation(); onRemind(m); }}>
            <Icon name={reminded?"bellOn":"bell"} style={{width:14,height:14}}/>
          </button>}
      </div>
      <div className="mc-rows">
        <button className={"mc-row"+(winA?" dim":"")} onClick={()=>onTeam(m.home)}>
          <Flag code={m.home} w={40}/>
          <span className="mc-name">{window.teamName(m.home)}{window.isF(fav,m.home) && <Icon name="star" className="favstar" style={{width:12,height:12}}/>}</span>
          {showScore && <span className="mc-sc">{m.hs}</span>}
        </button>
        <button className={"mc-row"+(winH?" dim":"")} onClick={()=>onTeam(m.away)}>
          <Flag code={m.away} w={40}/>
          <span className="mc-name">{window.teamName(m.away)}{window.isF(fav,m.away) && <Icon name="star" className="favstar" style={{width:12,height:12}}/>}</span>
          {showScore && <span className="mc-sc">{m.as}</span>}
        </button>
      </div>
      {m.status==="upcoming" && !isPast && <div className="mc-cd"><Icon name="clock" style={{width:12,height:12}}/> <CdText target={m._kick} t={t}/></div>}
      {m.status==="live" && <button className="mcard-watch" onClick={()=>onWatch(m)}>● {t.watchLive} · {window.primaryBroadcaster(region)}</button>}
    </div>
  );
}

function DayMatches({ matches, t, lang, fav, region, reminders, onRemind, onWatch, onTeam }){
  const days = [];
  matches.forEach(m=>{
    const k = window.dayKeyOf(m._kick);
    let d = days.find(x=>x.k===k);
    if(!d){ d={k, ms:m._kick, list:[]}; days.push(d); }
    d.list.push(m);
  });
  return days.map(d=>(
    <div key={d.k} style={{marginBottom:20}}>
      <div className="match-day">{dayLabel(d.ms, t, lang)}{relDays(d.ms, t) && <span className="md-rel"> · {relDays(d.ms, t)}</span>}</div>
      <div className="match-grid">
        {d.list.map(m=> <MatchCard key={m.id} m={m} t={t} lang={lang} fav={fav} region={region} reminders={reminders} onRemind={onRemind} onWatch={onWatch} onTeam={onTeam} hideRel={true} />)}
      </div>
    </div>
  ));
}

/* Month calendar (Mon–Sun) for the watchlist — June / July tabs + ceremonies */
const CEREMONIES = [
  { m:5, d:11, key:"openingCeremony", ic:"star", matchId:"m-live", lead:120, dur:90 },   // June 11 — opening (before opener)
  { m:6, d:19, key:"finalDay", ic:"trophy", matchId:"k9", lead:90, dur:75 },              // July 19 — final / closing
];
function ceremonyTimes(cer){ const mm = cer && window.MATCHES.find(x=>x.id===cer.matchId); if(!mm) return null; const s = mm._kick-(cer.lead||0)*60000; return { s, e:s+(cer.dur||90)*60000 }; }
function weekStart(loc){
  try{ const l=new Intl.Locale(loc); const wi=(typeof l.getWeekInfo==="function"?l.getWeekInfo():l.weekInfo); if(wi&&wi.firstDay) return wi.firstDay%7; }catch(e){}
  return (["en-US","ja-JP","pt-BR","zh-CN","zh-Hant"].indexOf(loc)!==-1) ? 0 : 1; // 0=Sunday, 1=Monday
}
function WatchCalendar({ matches, t, lang, fav, region, reminders, onRemind, onWatch, onTeam }){
  const loc = window.LOCALE[lang] || "en-US";
  const year = 2026;
  const monthsAvail = [5, 6]; // June, July (tournament months)
  const byKey = {};
  matches.forEach(m=>{ const d=new Date(m._kick); const k=d.getMonth()+"-"+d.getDate(); (byKey[k]=byKey[k]||[]).push(m); });
  const sorted = matches.slice().sort((a,b)=>a._kick-b._kick);
  const firstM = sorted[0];
  const _initSel = (()=>{ const n=new Date(), tk=n.getMonth()+"-"+n.getDate(); if(byKey[tk]) return tk; const next=sorted.find(m=>m._kick>=Date.now()); if(next) return new Date(next._kick).getMonth()+"-"+new Date(next._kick).getDate(); if(firstM) return new Date(firstM._kick).getMonth()+"-"+new Date(firstM._kick).getDate(); return tk; })();
  const defMonth = _initSel ? Number(_initSel.split("-")[0]) : (firstM ? new Date(firstM._kick).getMonth() : 5);
  const [month, setMonth] = useS(defMonth);
  const [sel, setSel] = useS(_initSel);
  const [expDays, setExpDays] = useS({}); // portrait: which day cells are expanded past the 2-match cap

  const ws = weekStart(loc); // 0=Sunday, 1=Monday
  const first = new Date(year, month, 1);
  const startDow = (first.getDay()-ws+7)%7;
  const dim = new Date(year, month+1, 0).getDate();
  const cells = []; for(let i=0;i<startDow;i++) cells.push(null); for(let d=1;d<=dim;d++) cells.push(d);
  const wd = []; for(let i=0;i<7;i++) wd.push(new Date(2024,0,7+((ws+i)%7)).toLocaleDateString(loc,{weekday:"short"})); // Jan 7 2024 = Sunday
  const now = new Date(); const todayK = now.getMonth()+"-"+now.getDate();
  const evOf = (m,d)=> CEREMONIES.find(c=>c.m===m && c.d===d);

  const selParts = sel ? sel.split("-").map(Number) : null;
  const selMatches = (sel && byKey[sel]) ? byKey[sel].slice().sort((a,b)=>a._kick-b._kick) : [];
  const selEv = selParts ? evOf(selParts[0], selParts[1]) : null;
  const selDateMs = selParts ? new Date(year, selParts[0], selParts[1]).getTime() : null;
  // Which week-row of the displayed month holds the selected day (-1 if it's in another month tab).
  const selDay = (selParts && selParts[0]===month) ? selParts[1] : null;
  const selWeek = selDay!=null ? Math.floor((startDow + selDay - 1)/7) : -1;
  const selCol = selDay!=null ? (startDow + selDay - 1)%7 : 0;
  const detail = (selEv || selMatches.length>0) ? (
    <div className="wcal-day wcal-day-inline" key={"d-"+sel} style={{"--sel-col":selCol}}>
      <div className="wcal-day-head">
        <span className="wcal-day-date">{window.fmtDay(selDateMs, lang)}</span>
        {selMatches.length>0 && <span className="wcal-day-count">{selMatches.length}</span>}
      </div>
      {selEv && <div className={"wcal-ceremony"+(selEv.key==="finalDay"?" final":"")}>
        <span className="wc-ic"><Icon name={selEv.ic} style={{width:22,height:22}}/></span>
        <div><b>{t[selEv.key]}</b><span>{(()=>{ const c=ceremonyTimes(selEv); return c ? window.fmtTime(c.s,lang)+" – "+window.fmtTime(c.e,lang)+" · "+window.tzName() : t.appName+" "+t.appYear; })()}</span></div>
      </div>}
      {selMatches.length>0 && <div className="match-grid">{selMatches.map(m=> <MatchCard key={m.id} m={m} t={t} lang={lang} fav={fav} region={region} reminders={reminders} onRemind={onRemind} onWatch={onWatch} onTeam={onTeam} hideRel={true} />)}</div>}
    </div>
  ) : null;

  return (
    <div className="wcal">
      <div className="wcal-tabs">
        {monthsAvail.map(mo=>(
          <button key={mo} className={"wcal-tab"+(mo===month?" on":"")} onClick={()=>setMonth(mo)}>
            {new Date(year,mo,1).toLocaleDateString(loc,{month:"long"})}
          </button>
        ))}
      </div>
      <div className="wcal-grid wcal-wd">{wd.map((w,i)=><div className="wcal-wdc" key={i}>{w}</div>)}</div>
      <div className="wcal-grid">
        {cells.map((d,i)=>{
          const lastOfWeek = ((i%7===6) || (i===cells.length-1)) && Math.floor(i/7)===selWeek && detail;
          if(d===null) return <div className="wcal-cell empty" key={i}></div>;
          const k = month+"-"+d; const dm = byKey[k]; const ev = evOf(month, d);
          const cell = (
            <button className={"wcal-cell"+(dm?" has":"")+(ev?" event":"")+(k===sel?" sel":"")+(k===todayK?" today":"")+(expDays[k]?" expanded":"")}
              onClick={()=>(dm||ev)&&setSel(k)}>
              <span className="wcal-date">{d}</span>
              {ev && <span className="wcal-evico"><Icon name={ev.ic} style={{width:13,height:13}}/></span>}
              {dm && <span className="wcal-evts">
                {dm.map((m,j)=>(
                  <span className={"wcal-evt"+(m.status==="finished"||(m.status==="upcoming"&&m._kick<Date.now())?" past":"")} key={j}>
                    <span className="ev-flags"><Flag code={m.home} w={40}/><Flag code={m.away} w={40}/></span>
                    <span className="ev-time">{window.fmtTime(m._kick, lang)}</span>
                  </span>
                ))}
                {dm.length>2 && <span className="wcal-more" role="button"
                  onClick={(e)=>{ e.stopPropagation(); setExpDays(p=>Object.assign({}, p, {[k]: !p[k]})); }}>
                  {expDays[k] ? "−" : "+"+(dm.length-2)}
                </span>}
              </span>}
            </button>
          );
          return lastOfWeek ? <React.Fragment key={i}>{cell}{detail}</React.Fragment> : <React.Fragment key={i}>{cell}</React.Fragment>;
        })}
      </div>
      <div className="wcal-legend">
        <span><i className="lg-dot"></i>{t.watchlist}</span>
        <span><Icon name="star" style={{width:12,height:12,color:"var(--accent)"}}/>{t.openingCeremony}</span>
        <span><Icon name="trophy" style={{width:12,height:12,color:"var(--gold)"}}/>{t.finalDay}</span>
      </div>
      {!detail && <div className="wcal-empty">{t.watchlistEmpty}</div>}
    </div>
  );
}

/* ---------- HOME (Portal focus) ---------- */
function HomeScreen({ t, lang, live, liveVariant, fav, region, reminders, onRemind, onTeam, onWatch, onPick, onSeeAll }){
  const now = useNow();
  const [mode, setMode] = useS("my");
  const upcoming = window.MATCHES.filter(m=>m.status==="upcoming").sort((a,b)=>a._kick-b._kick);
  const watchlist = upcoming.filter(m=> reminders && reminders.indexOf(m.id)!==-1);
  const imminent = watchlist.filter(m=> (m._kick-now)>0 && (m._kick-now)<=15*60000);
  const calMatches = mode==="my" ? watchlist : upcoming;

  return (
    <div className="content fade-in">
      {imminent.map(m=> <SoonBanner key={m.id} m={m} t={t} onWatch={onWatch} />)}

      {live && (liveVariant==="takeover"||liveVariant==="hero") &&
        <LiveMatch match={live} t={t} variant={liveVariant} broadcaster={window.primaryBroadcaster(region)} onWatch={()=>onWatch(live)} />}

      <div className="home-cols">
        <div className="home-col fav-col">
          {(!fav || fav.length===0) && <PickBanner t={t} onPick={onPick} />}
          {fav && fav.length>0 && <div className={"yt-grid"+(fav.length>1?" multi":"")}>{fav.map(c=> <YourTeamCard key={c} code={c} t={t} lang={lang} onTeam={onTeam} onWatch={onWatch} />)}</div>}
        </div>
        <div className="home-col cal-col">
          <div className="watchlist">
            <div className="sec-head wl-head">
              <h2><Icon name="matches" style={{width:21,height:21,verticalAlign:"-3px",color:"var(--blue)"}}/> {t.upcomingMatches}</h2>
              <span className="tag"><Icon name="clock" style={{width:12,height:12,verticalAlign:"-2px"}}/> {window.tzName()}</span>
              <div className="seg-toggle">
                <button className={mode==="my"?"on":""} onClick={()=>setMode("my")}>{t.myMatches}{watchlist.length>0?` · ${watchlist.length}`:""}</button>
                <button className={mode==="all"?"on":""} onClick={()=>setMode("all")}>{t.allMatches}</button>
              </div>
            </div>
            <WatchCalendar key={mode} matches={calMatches} t={t} lang={lang} fav={fav} region={region} reminders={reminders} onRemind={onRemind} onWatch={onWatch} onTeam={onTeam} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PickBanner({ t, onPick }){
  return (
    <button className="pick-banner" onClick={onPick}>
      <div className="pb-ico"><Icon name="starO" style={{width:26,height:26}}/></div>
      <div className="pb-txt">
        <div className="pb-h">{t.pickTeam}</div>
        <div className="pb-s">{t.pickTeamSub}</div>
      </div>
      <span className="pb-cta">{t.follow}<Icon name="chev" style={{width:16,height:16,transform:"rotate(-90deg)"}}/></span>
    </button>
  );
}

function YourTeamCard({ code, t, lang, onTeam, onWatch }){
  const team = window.TEAMS[code];
  const grp = window.GROUPS.find(g=>g.teams.some(x=>x.code===code));
  const rows = grp ? window.sortGroup(grp.teams) : [];
  const posIdx = rows.findIndex(x=>x.code===code);
  const standing = grp ? grp.teams.find(x=>x.code===code) : null;
  const adv = posIdx>=0 ? rows[posIdx].adv : null;
  const next = window.MATCHES.filter(m=>(m.home===code||m.away===code)&&m.status!=="finished").sort((a,b)=>a._kick-b._kick)[0];
  const ordinal = (n)=>{ if(lang!=="en") return n+""; return n+(["th","st","nd","rd"][(n%10>3||~~((n%100)/10)===1)?0:n%10]||"th"); };
  return (
    <div className="yt-card">
      <div className="yt-head" onClick={()=>onTeam(code)}>
        <Flag code={code} cls="xl" w={160}/>
        <div className="yt-info">
          <span className="yt-lbl"><Icon name="star" style={{width:13,height:13}}/> {t.yourTeam}</span>
          <span className="yt-name">{window.teamName(code)}</span>
          {grp && <span className="yt-sub">{t.group} {grp.id}</span>}
        </div>
        <Icon name="chev" className="yt-chev" style={{width:22,height:22}}/>
      </div>
      <div className="yt-statrow">
        {posIdx>=0 && standing && standing.p>0 && <div className={"yt-stat"+(posIdx<2?" hi":"")}><b>{ordinal(posIdx+1)}</b><span>{t.positionIn}</span></div>}
        {standing && <div className="yt-stat"><b>{window.ptsOf(standing)}</b><span>{t.col_pts}</span></div>}
        <div className="yt-stat"><b>#{team.rank}</b><span>FIFA</span></div>
      </div>
      {next && <div className="yt-next">
        <span className="yt-next-lbl">{t.yourNext}</span>
        <div className="yt-next-row" onClick={(e)=>{ e.stopPropagation(); next.status==="live" ? onWatch(next) : onTeam(next.home===code?next.away:next.home); }}>
          <span className="ytn-team"><Flag code={next.home} w={80}/>{window.teamName(next.home)}</span>
          <span className="ytn-mid">
            {next.status==="live"
              ? <span className="ms-status live"><i></i>{next.hs}–{next.as}</span>
              : <><b>{window.fmtTime(next._kick, lang)}</b><small>{dayLabel(next._kick, t, lang)}{relDays(next._kick, t) && <span className="rel"><span className="rel-sep"> · </span>{relDays(next._kick, t)}</span>}</small></>}
          </span>
          <span className="ytn-team away">{window.teamName(next.away)}<Flag code={next.away} w={80}/></span>
        </div>
      </div>}
    </div>
  );
}

/* ---------- GROUPS (tabbed A–L) ---------- */
function GroupFixture({ m, t, lang, fav, onTeam, onWatch }){
  const minute = window.useLiveMinute(m.status==="live" ? m.minute : 0);
  const isFav = window.isF(fav,m.home) || window.isF(fav,m.away);
  const winH = m.status==="finished" && m.hs>m.as, winA = m.status==="finished" && m.as>m.hs;
  return (
    <button className={"gfix"+(isFav?" fav":"")} onClick={()=> m.status==="live" ? onWatch(m) : onTeam(m.home)}>
      <div className="gf-top">
        {m.status==="upcoming" && <><span>{window.fmtTime(m._kick, lang)}</span><span>{window.fmtDayShort(m._kick, lang)}</span></>}
        {m.status==="live" && <span className="gf-live"><i></i>{t.live} · {minute}{t.min}</span>}
        {m.status==="finished" && <span className="gf-ft">{t.finished}</span>}
      </div>
      <div className={"gf-side"+(winA?" dim":"")}>
        <Flag code={m.home} w={40}/>
        <span className="gf-n">{window.teamName(m.home)}{window.isF(fav,m.home) && <Icon name="star" className="favstar" style={{width:11,height:11}}/>}</span>
        {m.status!=="upcoming" && <span className="gf-num">{m.hs}</span>}
      </div>
      <div className={"gf-side"+(winH?" dim":"")}>
        <Flag code={m.away} w={40}/>
        <span className="gf-n">{window.teamName(m.away)}{window.isF(fav,m.away) && <Icon name="star" className="favstar" style={{width:11,height:11}}/>}</span>
        {m.status!=="upcoming" && <span className="gf-num">{m.as}</span>}
      </div>
    </button>
  );
}

function GroupsScreen({ t, lang, fav, initGroup, region, reminders, onRemind, onTeam, onWatch }){
  const favGroup = (fav && fav.length) ? (window.GROUPS.find(g=>g.teams.some(x=>window.isF(fav,x.code)))||{}).id : null;
  const [sel, setSel] = useS(initGroup || favGroup || "A");
  const g = window.GROUPS.find(x=>x.id===sel) || window.GROUPS[0];
  const fixtures = window.MATCHES.filter(m=>m.group===sel).sort((a,b)=>(a.status==="finished")-(b.status==="finished") || a._kick-b._kick);
  return (
    <div className="content fade-in">
      <div className="sec-head"><h2>{t.nav_groups}</h2><span className="tag">{t.groupStage} · 12 {t.nav_groups.toLowerCase()}</span></div>

      <div className="group-tabs">
        {window.GROUPS.map(gr=>{
          const hasFav = gr.teams.some(x=>window.isF(fav,x.code));
          return (
            <button key={gr.id} className={"group-tab"+(gr.id===sel?" on":"")} onClick={()=>setSel(gr.id)}>
              {gr.id}
              {hasFav && <Icon name="star" className="gt-fav" style={{width:14,height:14}}/>}
            </button>
          );
        })}
      </div>

      <div className="home-cols grp-cols">
        <div className="home-col">
          <div className="panel" style={{marginBottom:16}}>
            <h3 className="panel-h"><span className="grp-badge">{g.id}</span>{t.group} {g.id} · {t.standings}</h3>
            <Standings teams={g.teams} t={t} onTeam={onTeam} fav={fav} />
          </div>
          <div className="panel" style={{marginBottom:16}}>
            <h3 className="panel-h"><Icon name="bracket" style={{width:18,height:18,color:"var(--blue)"}}/>{t.chanceToAdvance}</h3>
            {window.sortGroup(g.teams).map((tm,i)=>(
              <div className={"adv-row"+(i<2?" adv-hi":i===3?" adv-lo":"")+(window.isF(fav,tm.code)?" fav":"")} key={tm.code} onClick={()=>onTeam(tm.code)}>
                <Flag code={tm.code} w={40}/>
                <span className="arn">{window.teamName(tm.code)}{window.isF(fav,tm.code) && <Icon name="star" className="favstar" style={{width:11,height:11}}/>}</span>
                <span className="adv-bar"><span style={{width:tm.adv+"%"}}></span></span>
                <span className="adv-pct">{tm.adv}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="home-col">
          <div className="panel" style={{marginBottom:24}}>
            <h3 className="panel-h"><Icon name="matches" style={{width:18,height:18,color:"var(--blue)"}}/>{t.group} {g.id} · {t.nav_matches} <span className="tag" style={{marginLeft:"auto"}}><Icon name="clock" style={{width:12,height:12,verticalAlign:"-2px"}}/> {window.tzName()}</span></h3>
            {fixtures.length
              ? <WatchCalendar key={sel} matches={fixtures} t={t} lang={lang} fav={fav} region={region} reminders={reminders} onRemind={onRemind} onWatch={onWatch} onTeam={onTeam} />
              : <div className="gfix-empty">—</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- STATS (Golden Boot + assists) ---------- */
function Leaderboard({ title, list, k1, k2, l1, l2, t, fav, onTeam }){
  return (
    <div className="panel">
      <h3 className="panel-h"><Icon name="ball" style={{width:20,height:20,color:"var(--blue)"}}/>{title}</h3>
      <div className="scorers" style={{border:"none",boxShadow:"none"}}>
        {!list.length && <div className="gfix-empty" style={{padding:"26px 18px"}}>{t.noGoalsYet||"No goals yet"}</div>}
        {list.map((s,i)=>(
          <div className={"scorer"+(window.isF(fav,s.code)?" fav":"")} key={i}>
            <span className="rk">{i+1}</span>
            <Flag code={s.code} w={40}/>
            <div className="sp" onClick={()=>onTeam(s.code)} style={{cursor:"pointer"}}>
              <div className="nm">{s.player}{window.isF(fav,s.code) && <Icon name="star" className="favstar" style={{width:12,height:12}}/>}</div>
              <div className="ct">{window.teamName(s.code)}</div>
            </div>
            <div className="stat">
              <div className="g"><b>{s[k1]}</b><span>{l1}</span></div>
              <div className="g"><b style={{color:"var(--muted)"}}>{s[k2]}</b><span>{l2}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function FifaRanking({ t, fav, onTeam }){
  const list = Object.keys(window.TEAMS)
    .map(code=>({ code, rank: window.TEAMS[code].rank || 999 }))
    .filter(x=> x.rank>0 && x.rank<900)
    .sort((a,b)=> a.rank-b.rank);
  return (
    <div className="panel">
      <h3 className="panel-h"><Icon name="globe" style={{width:20,height:20,color:"var(--blue)"}}/>{t.fifaRank}</h3>
      <div className="scorers" style={{border:"none",boxShadow:"none"}}>
        {list.map((r,i)=>(
          <div className={"scorer"+(window.isF(fav,r.code)?" fav":"")} key={r.code} onClick={()=>onTeam(r.code)} style={{cursor:"pointer"}}>
            <span className="rk">{i+1}</span>
            <Flag code={r.code} w={40}/>
            <div className="sp">
              <div className="nm">{window.teamName(r.code)}{window.isF(fav,r.code) && <Icon name="star" className="favstar" style={{width:12,height:12}}/>}</div>
            </div>
            <div className="stat"><div className="g"><b>#{r.rank}</b><span>{t.fifaRank}</span></div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
function StatsScreen({ t, fav, onTeam }){
  const scorers = [...window.SCORERS].sort((a,b)=> b.g-a.g || b.a-a.a);
  return (
    <div className="content fade-in">
      <div className="sec-head"><h2>{t.nav_stats}</h2><span className="tag">{t.groupStage}</span></div>
      <div className="split two">
        <Leaderboard title={t.topScorers} list={scorers} k1="g" k2="a" l1={t.goalsShort} l2={t.assistsShort} t={t} fav={fav} onTeam={onTeam} />
        <FifaRanking t={t} fav={fav} onTeam={onTeam} />
      </div>
    </div>
  );
}

/* ---------- TEAM DETAIL ---------- */
function TeamScreen({ code, t, lang, fav, setFav, region, reminders, onRemind, onWatch, onTeam, onBack }){
  const team = window.TEAMS[code];
  const roster = window.PLAYERS[code] || [];
  const grp = window.GROUPS.find(g=>g.teams.some(x=>x.code===code));
  const standing = grp ? grp.teams.find(x=>x.code===code) : null;
  const rows = grp ? window.sortGroup(grp.teams) : [];
  const posInGroup = rows.findIndex(x=>x.code===code) + 1;
  const groups = { GK:[], DEF:[], MID:[], FWD:[] };
  roster.forEach(p=> (groups[p.p]||groups.MID).push(p));
  const posMeta = [["GK",t.pos_gk],["DEF",t.pos_def],["MID",t.pos_mid],["FWD",t.pos_fwd]];
  const form = standing ? [...Array(standing.w).fill("W"),...Array(standing.d).fill("D"),...Array(standing.l).fill("L")].slice(0,5) : [];
  const initials = (n)=> n.split(" ").slice(-2).map(x=>x[0]).join("").toUpperCase();
  const teamMatches = window.MATCHES.filter(m=>m.home===code||m.away===code)
    .sort((a,b)=>{ const r={live:0,upcoming:1,finished:2}; return (r[a.status]-r[b.status]) || (a.status==="finished"? b._kick-a._kick : a._kick-b._kick); });
  const gd = standing ? standing.gf-standing.ga : 0;
  const tiles = standing ? [
    [standing.p, t.full_p], [standing.w, t.full_w], [standing.d, t.full_d], [standing.l, t.full_l],
    [standing.gf, t.col_gf], [standing.ga, t.col_ga], [(gd>0?"+":"")+gd, t.col_gd], [window.ptsOf(standing), t.col_pts],
  ] : [];

  return (
    <div className="content fade-in">
      <button className="backbtn" onClick={onBack}><Icon name="arrowL"/>{t.back}</button>
      <div className="team-hero">
        <div className="glow"></div>
        <Flag code={code} w={320}/>
        <div className="th-txt">
          <h1>{window.teamName(code)}</h1>
          <div className="th-meta">
            {grp && <span>{t.group} <b>{grp.id}</b>{posInGroup>0 && standing && standing.p>0 && <> · {t.positionIn} <b>{posInGroup}</b></>}</span>}
            {form.length>0 && <span className="form-pill">{form.map((f,i)=><i className={f} key={i}>{f}</i>)}</span>}
          </div>
          <div style={{marginTop:4}}><FavButton code={code} fav={fav} setFav={setFav} t={t} /></div>
        </div>
        <div className="rankbadge"><div className="n">{team.rank}</div><div className="l">{t.fifaRank}</div></div>
      </div>

      {standing && <div className="panel" style={{marginBottom:22}}>
        <h3 className="panel-h"><Icon name="groups" style={{width:18,height:18,color:"var(--blue)"}}/>{t.overview}</h3>
        <div className="tm-statgrid">
          {tiles.map(([v,l],i)=> <div className="tm-tile" key={i}><b>{v}</b><span>{l}</span></div>)}
        </div>
        <div className="tm-adv">
          <div className="tm-adv-top"><span>{t.chanceToAdvance}</span><b>{standing.adv}%</b></div>
          <div className="adv-bar"><span style={{width:standing.adv+"%"}}></span></div>
        </div>
      </div>}

      {teamMatches.length>0 && <div className="pos-block">
        <div className="pos-title">{t.nav_matches}<span className="ln"></span></div>
        <div className="match-grid">
          {teamMatches.map(m=> <MatchCard key={m.id} m={m} t={t} lang={lang} fav={fav} region={region} reminders={reminders} onRemind={onRemind} onWatch={onWatch} onTeam={onTeam} />)}
        </div>
      </div>}

      <div className="roster-grid">
        {posMeta.map(([k,label])=> groups[k].length>0 && (
          <div className="pos-col" key={k}>
            <div className="pos-title">{label}<span className="ln"></span></div>
            <div className="pcol-list">
              {groups[k].map((p,i)=>(
                <div className="pcard" key={i}>
                  <span className="pavatar"><span className="pinit">{initials(p.n)}</span><span className="pnum">{p.num}</span></span>
                  <div className="pinfo">
                    <div className="pn">{p.n}</div>
                    <div className="pc">{p.c}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- BRACKET (R32 → Final) ---------- */
function BracketScreen({ t, fav, onTeam, onGroup }){
  // Live bracket from the data source (window.BRACKET): each tie carries real teams
  // {h,a} + scores {hs,as}, or null (TBD) until that slot is decided — fills in as the
  // free source updates. Falls back to the bundled KO_R32 projection if no live bracket.
  const B = window.BRACKET;
  const pick = (k, n) => (B && B[k] && B[k].length) ? B[k] : Array(n).fill({});
  const rounds = [
    { key:"r32", title:t.r32, ties: (B && B.r32 && B.r32.length) ? B.r32 : window.KO_R32 },
    { key:"r16", title:t.r16, ties: pick("r16", 8) },
    { key:"qf",  title:t.qf,  ties: pick("qf", 4) },
    { key:"sf",  title:t.sf,  ties: pick("sf", 2) },
    { key:"final", title:t.final, ties: pick("final", 1), final:true },
  ];
  // Auto-scroll to focus the favourite team's tie (one-time attention pulse via CSS).
  useE(()=>{
    if(!fav || !fav.length) return;
    const id = setTimeout(()=>{
      const el = document.querySelector(".bk-tie.fav-tie");
      const sc = document.querySelector(".scroll");
      if(el && sc){
        const r = el.getBoundingClientRect(), sr = sc.getBoundingClientRect();
        sc.scrollTo({ top: sc.scrollTop + (r.top - sr.top) - sr.height*0.38, behavior:"smooth" });
      }
    }, 450);
    return ()=>clearTimeout(id);
  }, [fav]);

  return (
    <div className="content fade-in">
      <div className="sec-head"><h2>{t.nav_bracket}</h2><span className="tag">{t.r32} → {t.final}</span></div>

      <div className="bracket">
        <div className="bk-col bk-groups">
          <div className="rh">{t.groupStage}</div>
          {window.GROUPS.map(g=>(
            <div className="bk-grp" key={g.id}>
              <button className="bk-grp-h" onClick={()=>onGroup && onGroup(g.id)}>{t.group} {g.id}<Icon name="chev" style={{width:13,height:13,marginLeft:"auto",transform:"rotate(-90deg)"}}/></button>
              {window.sortGroup(g.teams).map((tm,i)=>(
                <div className={"bk-grp-row"+(i<2?" adv":"")+(window.isF(fav,tm.code)?" fav":"")} key={tm.code} onClick={()=>onTeam(tm.code)}>
                  <span className="bk-grp-pos">{i+1}</span>
                  <Flag code={tm.code} w={40}/>
                  <span className="tn" style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{window.teamName(tm.code)}</span>
                  {window.isF(fav,tm.code) && <Icon name="star" className="favstar" style={{width:11,height:11}}/>}
                </div>
              ))}
            </div>
          ))}
        </div>
        {rounds.map(col=>(
          <div className={"bk-col"+(col.key==="r32"?" wide":"")} key={col.key}>
            <div className="rh">{col.title}</div>
            {col.ties.map((m,i)=>{
              const favTie = col.key==="r32" && (window.isF(fav,m.h) || window.isF(fav,m.a));
              return (
                <div className={"bk-tie"+(col.final?" bk-final":"")+(favTie?" fav-tie":"")} key={i}>
                  {favTie && <div className="bk-favtag"><Icon name="star" style={{width:10,height:10}}/>{t.yourTeam}</div>}
                  <BkSide code={m.h} sc={m.hs} label={m.hl} t={t} fav={fav} onTeam={onTeam}/>
                  <BkSide code={m.a} sc={m.as} label={m.al} t={t} fav={fav} onTeam={onTeam}/>
                </div>
              );
            })}
          </div>
        ))}
        <div className="bk-col">
          <div className="rh">{t.champion}</div>
          <div className="champ"><Icon name="trophy" className="trophy"/><div className="ct">{t.champion}</div></div>
        </div>
      </div>
    </div>
  );
}
// Resolve a slot label like "1st A" / "2nd B" to the team currently in that position.
function slotTeam(label) {
  if (!label || !window.GROUPS || !window.sortGroup) return null;
  const m = label.match(/^([123])(?:st|nd|rd)\s+([A-L])$/);
  if (!m) return null;
  const g = window.GROUPS.find(g => g.id === m[2]);
  if (!g) return null;
  const sorted = window.sortGroup(g.teams);
  return sorted[+m[1]-1]?.code ?? null;
}
function BkSide({ code, sc, label, t, fav, onTeam }){
  const provisional = !code && slotTeam(label);
  const displayCode = code || provisional || null;
  if(!displayCode) return <div className="bk-side tbd">{label || (t.advance+"…")}</div>;
  return (
    <div className={"bk-side"+(provisional?" provisional":"")+(window.isF(fav,displayCode)?" fav":"")} onClick={()=>onTeam(displayCode)}>
      <Flag code={displayCode} w={40}/>
      <span className="tn" style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{window.teamName(displayCode)}</span>
      {window.isF(fav,displayCode) && <Icon name="star" className="favstar" style={{width:11,height:11}}/>}
      {sc!=null && <span className="bs-sc">{sc}</span>}
    </div>
  );
}

/* ---------- MATCHES ---------- */
function MatchesScreen({ t, lang, fav, region, liveVariant, reminders, onRemind, onWatch, onTeam }){
  const live = window.MATCHES.filter(m=>m.status==="live");
  const finished = window.MATCHES.filter(m=>m.status==="finished").sort((a,b)=>b._kick-a._kick);
  const upcoming = window.MATCHES.filter(m=>m.status==="upcoming").sort((a,b)=>a._kick-b._kick);
  return (
    <div className="content fade-in">
      <div className="sec-head"><h2>{t.nav_matches}</h2><span className="tag"><Icon name="clock" style={{width:13,height:13,verticalAlign:"-2px"}}/> {t.localNote} · {window.tzName()}</span></div>
      {live.length>0 && <div style={{marginBottom:24}}>
        <div className="match-day live-day">{t.liveNow}</div>
        {live.map(m=> <LiveMatch key={m.id} match={m} t={t} variant={liveVariant==="mini"?"hero":liveVariant} broadcaster={window.primaryBroadcaster(region)} onWatch={()=>onWatch(m)} />)}
      </div>}
      <WatchCalendar matches={upcoming} t={t} lang={lang} fav={fav} region={region} reminders={reminders} onRemind={onRemind} onWatch={onWatch} onTeam={onTeam} />
      {finished.length>0 && <div>
        <div className="match-day">{t.results}</div>
        <div className="match-grid">
          {finished.map(m=> <MatchCard key={m.id} m={m} t={t} lang={lang} fav={fav} region={region} reminders={reminders} onRemind={onRemind} onWatch={onWatch} onTeam={onTeam} />)}
        </div>
      </div>}
    </div>
  );
}

/* ---------- TEAM PICKER (modal) ---------- */
function TeamPicker({ t, fav, setFav, onClose }){
  const [q, setQ] = useS("");
  const all = Object.keys(window.TEAMS).map(code=>({code, name:window.teamName(code), engName:window.TEAMS[code].name, rank:window.TEAMS[code].rank||999}))
    .filter(x=> x.name.toLowerCase().includes(q.toLowerCase()) || x.engName.toLowerCase().includes(q.toLowerCase()))
    .sort((a,b)=> a.rank-b.rank);
  const count = (fav||[]).length;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="picker" onClick={e=>e.stopPropagation()}>
        <div className="picker-head">
          <div>
            <div className="picker-h">{t.pickTeam}</div>
            <div className="picker-s">{count>0 ? `${count} · ${t.following}` : t.pickTeamSub}</div>
          </div>
          <button className="picker-done" onClick={onClose}><Icon name="check" style={{width:16,height:16}}/>{t.done}</button>
        </div>
        <input className="picker-search" placeholder={t.team+"…"} value={q} onChange={e=>setQ(e.target.value)} autoFocus />
        <div className="picker-grid">
          {all.map(x=>{
            const on = window.isF(fav, x.code);
            return (
              <button key={x.code} className={"picker-team"+(on?" on":"")} onClick={()=>setFav(x.code)}>
                <Flag code={x.code} cls="lg" w={80}/>
                <span className="pt-n">{x.name}</span>
                <span className="pt-check">{on ? <Icon name="star" style={{width:13,height:13}}/> : <Icon name="starO" style={{width:13,height:13}}/>}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- COUNTRIES (pick a nation to see its stats) ---------- */
function CountriesScreen({ t, lang, fav, onTeam }){
  const [q, setQ] = useS("");
  const all = Object.keys(window.TEAMS).map(code=>({ code, name:window.teamName(code), rank:window.TEAMS[code].rank||999 }))
    .filter(x=> x.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a,b)=> a.name.localeCompare(b.name, window.LOCALE[lang]||"en"));
  return (
    <div className="content fade-in">
      <div className="sec-head"><h2>{t.nav_countries}</h2><span className="tag">{all.length}</span></div>
      <input className="ctry-search" placeholder={t.team+"…"} value={q} onChange={e=>setQ(e.target.value)} />
      <div className="ctry-grid">
        {all.map(x=>{
          const grp = window.GROUPS.find(g=>g.teams.some(y=>y.code===x.code));
          return (
            <button key={x.code} className={"ctry-card"+(window.isF(fav,x.code)?" fav":"")} onClick={()=>onTeam(x.code)}>
              <Flag code={x.code} cls="lg" w={80}/>
              <span className="ctry-info">
                <span className="ctry-n">{x.name}{window.isF(fav,x.code) && <Icon name="star" style={{width:12,height:12,color:"var(--gold)",marginLeft:5,verticalAlign:"-1px"}}/>}</span>
                <span className="ctry-sub">{grp ? t.group+" "+grp.id+" · " : ""}#{x.rank} FIFA</span>
              </span>
              <Icon name="chev" className="ctry-chev" style={{width:18,height:18,transform:"rotate(-90deg)"}}/>
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, GroupsScreen, StatsScreen, TeamScreen, BracketScreen, MatchesScreen, CountriesScreen, TeamPicker });
