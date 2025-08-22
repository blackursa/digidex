# Test Guidelines and Best Practices

## Test Structure

Each test file should follow this structure:

1. **Mock Setup**
   ```javascript
   const mocks = {
     service1: { ... },
     service2: { ... }
   };
   
   jest.mock('path/to/service1', () => mocks.service1);
   ```

2. **Test Suite Organization**
   ```javascript
   describe('ComponentName', () => {
     let cleanupFns = [];
   
     beforeAll(async () => {
       jest.useFakeTimers();
       await Promise.resolve(); // Initialize global deps
     });
   
     afterAll(async () => {
       jest.useRealTimers();
       await Promise.all(cleanupFns.map(fn => fn()));
       cleanupFns = [];
     });
   
     beforeEach(() => {
       jest.clearAllMocks();
       cleanupFns = [];
     });
   });
   ```

3. **Test Case Structure**
   ```javascript
   it('should [expected behavior]', async () => {
     // Setup
     const mocks = { ... };
   
     // Render with cleanup
     const { getByTestId, unmount } = renderWithProviders(<Component />);
     cleanupFns.push(unmount);
   
     try {
       // Wait for component to be ready
       await waitFor(() => {
         expect(getByTestId('element')).toBeTruthy();
       }, { timeout: 2000 });
   
       // Simulate user action
       fireEvent(element, 'action');
   
       // Run timers for async operations
       jest.runAllTimers();
   
       // Verify expected behavior
       await waitFor(() => {
         expect(mockFunction).toHaveBeenCalled();
       }, { timeout: 2000 });
     } catch (error) {
       console.error('Test failed:', error);
       throw error;
     }
   });
   ```

## Best Practices

1. **Async Testing**
   - Always use `async/await` with proper error handling
   - Set reasonable timeouts (2000ms recommended)
   - Run timers after async operations with `jest.runAllTimers()`

2. **Cleanup**
   - Track cleanup functions in `cleanupFns` array
   - Always unmount components after tests
   - Reset mocks between tests

3. **Error Handling**
   - Wrap test logic in try/catch blocks
   - Log errors for debugging
   - Re-throw errors to fail tests properly

4. **Mocking**
   - Define mocks at the top of the file
   - Use jest.mock for module-level mocks
   - Reset mocks between tests

5. **Accessibility**
   - Test screen reader announcements
   - Verify haptic feedback
   - Test with accessibility features enabled

## Common Patterns

### Testing QR Scanner
```javascript
// Setup scanner mocks
mockedIsScanningAvailable.mockResolvedValue(true);
mockedParseQRCode.mockResolvedValue({ userId: 'test-user' });

// Simulate scan
fireEvent(getByTestId('qr-scanner'), 'onBarCodeScanned', {
  type: 'qr',
  data: 'test-qr-code'
});

// Verify results
await waitFor(() => {
  expect(mockedParseQRCode).toHaveBeenCalledWith('test-qr-code');
});
```

### Testing Error States
```javascript
mockedParseQRCode.mockRejectedValue(new Error('Invalid QR code'));

await waitFor(() => {
  expect(getByText(/invalid qr code/i)).toBeTruthy();
});

expect(mockedAccessibilityAnnounce).toHaveBeenCalledWith(
  expect.stringMatching(/invalid qr code/i)
);
```
