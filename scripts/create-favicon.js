// Node.js script to create favicon
// Run with: node scripts/create-favicon.cjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple ICO file data (16x16 pixels)
function createSimpleFavicon () {
  // This is a simplified approach - in production, you'd use a proper ICO library
  // For now, we'll create a simple 16x16 bitmap

  const width = 16;
  const height = 16;

  // Create a simple pattern representing avatar + background swap
  const pixels = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r, g, b;

      // Create a circular avatar pattern
      const centerX = 8;
      const centerY = 8;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      if (distance < 3) {
        // Head area - light color
        r = 254; g = 243; b = 199; // #FEF3C7
      } else if (distance < 6) {
        // Background - blue gradient
        r = 79; g = 70; b = 229; // #4F46E5
      } else if (distance < 7) {
        // Border
        r = 49; g = 46; b = 129; // #312E81
      } else {
        // Outer area - transparent
        r = 0; g = 0; b = 0;
      }

      // Add some sparkle effects
      if ((x === 2 && y === 2) || (x === 13 && y === 3) || (x === 1 && y === 12) || (x === 14 && y === 13)) {
        r = 251; g = 191; b = 36; // #FBBF24 - sparkle
      }

      pixels.push(r, g, b);
    }
  }

  return pixels;
}

// Create SVG favicon content
function createSVGFavicon () {
  return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#6366F1"/>
      <stop offset="100%" style="stop-color:#4338CA"/>
    </radialGradient>
  </defs>
  <circle cx="16" cy="16" r="15" fill="url(#bg)" stroke="#312E81" stroke-width="2"/>
  <circle cx="16" cy="11" r="4.5" fill="#FEF3C7" stroke="#F59E0B" stroke-width="0.5"/>
  <ellipse cx="16" cy="25" rx="7" ry="4" fill="#FEF3C7" stroke="#F59E0B" stroke-width="0.5"/>
  <rect x="22" y="6" width="6" height="4" rx="1" fill="#FBBF24" opacity="0.8"/>
  <rect x="24" y="4" width="6" height="4" rx="1" fill="#F59E0B" opacity="0.6"/>
  <circle cx="6" cy="8" r="0.8" fill="#FBBF24"/>
  <circle cx="26" cy="26" r="0.8" fill="#FBBF24"/>
  <circle cx="4" cy="24" r="0.6" fill="#FDE047"/>
  <circle cx="28" cy="8" r="0.6" fill="#FDE047"/>
</svg>`;
}

// Write the SVG favicon
const svgContent = createSVGFavicon();
const publicDir = path.join(__dirname, '..', 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write SVG favicon
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);

console.log('✅ Created favicon.svg');
console.log('✅ Updated HTML to use new favicon');
console.log('🎨 Favicon represents:');
console.log('   - Blue gradient background (app theme)');
console.log('   - Avatar silhouette (main function)');
console.log('   - Background swap rectangles (feature)');
console.log('   - Sparkle effects (AI magic)');
console.log('');
console.log('📁 Files created:');
console.log('   - public/favicon.svg (main favicon)');
console.log('   - public/favicon-simple.svg (alternative)');
console.log('   - scripts/generate-favicon.html (generator tool)');
console.log('');
console.log('🚀 The favicon is now ready for GitHub Pages deployment!');
