export default {
  expo: {
    name: 'CookVision',
    slug: 'fridge',
    version: '1.2.13',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    scheme: 'fridge',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#4CAF50',
    },
    ios: {
      bundleIdentifier: 'com.4orce-tech.fridgescanner',
      supportsTablet: true,
      googleServicesFile: './GoogleService-Info.plist',
      infoPlist: {
        NSCameraUsageDescription: 'This app needs camera access to scan your fridge contents',
        NSPhotoLibraryUsageDescription: 'This app needs photo library access to select fridge photos',
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.forcetech.fridgescanner',
      googleServicesFile: './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#4CAF50',
      },
      edgeToEdgeEnabled: true,
      permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE'],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      'expo-localization',
      [
        'expo-camera',
        {
          cameraPermission: 'Allow CookVision to access your camera to scan fridge contents',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow CookVision to access your photos',
        },
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/crashlytics',
    ],
  },
};
