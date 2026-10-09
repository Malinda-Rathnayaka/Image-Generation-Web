import { BaseProvider } from './BaseProvider.js';

export class MockProvider extends BaseProvider {
  async generateImage(prompt, options = {}) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (Math.random() < 0.10) {
      throw new Error('MockProvider: Artificial generation failure.');
    }

    return {
      imagePath: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      simulatedCost: 0.002
    };
  }
}