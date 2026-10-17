import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { BaseProvider } from './BaseProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

export class MockProvider extends BaseProvider {
  async generateImage(prompt, options = {}) {
    console.log(`[Mock AI] Generating simulated AI asset for prompt: "${prompt}"`);

    const width = options.width || 768;
    const height = options.height || 768;
    const cleanPrompt = (prompt || 'creative digital art').trim();
    const seed = Math.floor(Math.random() * 1000000);

    // 1. Fetch real prompt-based image from zero-key neural pipeline (with extended 25s timeout)
    try {
      const encodedPrompt = encodeURIComponent(cleanPrompt);
      const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

      const response = await fetch(apiUrl, { signal: AbortSignal.timeout(25000) });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fileName = `art_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.jpg`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, buffer);

        console.log(`[Neural Engine] Successfully generated and stored prompt-matched image: /uploads/${fileName}`);

        return {
          imagePath: `/uploads/${fileName}`,
          simulatedCost: 0.001
        };
      }
    } catch (err) {
      console.warn('[Neural Engine] Prompt-based network fetch unavailable, using offline vector canvas fallback:', err.message);
    }

    // 2. Offline Fallback: Artistic generative SVG themed to the prompt
    await new Promise(resolve => setTimeout(resolve, 800));

    const hash = Array.from(cleanPrompt).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 360, 0);
    const hue1 = hash;
    const hue2 = (hash + 60) % 360;
    const hue3 = (hash + 180) % 360;

    const escapedPrompt = cleanPrompt
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .slice(0, 80);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <radialGradient id="artGrad" cx="40%" cy="30%" r="80%">
          <stop offset="0%" stop-color="hsl(${hue1}, 85%, 28%)" />
          <stop offset="50%" stop-color="hsl(${hue2}, 75%, 14%)" />
          <stop offset="100%" stop-color="hsl(${hue3}, 90%, 6%)" />
        </radialGradient>
        <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="25" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#artGrad)" />
      <g opacity="0.18">
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </g>
      <circle cx="${width * 0.35}" cy="${height * 0.38}" r="${Math.min(width, height) * 0.32}" fill="hsl(${hue2}, 85%, 50%)" opacity="0.4" filter="url(#neonGlow)" />
      <circle cx="${width * 0.68}" cy="${height * 0.58}" r="${Math.min(width, height) * 0.26}" fill="hsl(${hue3}, 90%, 55%)" opacity="0.35" filter="url(#neonGlow)" />
      <rect x="24" y="${height - 84}" width="${width - 48}" height="60" rx="14" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255, 255, 255, 0.15)" />
      <text x="44" y="${height - 48}" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="#f8fafc">
        ${escapedPrompt}
      </text>
      <text x="${width - 44}" y="${height - 48}" text-anchor="end" font-family="monospace" font-size="12" fill="hsl(${hue1}, 80%, 75%)">
        AI Generated • ${width}x${height}
      </text>
    </svg>`;

    const base64Svg = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
    return {
      imagePath: base64Svg,
      simulatedCost: 0.001
    };
  }
}