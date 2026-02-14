// Mock Expo Winter Runtime and globals
global.__ExpoImportMetaRegistry = new Map();
global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
}));

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

// Mock Firebase
jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@react-native-firebase/crashlytics', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    setCrashlyticsCollectionEnabled: jest.fn(),
    recordError: jest.fn(),
    log: jest.fn(),
  })),
}));

// Mock RevenueCat
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(() => Promise.resolve()),
    getCustomerInfo: jest.fn(() => Promise.resolve({
      entitlements: { active: {} },
    })),
    getOfferings: jest.fn(() => Promise.resolve({
      all: {},
      current: { availablePackages: [] },
    })),
    purchasePackage: jest.fn(() => Promise.resolve({
      customerInfo: {
        entitlements: { active: {} },
      },
    })),
    restorePurchases: jest.fn(() => Promise.resolve({
      entitlements: { active: {} },
    })),
  },
}));

// Silence console errors/warnings during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
