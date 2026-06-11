// probe-of.mjs — learn openfootball worldcup.json schema (2022 = populated, 2026 = current).
const J = async (u) => (await fetch(u)).json();
const CDN = "https://cdn.jsdelivr.net/gh/openfootball/worldcup.json@master";

for (const year of ["2022", "2026"]) {
  const url = `${CDN}/${year}/worldcup.json`;
  let d;
  try { d = await J(url); } catch (e) { console.log(year, "FETCH FAIL", e + ""); continue; }
  const ms = d.matches || [];
  console.log(`\n===== ${year} =====  name="${d.name}"  matches=${ms.length}`);
  // distinct rounds
  const rounds = [...new Set(ms.map(m => m.round))];
  console.log("rounds:", rounds.join(" | "));
  // a played match (has score) and a knockout match
  const played = ms.find(m => m.score);
  console.log("sample PLAYED:", played ? JSON.stringify(played) : "none with .score");
  const ko = ms.find(m => /Round|Final|Quarter|Semi/i.test(m.round || ""));
  console.log("sample KO:", ko ? JSON.stringify(ko) : "none");
  // distinct team tokens (group stage only, to see real names vs placeholders)
  const names = new Set();
  ms.forEach(m => { [m.team1, m.team2].forEach(t => { if (typeof t === "string") names.add(t); else if (t && t.name) names.add(t.name); }); });
  console.log(`team tokens (${names.size}):`, [...names].sort().join(", "));
  // how many have scores
  console.log("with score:", ms.filter(m => m.score).length, " group field sample:", JSON.stringify(ms[0]?.group));
}
