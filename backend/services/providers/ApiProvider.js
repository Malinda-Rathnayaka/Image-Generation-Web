import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { BaseProvider } from './BaseProvider.js';
import { MockProvider } from './MockProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

export class ApiProvider extends BaseProvider {
  constructor(apiKey) {
    super();
    const rawKey = apiKey || process.env.AI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    // Strip accidental surrounding quotes or whitespace
    this.apiKey = rawKey.trim().replace(/^["']|["']$/g, '');
    this.apiUrl = (process.env.AI_API_URL || '').trim();
    this.mockFallback = new MockProvider();
  }

  async generateImage(prompt, options = {}) {
    if (!this.apiKey) {
      console.warn('[API Provider] No API key present. Using Mock generation.');
      return await this.mockFallback.generateImage(prompt, options);
    }

    const cleanPrompt = (prompt || 'digital artwork').trim();
    console.log(`[API Provider] Connecting to live API with key (${this.apiKey.slice(0, 6)}...) for prompt: "${cleanPrompt}"`);

    // Determine aspect ratio from requested dimensions
    let aspectRatio = '1:1';
    if (options.width && options.height) {
      const ratio = options.width / options.height;
      if (ratio > 1.3) aspectRatio = '16:9';
      else if (ratio < 0.75) aspectRatio = '9:16';
      else if (ratio > 1.1) aspectRatio = '4:3';
      else if (ratio < 0.9) aspectRatio = '3:4';
    }

    try {
      let imageBuffer = null;
      let directUrl = null;

      // 1. Google AI Studio Endpoint (Supports both new AQ. keys and legacy AIza keys)
      const isGoogleKey = this.apiKey.startsWith('AQ.') || this.apiKey.startsWith('AIza') || !this.apiUrl;
      if (isGoogleKey) {
        // Modern multimodal image generation models (Gemini Flash Image / Pro Image)
        const modernEndpoints = [
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`,
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent`,
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent`,
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent`
        ];

        const modernPayload = {
          contents: [{ parts: [{ text: `Generate an image: ${cleanPrompt}` }] }],
          generationConfig: {
            responseModalities: ['IMAGE']
          }
        };

        for (const endpointUrl of modernEndpoints) {
          try {
            const urlWithKey = `${endpointUrl}?key=${encodeURIComponent(this.apiKey)}`;
            console.log(`[API Provider] Calling Google endpoint: ${endpointUrl.split('/').pop()}...`);

            const res = await fetch(urlWithKey, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': this.apiKey
              },
              body: JSON.stringify(modernPayload)
            });

            if (!res.ok) {
              const errBody = await res.text();
              if (res.status === 429) {
                console.warn(`[API Provider] Google Quota (429): Free tier limit is 0 for image generation. Google requires Pay-As-You-Go billing enabled on this project. Details: ${errBody.slice(0, 150)}`);
              } else {
                console.warn(`[API Provider] Google endpoint error (${res.status}): ${errBody.slice(0, 160)}`);
              }
              continue;
            }

            const data = await res.json();
            const parts = data?.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                console.log('[API Provider] Successfully received high-definition image from Google Gemini Image API!');
                break;
              }
            }

            if (imageBuffer) break;
          } catch (fetchErr) {
            console.warn('[API Provider] Endpoint fetch error:', fetchErr.message);
          }
        }

        // Secondary fallback: Legacy Imagen 3 Predict endpoints
        if (!imageBuffer) {
          const predictEndpoints = [
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict`,
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-fast-generate-001:predict`
          ];

          const predictPayload = {
            instances: [{ prompt: cleanPrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: aspectRatio,
              outputMimeType: 'image/jpeg'
            }
          };

          for (const endpointUrl of predictEndpoints) {
            try {
              const urlWithKey = `${endpointUrl}?key=${encodeURIComponent(this.apiKey)}`;
              const res = await fetch(urlWithKey, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify(predictPayload)
              });

              if (!res.ok) continue;

              const data = await res.json();
              const base64Data = data?.predictions?.[0]?.bytesBase64Encoded;
              if (base64Data) {
                imageBuffer = Buffer.from(base64Data, 'base64');
                console.log('[API Provider] Successfully received image from Google Imagen endpoint!');
                break;
              }
            } catch (err) {}
          }
        }
      }

      // 2. Custom or Standard REST Endpoint (if AI_API_URL is configured)
      if (!imageBuffer && this.apiUrl) {
        const res = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: cleanPrompt,
            width: options.width || 512,
            height: options.height || 512
          })
        });

        if (res.ok) {
          const data = await res.json();
          const b64 = data?.image || data?.data?.[0]?.b64_json;
          const url = data?.url || data?.data?.[0]?.url;
          if (b64) imageBuffer = Buffer.from(b64, 'base64');
          else if (url) directUrl = url;
        }
      }

      // 3. Save buffer to local uploads/ directory if successful
      if (imageBuffer) {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fileName = `art_live_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.jpg`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, imageBuffer);

        return {
          imagePath: `/uploads/${fileName}`,
          simulatedCost: 0.004
        };
      }

      if (directUrl) {
        return {
          imagePath: directUrl,
          simulatedCost: 0.004
        };
      }

      // If live API was unable to return bytes (e.g. quota limit, model access restriction on key)
      console.warn('[API Provider] Live API did not return image. Gracefully generating prompt visual fallback.');
      return await this.mockFallback.generateImage(cleanPrompt, options);

    } catch (error) {
      console.error('[API Provider Exception]:', error.message);
      console.log('[API Provider] Gracefully falling back to prompt-matched visual generator.');
      return await this.mockFallback.generateImage(cleanPrompt, options);
    }
  }
}
