import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSubscription } from '../useSubscription';
import * as subscriptionService from '../../services/subscription';
import { AppState } from 'react-native';

// Mock the subscription service
jest.mock('../../services/subscription');

// Mock @react-navigation/native - don't call callback automatically
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

describe('useSubscription', () => {
  const mockCheckProStatus = subscriptionService.checkProStatus as jest.MockedFunction<
    typeof subscriptionService.checkProStatus
  >;
  const mockGetRemainingScans = subscriptionService.getRemainingScans as jest.MockedFunction<
    typeof subscriptionService.getRemainingScans
  >;
  const mockCanScan = subscriptionService.canScan as jest.MockedFunction<
    typeof subscriptionService.canScan
  >;
  const mockIncrementScanCount = subscriptionService.incrementScanCount as jest.MockedFunction<
    typeof subscriptionService.incrementScanCount
  >;
  const mockRestorePurchases = subscriptionService.restorePurchases as jest.MockedFunction<
    typeof subscriptionService.restorePurchases
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockCheckProStatus.mockResolvedValue(false);
    mockGetRemainingScans.mockResolvedValue(3);
    mockCanScan.mockResolvedValue(true);
    mockIncrementScanCount.mockResolvedValue();
    mockRestorePurchases.mockResolvedValue(false);
  });

  it('should initialize with free user defaults', async () => {
    const { result } = renderHook(() => useSubscription());

    expect(result.current.loading).toBe(true);
    expect(result.current.isPro).toBe(false);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isPro).toBe(false);
    expect(result.current.remainingScans).toBe(3);
  });

  it('should detect pro user on initialization', async () => {
    mockCheckProStatus.mockResolvedValue(true);
    mockGetRemainingScans.mockResolvedValue('unlimited');

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isPro).toBe(true);
    expect(result.current.remainingScans).toBe('unlimited');
  });

  it('should check if user can scan', async () => {
    mockCanScan.mockResolvedValue(true);

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const canScan = await result.current.canScan();

    expect(canScan).toBe(true);
    expect(mockCanScan).toHaveBeenCalledWith(false); // isPro = false
  });

  it('should record scan and update remaining scans', async () => {
    mockGetRemainingScans.mockResolvedValueOnce(3).mockResolvedValueOnce(2);

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.remainingScans).toBe(3);

    await act(async () => {
      await result.current.recordScan();
    });

    expect(mockIncrementScanCount).toHaveBeenCalled();

    // Wait for state update
    await waitFor(() => {
      expect(result.current.remainingScans).toBe(2);
    });
  });

  it('should restore purchases successfully', async () => {
    mockRestorePurchases.mockResolvedValue(true);

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let restored = false;
    await act(async () => {
      restored = await result.current.restore();
    });

    expect(restored).toBe(true);

    // Wait for state updates after restore
    await waitFor(() => {
      expect(result.current.isPro).toBe(true);
      expect(result.current.remainingScans).toBe('unlimited');
    });
  });

  it('should handle failed purchase restoration', async () => {
    mockRestorePurchases.mockResolvedValue(false);

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let restored = false;
    await act(async () => {
      restored = await result.current.restore();
    });

    expect(restored).toBe(false);
    expect(result.current.isPro).toBe(false);
  });

  it('should refresh subscription status', async () => {
    mockCheckProStatus.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    mockGetRemainingScans.mockResolvedValueOnce(3).mockResolvedValueOnce('unlimited');

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isPro).toBe(false);
    expect(result.current.remainingScans).toBe(3);

    await act(async () => {
      await result.current.refresh();
    });

    // Wait for state updates after refresh
    await waitFor(() => {
      expect(result.current.isPro).toBe(true);
      expect(result.current.remainingScans).toBe('unlimited');
    });
  });

  it('should handle errors during refresh gracefully', async () => {
    mockCheckProStatus.mockRejectedValue(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to refresh subscription:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should set up AppState listener for foreground refresh', async () => {
    const { unmount } = renderHook(() => useSubscription());

    expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();

    // Verify cleanup happens
    const mockRemove = (AppState.addEventListener as jest.Mock).mock.results[0].value.remove;
    expect(mockRemove).toBeDefined();
  });

  it('should refresh when returning from background', async () => {
    let stateChangeHandler: ((state: string) => void) | null = null;

    (AppState.addEventListener as jest.Mock).mockImplementation((event, handler) => {
      if (event === 'change') {
        stateChangeHandler = handler;
      }
      return { remove: jest.fn() };
    });

    mockCheckProStatus.mockResolvedValue(false);
    mockGetRemainingScans.mockResolvedValueOnce(3).mockResolvedValueOnce(2);

    renderHook(() => useSubscription());

    await waitFor(() => {
      expect(mockGetRemainingScans).toHaveBeenCalled();
    });

    // Clear previous calls
    mockGetRemainingScans.mockClear();

    // Simulate app going to background then active
    await act(async () => {
      if (stateChangeHandler) {
        stateChangeHandler('background');
      }
    });

    expect(mockGetRemainingScans).not.toHaveBeenCalled();

    await act(async () => {
      if (stateChangeHandler) {
        stateChangeHandler('active');
      }
    });

    await waitFor(() => {
      expect(mockGetRemainingScans).toHaveBeenCalled();
    });
  });

  it('should update remaining scans for pro users correctly', async () => {
    mockCheckProStatus.mockResolvedValue(true);
    mockGetRemainingScans.mockResolvedValue('unlimited');

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isPro).toBe(true);
    expect(result.current.remainingScans).toBe('unlimited');

    await act(async () => {
      await result.current.recordScan();
    });

    // Pro users should still have unlimited scans
    expect(result.current.remainingScans).toBe('unlimited');
  });
});
