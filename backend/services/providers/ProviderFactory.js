import { MockProvider } from './MockProvider.js';

export class ProviderFactory {
  static getProvider(name = process.env.DEFAULT_PROVIDER) {
    switch ((name || '').toLowerCase()) {
      case 'mock':
      default:
        return new MockProvider();
    }
  }
}