import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MockProvider } from './MockProvider.js';
import { ApiProvider } from './ApiProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

export class ProviderFactory {
  static getProvider() {
    let fileApiKey = '';

    // Direct synchronous read and dotenv.parse on every call to guarantee 0-lag updates without server restart
    try {
      if (fs.existsSync(envPath)) {
        const rawEnv = fs.readFileSync(envPath, 'utf8');
        const parsed = dotenv.parse(rawEnv);
        if (parsed && parsed.AI_API_KEY) {
          fileApiKey = parsed.AI_API_KEY.trim();
        }
      }
    } catch (e) {
      console.warn('[ProviderFactory] Error reading .env directly:', e.message);
    }

    // Also run dotenv override so process.env is kept in sync
    try {
      dotenv.config({ path: envPath, override: true });
    } catch (e) {}

    const apiKey = (
      fileApiKey ||
      process.env.AI_API_KEY ||
      process.env.API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      ''
    ).trim();

    // Check if the key is valid and not a placeholder/comment
    const isValidKey = apiKey && 
      !apiKey.startsWith('#') && 
      !apiKey.includes('your_actual_') && 
      !apiKey.includes('your_api_key');

    if (isValidKey) {
      console.log(`[AI Engine] Active API key detected (${apiKey.slice(0, 6)}...). Using ApiProvider.`);
      return new ApiProvider(apiKey);
    }

    // Default: Mock AI that generates images regarding the prompt without requiring an API key
    console.log('[AI Engine] No live API key in .env. Using Mock AI (generates images matching your prompt).');
    return new MockProvider();
  }
}