import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMaxFavorites,
  getMaxRecentScans,
  getDailyScanUsage,
  incrementScanCount,
  canScan,
  getRemainingScans,
  FREE_DAILY_SCANS,
  FREE_MAX_FAVORITES,
  PRO_MAX_FAVORITES,
  FREE_MAX_RECENT_SCANS,
  PRO_MAX_RECENT_SCANS,
} from '../subscription';

jest.mock('@react-native-async-storage/async-storage');

describe('Subscription Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Limits', () => {
    it('should return correct max favorites for free users', () => {
      expect(getMaxFavorites(false)).toBe(FREE_MAX_FAVORITES);
    });

    it('should return correct max favorites for pro users', () => {
      expect(getMaxFavorites(true)).toBe(PRO_MAX_FAVORITES);
    });

    it('should return correct max recent scans for free users', () => {
      expect(getMaxRecentScans(false)).toBe(FREE_MAX_RECENT_SCANS);
    });

    it('should return correct max recent scans for pro users', () => {
      expect(getMaxRecentScans(true)).toBe(PRO_MAX_RECENT_SCANS);
    });
  });

  describe('Daily Scan Usage', () => {
    const getTodayKey = () => new Date().toISOString().split('T')[0];

    it('should get daily scan usage with 0 count for new day', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const usage = await getDailyScanUsage();

      expect(usage.date).toBe(getTodayKey());
      expect(usage.count).toBe(0);
    });

    it('should get existing daily scan usage', async () => {
      const mockUsage = {
        date: getTodayKey(),
        count: 2,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUsage));

      const usage = await getDailyScanUsage();

      expect(usage).toEqual(mockUsage);
    });

    it('should reset count for old date', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const oldUsage = {
        date: yesterday.toISOString().split('T')[0],
        count: 5,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(oldUsage));

      const usage = await getDailyScanUsage();

      expect(usage.date).toBe(getTodayKey());
      expect(usage.count).toBe(0);
    });

    it('should increment scan count', async () => {
      const mockUsage = {
        date: getTodayKey(),
        count: 1,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUsage));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await incrementScanCount();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'daily_scan_usage',
        JSON.stringify({ date: getTodayKey(), count: 2 })
      );
    });
  });

  describe('Scan Permissions', () => {
    const getTodayKey = () => new Date().toISOString().split('T')[0];

    it('should allow pro users to scan unlimited times', async () => {
      const result = await canScan(true);
      expect(result).toBe(true);
    });

    it('should allow free users to scan when under limit', async () => {
      const mockUsage = {
        date: getTodayKey(),
        count: 1,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUsage));

      const result = await canScan(false);

      expect(result).toBe(true);
    });

    it('should not allow free users to scan when at limit', async () => {
      const mockUsage = {
        date: getTodayKey(),
        count: FREE_DAILY_SCANS,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUsage));

      const result = await canScan(false);

      expect(result).toBe(false);
    });

    it('should return unlimited scans for pro users', async () => {
      const remaining = await getRemainingScans(true);
      expect(remaining).toBe('unlimited');
    });

    it('should return correct remaining scans for free users', async () => {
      const mockUsage = {
        date: getTodayKey(),
        count: 1,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUsage));

      const remaining = await getRemainingScans(false);

      expect(remaining).toBe(FREE_DAILY_SCANS - 1);
    });

    it('should return 0 when free user has used all scans', async () => {
      const mockUsage = {
        date: getTodayKey(),
        count: FREE_DAILY_SCANS,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUsage));

      const remaining = await getRemainingScans(false);

      expect(remaining).toBe(0);
    });

    it('should not return negative remaining scans', async () => {
      const mockUsage = {
        date: getTodayKey(),
        count: FREE_DAILY_SCANS + 5,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUsage));

      const remaining = await getRemainingScans(false);

      expect(remaining).toBe(0);
    });
  });
});
