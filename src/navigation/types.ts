export type RootStackParamList = {
  Home: undefined;
  Onboarding: undefined;
  Camera: undefined;
  Gallery: undefined;
  Results: { imageBase64?: string; scanId?: string };
  Settings: undefined;
  Favorites: undefined;
  Paywall: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
