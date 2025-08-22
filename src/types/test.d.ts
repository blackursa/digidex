import '@testing-library/jest-native/extend-expect';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveStyle: (style: object) => R;
      toBeEnabled: () => R;
      toBeVisible: () => R;
      toBeDisabled: () => R;
      toHaveProp: (prop: string, value?: any) => R;
      toHaveTextContent: (text: string | RegExp) => R;
    }
  }
}
