// scripts/generate-icons.js
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function createPng(size, colorR, colorG, colorB) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth: 8
  ihdr[9] = 2; // color type: 2 (truecolor RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk("IHDR", ihdr);

  // Raw image data: for each scanline, filter byte (0) + width * 3 bytes (RGB)
  const rowSize = 1 + size * 3;
  const rawData = Buffer.alloc(size * rowSize);

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < size; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;

      // Draw rounded robot emblem
      const dx = x - size / 2;
      const dy = y - size / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < size * 0.42) {
        // Center circle / gradient
        rawData[pixelOffset] = colorR;
        rawData[pixelOffset + 1] = colorG;
        rawData[pixelOffset + 2] = colorB;
      } else {
        // Background dark obsidian #080E1C
        rawData[pixelOffset] = 8;
        rawData[pixelOffset + 1] = 14;
        rawData[pixelOffset + 2] = 28;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk("IDAT", compressed);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, "ascii");
  data.copy(buf, 8);

  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeInt32BE(crc, 8 + len);
  return buf;
}

// Standard CRC-32 for PNG chunks
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }

  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) | 0;
}

const iconsDir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write icon-192.png, icon-512.png, apple-touch-icon.png
fs.writeFileSync(path.join(iconsDir, "icon-192.png"), createPng(192, 37, 99, 235));
fs.writeFileSync(path.join(iconsDir, "icon-512.png"), createPng(512, 56, 189, 248));
fs.writeFileSync(path.join(iconsDir, "apple-touch-icon.png"), createPng(180, 217, 107, 145));

console.log("Successfully generated PWA icons in public/icons/");

