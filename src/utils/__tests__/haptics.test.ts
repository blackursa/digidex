import { triggerHaptic } from '../haptics';
import * as ExpoHaptics from 'expo-haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

describe('Haptics Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('triggers impact haptic feedback', async () => {
    await triggerHaptic('impact');
    expect(ExpoHaptics.impactAsync).toHaveBeenCalled();
  });

  it('triggers success haptic feedback', async () => {
    await triggerHaptic('success');
    expect(ExpoHaptics.notificationAsync).toHaveBeenCalledWith(
      ExpoHaptics.NotificationFeedbackType.Success
    );
  });

  it('triggers error haptic feedback', async () => {
    await triggerHaptic('error');
    expect(ExpoHaptics.notificationAsync).toHaveBeenCalledWith(
      ExpoHaptics.NotificationFeedbackType.Error
    );
  });

  it('handles missing expo-haptics gracefully', async () => {
    const originalImpactAsync = ExpoHaptics.impactAsync;
    const originalNotificationAsync = ExpoHaptics.notificationAsync;

    // Simulate missing expo-haptics
    (ExpoHaptics.impactAsync as jest.Mock).mockImplementation(() => {
      throw new Error('expo-haptics not available');
    });
    (ExpoHaptics.notificationAsync as jest.Mock).mockImplementation(() => {
      throw new Error('expo-haptics not available');
    });

    // Should not throw errors
    await expect(triggerHaptic('impact')).resolves.toBeUndefined();
    await expect(triggerHaptic('success')).resolves.toBeUndefined();
    await expect(triggerHaptic('error')).resolves.toBeUndefined();

    // Restore original implementations
    ExpoHaptics.impactAsync = originalImpactAsync;
    ExpoHaptics.notificationAsync = originalNotificationAsync;
  });

  it('handles invalid haptic type gracefully', async () => {
    await expect(triggerHaptic('invalid' as any)).resolves.toBeUndefined();
  });
});
