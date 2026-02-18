/* eslint-env jest */
// Set environment variables for tests
process.env.GEMINI_API_KEY = 'test-api-key';

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

// Mock react-native-localize
jest.mock('react-native-localize', () => ({
  getLocales: jest.fn(() => [
    { languageCode: 'en', countryCode: 'US', languageTag: 'en-US', isRTL: false },
  ]),
  findBestLanguageTag: jest.fn(() => ({ languageTag: 'en', isRTL: false })),
  getNumberFormatSettings: jest.fn(() => ({ decimalSeparator: '.', groupingSeparator: ',' })),
  getCalendar: jest.fn(() => 'gregorian'),
  getCountry: jest.fn(() => 'US'),
  getCurrencies: jest.fn(() => ['USD']),
  getTemperatureUnit: jest.fn(() => 'fahrenheit'),
  getTimeZone: jest.fn(() => 'America/New_York'),
  uses24HourClock: jest.fn(() => false),
  usesMetricSystem: jest.fn(() => false),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
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
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  StatusBar: 'StatusBar',
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  Image: 'Image',
  Alert: { alert: jest.fn() },
  Linking: { openURL: jest.fn() },
  ActivityIndicator: 'ActivityIndicator',
  FlatList: 'FlatList',
  TextInput: 'TextInput',
  Switch: 'Switch',
  Modal: 'Modal',
  Pressable: 'Pressable',
}));

// Mock @react-navigation/native-stack
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
    Group: ({ children }) => children,
  })),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  useSafeAreaFrame: jest.fn(() => ({ x: 0, y: 0, width: 375, height: 812 })),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
    setOptions: jest.fn(),
  })),
  useRoute: jest.fn(() => ({ params: {} })),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }) => children,
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

jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    setAnalyticsCollectionEnabled: jest.fn(),
    logEvent: jest.fn(),
  })),
}));

// Mock react-native-config
jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    GEMINI_API_KEY: 'test-api-key',
  },
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => ({
  __esModule: true,
  default: 'LinearGradient',
}));

// Mock react-native-vision-camera
jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  useCameraDevice: jest.fn(() => ({ id: 'back' })),
  useCameraPermission: jest.fn(() => ({ hasPermission: true, requestPermission: jest.fn() })),
}));

// Mock react-native-image-resizer
jest.mock('react-native-image-resizer', () => ({
  __esModule: true,
  default: { createResizedImage: jest.fn(() => Promise.resolve({ uri: 'resized-uri' })) },
}));

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  __esModule: true,
  default: {
    readFile: jest.fn(() => Promise.resolve('')),
    writeFile: jest.fn(() => Promise.resolve()),
    exists: jest.fn(() => Promise.resolve(true)),
    unlink: jest.fn(() => Promise.resolve()),
    DocumentDirectoryPath: '/mock/documents',
    CachesDirectoryPath: '/mock/caches',
  },
}));

// Mock @react-native-camera-roll/camera-roll
jest.mock('@react-native-camera-roll/camera-roll', () => ({
  CameraRoll: {
    getPhotos: jest.fn(() => Promise.resolve({ edges: [] })),
    save: jest.fn(() => Promise.resolve('saved-uri')),
  },
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
