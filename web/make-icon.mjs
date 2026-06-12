// make-icon.mjs — generate the launcher PNG: the app's gold trophy on the WC navy field.
// Rasterizes an inline SVG (the same `trophy` icon used in the app) via macOS Quick Look
// (`qlmanage`) — no npm deps. Run on macOS:  node make-icon.mjs [outPath]
import { writeFileSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const OUT = process.argv[2] ||
  "../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png";
const SIZE = 512;

// Trophy paths are copied verbatim from design_handoff_worldcup_portal/icons.jsx (name "trophy"),
// scaled from its 24x24 viewBox to fill the icon, stroked in WC gold on a navy gradient.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#021149"/>
      <stop offset="1" stop-color="#0a2a8c"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#bg)"/>
  <g transform="translate(106 106) scale(12.5)" fill="none" stroke="#f2b705"
     stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/>
    <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 20h6M12 13v4"/>
  </g>
</svg>`;

const svgPath = join(tmpdir(), "wc_icon.svg");
const pngPath = join(tmpdir(), "wc_icon.svg.png");
writeFileSync(svgPath, svg);
try { rmSync(pngPath); } catch {}
execSync(`qlmanage -t -s ${SIZE} -o ${tmpdir()} ${svgPath}`, { stdio: "ignore" });
mkdirSync(dirname(OUT), { recursive: true });
renameSync(pngPath, OUT);
console.log("wrote", OUT, `(${SIZE}x${SIZE} trophy)`);
