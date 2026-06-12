// make-banner.mjs — Portal TV (leanback) home-grid banner: the gold trophy + "Kickoff 2026"
// on the WC navy, 320x180. Rasterizes an inline SVG via macOS Quick Look (qlmanage) — no npm
// deps. qlmanage outputs a square, so we render a square SVG with the art centered and crop
// the middle 320x180 out. Run on macOS:  node make-banner.mjs [outPath]
import { writeFileSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const OUT = process.argv[2] ||
  "../android/app/src/main/res/drawable-xhdpi/banner.png";
const W = 320, H = 180, S = 320; // banner WxH; S = square render size

// Square canvas, art centered vertically around S/2 so the centered crop lands on it.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#021149"/>
      <stop offset="1" stop-color="#0a2a8c"/>
    </linearGradient>
  </defs>
  <rect width="${S}" height="${S}" fill="url(#bg)"/>
  <g transform="translate(30 125) scale(2.9)" fill="none" stroke="#f2b705"
     stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/>
    <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 20h6M12 13v4"/>
  </g>
  <text x="128" y="156" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="38" fill="#F0F0F0">Kickoff</text>
  <text x="128" y="198" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="34" fill="#1990FF">2026</text>
</svg>`;

const svgPath = join(tmpdir(), "wc_banner.svg");
const pngPath = join(tmpdir(), "wc_banner.svg.png");
writeFileSync(svgPath, svg);
try { rmSync(pngPath); } catch {}
execSync(`qlmanage -t -s ${S} -o ${tmpdir()} ${svgPath}`, { stdio: "ignore" });
mkdirSync(dirname(OUT), { recursive: true });
renameSync(pngPath, OUT);
execSync(`sips -c ${H} ${W} ${OUT}`, { stdio: "ignore" }); // crop centered ${W}x${H}
console.log("wrote", OUT, `(${W}x${H})`);
