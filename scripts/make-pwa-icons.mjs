import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

// Reuse the existing vector brand; the maskable icon keeps its shield in the safe circle.
const root = resolve(import.meta.dirname, "..");
const out = resolve(root, "public/icons");
await mkdir(out, { recursive: true });
const svg = await readFile(resolve(root, "public/favicon.svg"));
for (const size of [192, 512]) {
  await sharp(svg).resize(size, size).png().toFile(resolve(out, `icon-${size}.png`));
}
const maskable = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#3864eb"/><g transform="translate(4.48 4.48) scale(.72)"><path d="M16 5 25 9v7c0 6-9 11-9 11S7 22 7 16V9Z" fill="none" stroke="white" stroke-width="2"/><path d="m11 16 3 3 7-7" fill="none" stroke="white" stroke-width="2"/></g></svg>');
await sharp(maskable).resize(512, 512).png().toFile(resolve(out, "icon-maskable-512.png"));
await sharp(maskable).resize(180, 180).png().toFile(resolve(out, "apple-touch-icon.png"));
