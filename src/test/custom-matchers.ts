import { Platform } from 'react-native';

expect.extend({
  toBeVisibleOnPlatform(received: any, platform: 'web' | 'native') {
    const isWeb = Platform.OS === 'web';
    const shouldBeVisible = platform === 'web' ? isWeb : !isWeb;
    const pass = Boolean(received) === shouldBeVisible;

    return {
      pass,
      message: () =>
        `expected ${received} to ${shouldBeVisible ? 'be' : 'not be'} visible on ${platform}`,
    };
  },
});
