# Check if nvm is installed
$nvmPath = "$env:APPDATA\nvm\nvm.exe"
if (-not (Test-Path $nvmPath)) {
    Write-Host "NVM for Windows is not installed. Please install it first:"
    Write-Host "1. Download from: https://github.com/coreybutler/nvm-windows/releases"
    Write-Host "2. Run the installer"
    Write-Host "3. Restart your terminal"
    exit 1
}

# Install and use Node.js 16.x (known stable version for React Native/Expo)
Write-Host "Installing Node.js 16.20.2..."
nvm install 16.20.2
nvm use 16.20.2

# Verify Node.js version
$nodeVersion = node -v
Write-Host "Switched to Node.js version: $nodeVersion"

# Clean install dependencies
Write-Host "Cleaning up and reinstalling dependencies..."
if (Test-Path node_modules) {
    Remove-Item -Recurse -Force node_modules
}
if (Test-Path package-lock.json) {
    Remove-Item -Force package-lock.json
}

# Install dependencies with legacy peer deps for better compatibility
npm install --legacy-peer-deps

Write-Host "Setup complete! Try running your tests again."
