import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import { ScanUsage } from '../types';
import { logger } from '../utils/errorLogger';

const SCAN_USAGE_KEY = 'daily_scan_usage';
const REVENUECAT_IOS_KEY = 'test_puBBmSoOwzeyluNZpBGHXFbXqJO';
const REVENUECAT_ANDROID_KEY = 'test_puBBmSoOwzeyluNZpBGHXFbXqJO';
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

let initPromise: Promise<void> | null = null;
let checkProPromise: Promise<boolean> | null = null;

export function initRevenueCat(): Promise<void> {
  if (!isNative) return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
      await Purchases.configure({ apiKey });
    } catch (error) {
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
  if (!(await waitForInit())) return null;
  try {
    const offerings = await Purchases.getOfferings();

    // Try language-specific offering first (e.g. "pl_default", "de_default")
    if (languageCode) {
      const langOffering = offerings.all[`${languageCode}_default`];
      if (langOffering && langOffering.availablePackages.length > 0) {
        return langOffering.availablePackages;
      }
    }

    // Fallback to default offering
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      return offerings.current.availablePackages;
    }
    return null;
  } catch (error) {
    logger.error('Failed to get offerings', error);
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
