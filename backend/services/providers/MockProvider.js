import { BaseProvider } from './BaseProvider.js';

export class MockProvider extends BaseProvider {
  async generateImage(prompt, options = {}) {
    // Simulate generation latency (1.2 - 2.0s)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 5% chance of simulated failure for resilience testing
    if (Math.random() < 0.05) {
      throw new Error('MockProvider: Neural engine temporary busy. Please retry.');
    }

    const width = options.width || 512;
    const height = options.height || 512;
    const transparent = !!options.transparentBackground;

    // Generate artistic SVG data based on prompt
    const hash = Array.from(prompt || 'art').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 360, 0);
    const hue1 = hash;
    const hue2 = (hash + 60) % 360;
    const hue3 = (hash + 180) % 360;

    const bgRect = transparent 
      ? `<rect width="${width}" height="${height}" fill="none" />` 
      : `<defs>
          <radialGradient id="grad1" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="hsl(${hue1}, 85%, 25%)" />
            <stop offset="50%" stop-color="hsl(${hue2}, 75%, 12%)" />
            <stop offset="100%" stop-color="hsl(${hue3}, 90%, 5%)" />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="30" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad1)" />
        <circle cx="${width * 0.4}" cy="${height * 0.4}" r="${Math.min(width, height) * 0.35}" fill="hsl(${hue2}, 80%, 45%)" opacity="0.45" filter="url(#glow)" />
        <circle cx="${width * 0.7}" cy="${height * 0.6}" r="${Math.min(width, height) * 0.28}" fill="hsl(${hue3}, 90%, 55%)" opacity="0.4" filter="url(#glow)" />`;

    const escapedPrompt = (prompt || 'Untitled Art')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .slice(0, 70);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      ${bgRect}
      <g opacity="0.25">
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </g>
      <g transform="translate(${width * 0.5}, ${height * 0.5})">
        <polygon points="0,-70 60,35 -60,35" fill="none" stroke="hsl(${hue1}, 95%, 70%)" stroke-width="3" opacity="0.8" />
        <circle cx="0" cy="0" r="85" fill="none" stroke="hsl(${hue2}, 90%, 65%)" stroke-width="2" stroke-dasharray="6,6" opacity="0.85" />
      </g>
      <rect x="24" y="${height - 76}" width="${width - 48}" height="52" rx="12" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255, 255, 255, 0.15)" />
      <text x="40" y="${height - 44}" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#f8fafc">
        ${escapedPrompt}
      </text>
      <text x="${width - 36}" y="${height - 44}" text-anchor="end" font-family="monospace" font-size="12" fill="hsl(${hue1}, 80%, 75%)">
        AI Generated • ${width}x${height}
      </text>
    </svg>`;

    const base64Svg = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');

    return {
      imagePath: base64Svg,
      simulatedCost: 0.002
    };
  }
}