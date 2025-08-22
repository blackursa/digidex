declare namespace jest {
  interface Matchers<R> {
    toBeGreaterThan(expected: number): R;
    toThrow(expected?: string | RegExp): R;
    toBeNull(): R;
  }
}

declare module '@testing-library/jest-dom';
