// Shared mock function that can be accessed from tests
export const mockGenerateContent = jest.fn();

export class GoogleGenerativeAI {
  constructor(apiKey: string) {
    // API key is not used in mock
  }

  getGenerativeModel(config: { model: string }) {
    return {
      generateContent: mockGenerateContent,
    };
  }
}
