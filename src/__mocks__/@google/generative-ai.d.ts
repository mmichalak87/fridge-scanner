export declare const mockGenerateContent: jest.Mock;

export declare class GoogleGenerativeAI {
  constructor(apiKey: string);
  getGenerativeModel(config: { model: string }): {
    generateContent: jest.Mock;
  };
}
