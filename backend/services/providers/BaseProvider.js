export class BaseProvider {
  async generateImage(prompt, options) {
    throw new Error("Method 'generateImage()' must be implemented.");
  }
}