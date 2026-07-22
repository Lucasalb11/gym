/* Gera os ícones do PWA a partir de um SVG. Rode com: npx tsx scripts/icons.ts */
import { mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const svg = (pad: number) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0f0f0f"/>
  <g transform="translate(${pad} ${pad}) scale(${(512 - pad * 2) / 512})">
    <g stroke="#a3e635" stroke-width="34" stroke-linecap="round" fill="none">
      <line x1="96" y1="176" x2="96" y2="336"/>
      <line x1="164" y1="140" x2="164" y2="372"/>
      <line x1="348" y1="140" x2="348" y2="372"/>
      <line x1="416" y1="176" x2="416" y2="336"/>
      <line x1="164" y1="256" x2="348" y2="256"/>
    </g>
  </g>
</svg>`;

async function main() {
  const out = path.join(process.cwd(), "public", "icons");
  mkdirSync(out, { recursive: true });
  await sharp(Buffer.from(svg(0))).resize(192, 192).png().toFile(path.join(out, "icon-192.png"));
  await sharp(Buffer.from(svg(0))).resize(512, 512).png().toFile(path.join(out, "icon-512.png"));
  await sharp(Buffer.from(svg(80))).resize(512, 512).png().toFile(path.join(out, "icon-maskable-512.png"));
  await sharp(Buffer.from(svg(0))).resize(180, 180).png().toFile(path.join(out, "apple-touch-icon.png"));
  console.log("Ícones gerados em public/icons/");
}

main();
