# Troubleshooting Guide

## Environment Setup

### Node.js Version
This project requires Node.js 18.17.1. Use nvm to manage Node.js versions:
```powershell
# Install Node 18.17.1
nvm install 18.17.1

# Use Node 18.17.1
nvm use 18.17.1

# Verify version
node -v  # Should output v18.17.1
```

### Clean Environment
If you encounter dependency installation issues:
```powershell
# 1. Remove existing dependencies and lock files
Remove-Item -Recurse -Force node_modules, package-lock.json, yarn.lock

# 2. Clear npm cache
npm cache clean --force

# 3. Install with increased timeout
npm install --fetch-timeout=300000 --fetch-retries=5
```

### If Installation Stalls
1. Network Issues:
   - Try a different network connection
   - Check proxy settings
   - Temporarily disable VPN

2. System Issues:
   - Check antivirus/firewall settings
   - Verify disk space
   - Monitor system resources

3. Alternative Installation:
   ```powershell
   # Install core dependencies first
   npm install --save-exact expo@49.0.8 react@18.2.0 react-native@0.72.3

   # Then install dev dependencies
   npm install --save-exact -D jest@29.6.2
   ```

## Running Tests

### Basic Test Run
```powershell
# Run single test file
npx jest src/screens/__tests__/QRScannerScreen.test.js --no-cache --runInBand

# Run all tests
npx jest --no-cache --runInBand
```

### Test Configuration
The project uses a consolidated Jest configuration in `jest.config.js`:
- Single worker for stability
- Force exit to prevent hangs
- Detect open handles
- 2000ms timeout per test

### Common Test Issues

1. **Timeouts**
   - Increase timeout in waitFor calls
   - Ensure jest.runAllTimers() is called after async operations
   - Check for unresolved Promises

2. **Memory Issues**
   - Run tests with --runInBand flag
   - Clear Jest cache with --no-cache
   - Monitor system memory usage

3. **Type Errors**
   - Use JavaScript (.js) files if TypeScript setup is incomplete
   - Ensure @types packages are installed
   - Check tsconfig.json settings

## Firebase Configuration

### Environment Variables
Required variables in `.env`:
```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

### Firebase Setup
The project uses @react-native-firebase packages:
- @react-native-firebase/app
- @react-native-firebase/firestore

Verify Firebase initialization in `src/config/firebase.ts`.
