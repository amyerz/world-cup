// icons.jsx — SVG icons + small shared components/hooks. Exports to window.
const { useState, useEffect, useRef } = React;

const Ic = {
  groups: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/></svg>,
  bracket: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 5h6v5h4M3 19h6v-5M21 12h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="20" cy="12" r="1.6" fill="currentColor"/></svg>,
  matches: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  stadiums: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M2 8c0-1.7 4.5-3 10-3s10 1.3 10 3-4.5 3-10 3S2 9.7 2 8Z" stroke="currentColor" strokeWidth="2"/><path d="M2 8v6c0 1.7 4.5 3 10 3s10-1.3 10-3V8" stroke="currentColor" strokeWidth="2"/><path d="M8 10.5v8M16 10.5v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  globe: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="currentColor" strokeWidth="2"/></svg>,
  countries: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="currentColor" strokeWidth="2"/></svg>,
  chev: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrowL: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  play: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7L8 5Z"/></svg>,
  ball: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7.5l2.6 1.9-1 3.1h-3.2l-1-3.1L12 7.5Z" fill="currentColor"/></svg>,
  trophy: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 20h6M12 13v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  stad: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><ellipse cx="12" cy="12" rx="9" ry="6" stroke="currentColor" strokeWidth="2"/><ellipse cx="12" cy="12" rx="3.5" ry="2.4" stroke="currentColor" strokeWidth="2"/><path d="M12 6V3.5M12 20.5V18M3 12h2.5M18.5 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  home: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 11l8-7 8 7M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  star: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8L12 3.6Z"/></svg>,
  starO: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8L12 3.6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>,
  clock: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  stats: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 21V11M12 21V4M19 21v-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>,
  menu: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bell: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M18 8.5a6 6 0 0 0-12 0c0 6.5-2.5 7.5-2.5 7.5h17S18 15 18 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M10 19.5a2.2 2.2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  bellOn: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M18 8.5a6 6 0 0 0-12 0c0 6.5-2.5 7.5-2.5 7.5h17S18 15 18 8.5Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M10 19.5a2.2 2.2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
};
function Icon({ name, className, style }) {
  const C = Ic[name];
  return C ? <C className={className} style={style} /> : null;
}

// Flag image via flagcdn
function Flag({ code, cls = "", w = 80 }) {
  return <img className={"flag " + cls} src={window.flagUrl(code, w)} alt=""
    loading="lazy" onError={(e) => { e.target.style.visibility = "hidden"; }} />;
}

// Live countdown hook -> targets a timestamp (ms). Returns {d,h,m,s,done}
function useCountdown(targetMs) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  let diff = Math.max(0, Math.floor((targetMs - now) / 1000));
  const d = Math.floor(diff / 86400); diff -= d * 86400;
  const h = Math.floor(diff / 3600); diff -= h * 3600;
  const m = Math.floor(diff / 60); const s = diff - m * 60;
  return { d, h, m, s, done: targetMs - now <= 0 };
}

// Live match clock that ticks minutes up
function useLiveMinute(start) {
  const [min, setMin] = useState(start);
  useEffect(() => {
    const id = setInterval(() => setMin((x) => (x < 90 ? x + 1 : x)), 9000);
    return () => clearInterval(id);
  }, []);
  return min;
}

function Countdown({ target, t }) {
  const { d, h, m, s } = useCountdown(target);
  const segs = d > 0
    ? [[d, t.days], [h, t.hrs], [m, t.mins]]
    : [[h, t.hrs], [m, t.mins], [s, t.secs]];
  return (
    <div className="cd">
      {segs.map(([v, u], i) => (
        <div className="seg" key={i}>
          <div className="v">{String(v).padStart(2, "0")}</div>
          <div className="u">{u}</div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Icon, Flag, Countdown, useCountdown, useLiveMinute, React_hooks: { useState, useEffect, useRef } });
