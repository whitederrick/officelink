// Generate OFFICELINK app icons (SVG + simple PNG via canvas-like rendering using sharp if available)
import fs from "fs";

const svg = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2a3548"/>
      <stop offset="1" stop-color="#1a2233"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#g)"/>
  <g transform="translate(${size*0.18}, ${size*0.18})">
    <rect width="${size*0.64}" height="${size*0.64}" fill="#f4f4f1" rx="${size*0.06}"/>
    <g transform="translate(${size*0.1}, ${size*0.1})">
      <rect width="${size*0.44}" height="${size*0.32}" fill="#2a3548" rx="2"/>
      <rect x="${size*0.05}" y="${size*0.04}" width="${size*0.06}" height="${size*0.24}" fill="#d4a574"/>
      <rect x="${size*0.13}" y="${size*0.04}" width="${size*0.06}" height="${size*0.24}" fill="#d4a574"/>
      <rect x="${size*0.21}" y="${size*0.04}" width="${size*0.06}" height="${size*0.24}" fill="#d4a574"/>
      <rect x="${size*0.29}" y="${size*0.04}" width="${size*0.06}" height="${size*0.24}" fill="#d4a574"/>
      <rect x="${size*0.05}" y="${size*0.34}" width="${size*0.3}" height="${size*0.04}" fill="#7a9070"/>
    </g>
  </g>
</svg>`;

fs.writeFileSync("/workspace/officelink/public/icon-192.svg", svg(192));
fs.writeFileSync("/workspace/officelink/public/icon-512.svg", svg(512));
console.log("✅ SVG icons generated");

// Try to convert to PNG with sharp
try {
  const sharp = (await import("sharp")).default;
  for (const size of [192, 512]) {
    const buf = await sharp(Buffer.from(svg(size))).png().toBuffer();
    fs.writeFileSync(`/workspace/officelink/public/icon-${size}.png`, buf);
  }
  console.log("✅ PNG icons generated (sharp)");
} catch (e) {
  console.log("⚠️ sharp not available, falling back to PNG via simple approach");
  // Minimal PNG: 1x1 placeholder with proper structure - not ideal but works
  // Better: just use SVG as manifest icon (modern browsers accept SVG)
  console.log("   Using SVG manifest icons instead");
}
