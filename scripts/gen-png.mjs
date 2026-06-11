// Generate PNG icons using zlib + minimal PNG encoding (no external deps)
// Simple 2-color PNG: ink background + warm accent rectangle

import fs from "fs";
import zlib from "zlib";

function makePNG(width, height, pixels) {
  // pixels: Uint8Array of RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crc]);
  }
  
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  
  // IDAT
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let p = 0;
  for (let y = 0; y < height; y++) {
    raw[p++] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      raw[p++] = pixels[i];
      raw[p++] = pixels[i+1];
      raw[p++] = pixels[i+2];
      raw[p++] = pixels[i+3];
    }
  }
  const idat = zlib.deflateSync(raw);
  
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

function crc32(buf) {
  let c, t = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = t[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function generateIcon(size) {
  const pixels = new Uint8Array(size * size * 4);
  // Background ink
  const bgR = 42, bgG = 53, bgB = 72;
  // Inner card
  const cardR = 244, cardG = 244, cardB = 241;
  // Accent warm
  const acR = 212, acG = 165, acB = 116;
  // Sage
  const sgR = 122, sgG = 144, sgB = 112;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // Default bg
      let r = bgR, g = bgG, b = bgB, a = 255;
      
      const inset = size * 0.18;
      const w = size - inset * 2;
      if (x >= inset && x < inset + w && y >= inset && y < inset + w) {
        // Card area
        r = cardR; g = cardG; b = cardB;
        
        // Building icon at center
        const bx = inset + w * 0.2;
        const by = inset + w * 0.25;
        const bw = w * 0.6;
        const bh = w * 0.5;
        if (x >= bx && x < bx + bw && y >= by && y < by + bh) {
          r = bgR; g = bgG; b = bgB; // Building dark
          
          // Windows (warm)
          const winW = bw * 0.12, winH = bh * 0.6;
          const winY = by + bh * 0.1;
          for (let wn = 0; wn < 4; wn++) {
            const wx = bx + bw * (0.1 + wn * 0.18);
            if (x >= wx && x < wx + winW && y >= winY && y < winY + winH) {
              r = acR; g = acG; b = acB;
            }
          }
          
          // Ground (sage)
          const grY = by + bh * 0.78;
          if (y >= grY && y < by + bh) {
            r = sgR; g = sgG; b = sgB;
          }
        }
      }
      
      pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b; pixels[i+3] = a;
    }
  }
  
  return makePNG(size, size, pixels);
}

for (const size of [192, 512]) {
  const png = generateIcon(size);
  fs.writeFileSync(`/workspace/officelink/public/icon-${size}.png`, png);
  console.log(`✅ icon-${size}.png: ${png.length} bytes`);
}
