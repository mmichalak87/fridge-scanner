// Set environment variables for tests
process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test-api-key';

// Mock Expo Winter Runtime and globals
global.__ExpoImportMetaRegistry = new Map();
global.structuredClone = obj => JSON.parse(JSON.stringify(obj));

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

// Mock react-native Platform and AppState
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: obj => obj.ios || obj.default,
  },
  AppState: {
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
  StyleSheet: {
    create: styles => styles,
    flatten: styles => styles,
  },
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  Image: 'Image',
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
    getCustomerInfo: jest.fn(() =>
      Promise.resolve({
        entitlements: { active: {} },
      })
    ),
    getOfferings: jest.fn(() =>
      Promise.resolve({
        all: {},
        current: { availablePackages: [] },
      })
    ),
    purchasePackage: jest.fn(() =>
      Promise.resolve({
        customerInfo: {
          entitlements: { active: {} },
        },
      })
    ),
    restorePurchases: jest.fn(() =>
      Promise.resolve({
        entitlements: { active: {} },
      })
    ),
  },
}));

// Silence console errors/warnings during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
