// Shared mock function that can be accessed from tests
export const mockGenerateContent = jest.fn();

export class GoogleGenerativeAI {
  constructor(_apiKey: string) {
    // API key is not used in mock
  }

  getGenerativeModel(_config: { model: string }) {
    return {
      generateContent: mockGenerateContent,
    };
  }
}
