import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  checkProStatus,
  getRemainingScans,
  canScan as canScanCheck,
  incrementScanCount,
  restorePurchases,
  FREE_DAILY_SCANS,
} from '../services/subscription';

interface UseSubscriptionReturn {
  isPro: boolean;
  remainingScans: number | 'unlimited';
  loading: boolean;
  canScan: () => Promise<boolean>;
  recordScan: () => Promise<void>;
  restore: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [isPro, setIsPro] = useState(false);
  const [remainingScans, setRemainingScans] = useState<number | 'unlimited'>(FREE_DAILY_SCANS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const proStatus = await checkProStatus();
      setIsPro(proStatus);
      const remaining = await getRemainingScans(proStatus);
      setRemainingScans(remaining);
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Refresh when screen gains focus (e.g. returning from paywall)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Refresh when app comes to foreground
  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        refresh();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [refresh]);

  const canScan = useCallback(async () => {
    return canScanCheck(isPro);
  }, [isPro]);

  const recordScan = useCallback(async () => {
    await incrementScanCount();
    const remaining = await getRemainingScans(isPro);
    setRemainingScans(remaining);
  }, [isPro]);

  const restore = useCallback(async () => {
    const restored = await restorePurchases();
    if (restored) {
      setIsPro(true);
      setRemainingScans('unlimited');
    }
    return restored;
  }, []);

  return {
    isPro,
    remainingScans,
    loading,
    canScan,
    recordScan,
    restore,
    refresh,
  };
}
