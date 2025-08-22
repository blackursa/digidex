// Haptics utility with graceful fallback
let Haptics: typeof import('expo-haptics') | null = null;

try {
  // Use require since we can't use dynamic import
  Haptics = require('expo-haptics');
} catch (error) {
  console.warn('Haptics not available:', error);
}

export const triggerHaptic = async (type: 'success' | 'error' | 'impact') => {
  if (!Haptics) return;

  try {
    switch (type) {
      case 'success':
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        break;
      case 'error':
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
        break;
      case 'impact':
        await Haptics.impactAsync(
          Haptics.ImpactFeedbackStyle.Medium
        );
        break;
    }
  } catch (error) {
    console.warn('Failed to trigger haptic:', error);
  }
};
