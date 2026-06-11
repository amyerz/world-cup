// make-icon.mjs — generate a 512x512 launcher PNG with zero dependencies.
// Portal requires a real PNG in mipmap-xxxhdpi/ (adaptive-only icons don't show).
// Design: deep-navy field, a white "ball" disc with navy panels, a gold ring.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const S = 512;
const buf = Buffer.alloc(S * S * 4);

const NAVY = [2, 17, 73];
const NAVY2 = [10, 42, 140];
const WHITE = [245, 247, 252];
const GOLD = [242, 183, 5];

function set(x, y, [r, g, b], a = 255) {
  const i = (y * S + x) * 4;
  buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
}
function lerp(a, b, t) { return [0, 1, 2].map(k => Math.round(a[k] + (b[k] - a[k]) * t)); }
function dist(x, y, cx, cy) { return Math.hypot(x - cx, y - cy); }

const cx = S / 2, cy = S / 2;
const ballR = 168;       // white disc radius
const ringR = 196;       // gold ring radius
const ringW = 12;

// panels: a few small navy discs on the ball to suggest a football
const panels = [
  [cx, cy, 46],
  [cx - 92, cy - 40, 30],
  [cx + 92, cy - 40, 30],
  [cx - 60, cy + 86, 28],
  [cx + 60, cy + 86, 28],
];

for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    // background diagonal gradient
    let col = lerp(NAVY, NAVY2, (x + y) / (2 * S));
    const d = dist(x, y, cx, cy);

    // gold ring
    if (Math.abs(d - ringR) <= ringW) {
      col = GOLD;
    } else if (d <= ballR) {
      col = WHITE;
      for (const [px, py, pr] of panels) {
        if (dist(x, y, px, py) <= pr) { col = NAVY; break; }
      }
    }
    set(x, y, col, 255);
  }
}

// ---- encode PNG ----
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0, 0);
  return Buffer.concat([len, body, crc]);
}
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(b) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 6;  // color type RGBA
ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

// raw scanlines with filter byte 0
const raw = Buffer.alloc(S * (S * 4 + 1));
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0;
  buf.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4);
}
const idat = deflateSync(raw, { level: 9 });

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", idat),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = process.argv[2] ||
  "../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png";
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);
console.log("wrote", out, png.length, "bytes");
