// components.jsx — standings, live-match treatments. Exports to window.
const { useState: uS } = React;

function pts(t){ return t.w*3 + t.d; }
function gd(t){ return t.gf - t.ga; }
function sortGroup(teams){
  return [...teams].sort((a,b)=> pts(b)-pts(a) || gd(b)-gd(a) || b.gf-a.gf || a.code.localeCompare(b.code));
}

// Standings table inside an expanded group
function Standings({ teams, t, onTeam, fav }){
  const rows = sortGroup(teams);
  return (
    <div>
      <table className="tbl">
        <thead><tr>
          <th className="lft">{t.team}</th>
          <th>{t.col_p}</th><th>{t.col_w}</th><th>{t.col_d}</th><th>{t.col_l}</th>
          <th>{t.col_gd}</th><th>{t.col_pts}</th>
        </tr></thead>
        <tbody>
          {rows.map((tm,i)=>{
            const cls = (i<2 ? "adv" : i===2 ? "maybe" : "") + (window.isF(fav, tm.code) ? " fav" : "");
            const g = gd(tm);
            return (
              <tr key={tm.code} className={cls} onClick={()=>onTeam(tm.code)}>
                <td>
                  <div className="team-cell">
                    <span className="pos">{i+1}</span>
                    <Flag code={tm.code} w={40} />
                    <span className="tn">{window.teamName(tm.code)}</span>
                    {window.isF(fav, tm.code) && <Icon name="star" className="favstar" style={{width:13,height:13}} />}
                  </div>
                </td>
                <td>{tm.p}</td><td>{tm.w}</td><td>{tm.d}</td><td>{tm.l}</td>
                <td className={g>=0?"gd-pos":"gd-neg"}>{g>0?"+":""}{g}</td>
                <td className="pts">{pts(tm)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="legend">
        <span><i style={{background:"var(--green)"}}></i>{t.advance} (1–2)</span>
        <span><i style={{background:"var(--amber)"}}></i>{t.chanceToAdvance} (3)</span>
      </div>
    </div>
  );
}

// Follow / unfollow pill
function FavButton({ code, fav, setFav, t }){
  const on = window.isF(fav, code);
  return (
    <button className={"favbtn"+(on?" on":"")} onClick={(e)=>{ e.stopPropagation(); setFav(code); }}>
      <Icon name={on?"star":"starO"} style={{width:15,height:15}} />
      {on ? t.following : t.follow}
    </button>
  );
}

// LIVE treatments. variant: 'takeover' | 'hero' | 'mini'
function LiveMatch({ match, t, variant, broadcaster, onWatch }){
  const minute = window.useLiveMinute(match.minute);
  const home = match.home, away = match.away;
  const hn = window.teamName(home), an = window.teamName(away);

  if(variant==="mini"){
    return (
      <div className="live-mini">
        <span className="dot"></span>
        <span className="lm-sc"><Flag code={home} w={40} cls="" /> {match.hs}–{match.as} <Flag code={away} w={40}/></span>
        <button className="lm-watch" onClick={onWatch}>{t.live} {minute}{t.min}</button>
      </div>
    );
  }

  if(variant==="hero"){
    return (
      <div className="live-wrap">
        <div className="live-hero">
          <span className="side"><Flag code={home} w={80} cls="lg"/> {hn}</span>
          <span className="sc">{match.hs}</span>
          <div className="mid">
            <span className="clk">● {t.live} {minute}{t.min}</span>
            <span className="ms-vs">–</span>
          </div>
          <span className="sc">{match.as}</span>
          <span className="side"><Flag code={away} w={80} cls="lg"/> {an}</span>
          <button className="watch-sm" onClick={onWatch}>{t.watchLive}</button>
        </div>
      </div>
    );
  }

  // takeover (default, dominant)
  return (
    <div className="live-wrap">
      <div className="live-takeover">
        <div className="pitch"></div><div className="glow"></div>
        <div className="lt-inner">
          <div className="lt-top">
            <span className="live-badge"><span className="pulse"></span>{t.live}</span>
            <span className="lt-meta">{t.group} {match.group} · {minute}{t.min}</span>
          </div>
          <div className="lt-score">
            <div className="lt-team">
              <Flag code={home} w={160} />
              <span className="nm">{hn}</span>
            </div>
            <div className="lt-nums">
              <span className="n">{match.hs}</span>
              <span className="dash">–</span>
              <span className="n">{match.as}</span>
            </div>
            <div className="lt-team">
              <Flag code={away} w={160} />
              <span className="nm">{an}</span>
            </div>
          </div>
          <div className="lt-clock">● {t.liveNow} · {minute}{t.min}</div>
          <div className="lt-cta">
            <button className="watch-btn" onClick={onWatch}>
              <Icon name="play" style={{width:18,height:18}} />
              {t.watchLive}
              <span className="stream">{broadcaster || match.stream}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Standings, LiveMatch, FavButton, sortGroup, ptsOf: pts, gdOf: gd });
