import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Platform, Dimensions } from 'react-native';
import Config from 'react-native-config';
import * as RNLocalize from 'react-native-localize';
import DeviceInfo from 'react-native-device-info';
import { ScanUsage } from '../types';
import { logger } from '../utils/errorLogger';

const SCAN_USAGE_KEY = 'daily_scan_usage';
const REVENUECAT_IOS_KEY = Config.REVENUECAT_IOS_KEY || '';
const REVENUECAT_ANDROID_KEY = Config.REVENUECAT_ANDROID_KEY || '';
const PRO_ENTITLEMENT_ID = 'pro';

// Limits
export const FREE_DAILY_SCANS = 3;
export const FREE_MAX_FAVORITES = 5;
export const PRO_MAX_FAVORITES = 25;
export const FREE_MAX_RECENT_SCANS = 5;
export const PRO_MAX_RECENT_SCANS = 50;

export function getMaxFavorites(isPro: boolean): number {
  return isPro ? PRO_MAX_FAVORITES : FREE_MAX_FAVORITES;
}

export function getMaxRecentScans(isPro: boolean): number {
  return isPro ? PRO_MAX_RECENT_SCANS : FREE_MAX_RECENT_SCANS;
}

// RevenueCat (native only - not available on web)
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

const appVersion = require('../../package.json').version;

async function setDeviceAttributes(): Promise<void> {
  try {
    const locales = RNLocalize.getLocales();
    const timezone = RNLocalize.getTimeZone();
    const { width, height } = Dimensions.get('window');

    const deviceId = await DeviceInfo.getUniqueId();
    const deviceModel = DeviceInfo.getModel();
    const deviceBrand = DeviceInfo.getBrand();

    const attributes: Record<string, string> = {
      $displayName: '',
      platform: Platform.OS,
      os_version: Platform.Version?.toString() || '',
      app_version: appVersion,
      device_id: deviceId,
      device_model: deviceModel,
      device_brand: deviceBrand,
      locale: locales[0]?.languageTag || '',
      country: locales[0]?.countryCode || '',
      timezone,
      screen: `${width}x${height}`,
    };

    // Fetch IP address
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.ip) attributes.ip_address = data.ip;
    } catch {
      // IP fetch is best-effort
    }

    await Purchases.setAttributes(attributes);
  } catch (error) {
    logger.error('Failed to set device attributes', error);
  }
}

let initPromise: Promise<void> | null = null;
let checkProPromise: Promise<boolean> | null = null;

export function initRevenueCat(): Promise<void> {
  if (!isNative) return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
      console.log(
        '[RC] Initializing with key:',
        apiKey ? `${apiKey.substring(0, 10)}...` : 'EMPTY'
      );
      await Purchases.configure({ apiKey });
      console.log('[RC] Initialized successfully');
      await setDeviceAttributes();
    } catch (error) {
      console.log('[RC] Init error:', error);
      logger.error('Failed to initialize RevenueCat', error);
    }
  })();
  return initPromise;
}

async function waitForInit(): Promise<boolean> {
  if (!isNative) return false;
  await initRevenueCat();
  return true;
}

export function checkProStatus(): Promise<boolean> {
  if (!isNative) return Promise.resolve(false);
  if (checkProPromise) return checkProPromise;
  checkProPromise = (async () => {
    if (!(await waitForInit())) return false;
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
    } catch (error) {
      logger.error('Failed to check pro status', error);
      return false;
    } finally {
      // Clear after completion so next call makes a fresh request
      checkProPromise = null;
    }
  })();
  return checkProPromise;
}

export async function getOfferings(languageCode?: string): Promise<PurchasesPackage[] | null> {
  if (!(await waitForInit())) {
    console.log('[RC] waitForInit returned false');
    return null;
  }
  try {
    console.log('[RC] Fetching offerings...');
    const offerings = await Purchases.getOfferings();
    console.log(
      '[RC] Offerings:',
      JSON.stringify({
        current: offerings.current?.identifier,
        all: Object.keys(offerings.all),
        packages: offerings.current?.availablePackages.map(p => p.identifier),
      })
    );

    // Try language-specific offering first (e.g. "pl_default", "de_default")
    if (languageCode) {
      const langOffering = offerings.all[`${languageCode}_default`];
      if (langOffering && langOffering.availablePackages.length > 0) {
        console.log('[RC] Using language offering:', `${languageCode}_default`);
        return langOffering.availablePackages;
      }
    }

    // Fallback to default offering
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      console.log('[RC] Using default offering');
      return offerings.current.availablePackages;
    }
    console.log('[RC] No offerings available');
    return null;
  } catch (error) {
    console.log('[RC] Error fetching offerings:', error);
    logger.error('Failed to get offerings', error);
    return null;
  }
}

export async function getAppUserId(): Promise<string | null> {
  if (!(await waitForInit())) return null;
  try {
    const appUserId = await Purchases.getAppUserID();
    return appUserId;
  } catch (error) {
    logger.error('Failed to get app user ID', error);
    return null;
  }
}

export type PurchaseResult = 'success' | 'no_entitlement' | 'cancelled' | 'failed';

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  if (!(await waitForInit())) return 'failed';
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
    if (!isPro) {
      logger.warn('Purchase completed but entitlement not active', {
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
      });
      return 'no_entitlement';
    }
    return 'success';
  } catch (error: any) {
    if (error.userCancelled) {
      return 'cancelled';
    }
    logger.error('Purchase failed', error);
    return 'failed';
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!(await waitForInit())) return false;
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
  } catch (error) {
    logger.error('Failed to restore purchases', error);
    return false;
  }
}

// Daily scan counting
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export async function getDailyScanUsage(): Promise<ScanUsage> {
  try {
    const data = await AsyncStorage.getItem(SCAN_USAGE_KEY);
    if (data) {
      const usage: ScanUsage = JSON.parse(data);
      if (usage.date === getTodayKey()) {
        return usage;
      }
    }
    return { date: getTodayKey(), count: 0 };
  } catch (error) {
    console.error('Failed to get scan usage:', error);
    return { date: getTodayKey(), count: 0 };
  }
}

export async function incrementScanCount(): Promise<void> {
  try {
    const usage = await getDailyScanUsage();
    const updated: ScanUsage = {
      date: getTodayKey(),
      count: usage.count + 1,
    };
    await AsyncStorage.setItem(SCAN_USAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to increment scan count:', error);
  }
}

export async function canScan(isPro: boolean): Promise<boolean> {
  if (isPro) return true;
  const usage = await getDailyScanUsage();
  return usage.count < FREE_DAILY_SCANS;
}

export async function getRemainingScans(isPro: boolean): Promise<number | 'unlimited'> {
  if (isPro) return 'unlimited';
  const usage = await getDailyScanUsage();
  return Math.max(0, FREE_DAILY_SCANS - usage.count);
}
