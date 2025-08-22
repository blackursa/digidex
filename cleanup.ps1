Write-Host "Starting cleanup process..."

# Function to safely stop processes
function Stop-ProcessSafely {
    param(
        [string]$processName
    )
    Write-Host "Checking for running $processName processes..."
    Get-Process | Where-Object { $_.ProcessName -eq $processName } | ForEach-Object {
        try {
            Write-Host "Stopping $processName process (PID: $($_.Id))..."
            $_.CloseMainWindow() | Out-Null
            if (!$_.HasExited) {
                Start-Sleep -Seconds 2
                if (!$_.HasExited) {
                    $_.Kill()
                }
            }
            $_.WaitForExit(5000)
        } catch {
            Write-Warning "Could not stop $processName process (PID: $($_.Id)): $_"
        }
    }
}

# Stop development processes gracefully
Stop-ProcessSafely -processName "node"
Stop-ProcessSafely -processName "npm"

# Clean up temporary files and caches
Write-Host "Cleaning up temporary files..."
$filesToRemove = @(
    '.jest-cache',
    'coverage',
    '.expo',
    'dist'
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Write-Host "Removing $file..."
        try {
            Remove-Item -Recurse -Force $file
        } catch {
            Write-Warning "Could not remove $file: $_"
        }
    }
}

# Clean npm cache
Write-Host "Cleaning npm cache..."
try {
    npm cache verify
    npm cache clean --force
} catch {
    Write-Warning "Could not clean npm cache: $_"
}

# Verify Node.js version
$nodeVersion = node -v
Write-Host "Current Node.js version: $nodeVersion"

# Ask for confirmation before removing node_modules
$removeModules = Read-Host "Do you want to remove node_modules and package-lock.json? (y/N)"
if ($removeModules -eq 'y') {
    Write-Host "Removing node_modules and package-lock.json..."
    if (Test-Path node_modules) {
        Remove-Item -Recurse -Force node_modules
    }
    if (Test-Path package-lock.json) {
        Remove-Item -Force package-lock.json
    }
    
    # Install dependencies
    Write-Host "Installing dependencies..."
    npm install --prefer-offline
    
    # Verify installation
    if (Test-Path node_modules) {
        Write-Host "Dependencies installed successfully!"
    } else {
        Write-Error "Dependencies installation failed!"
        exit 1
    }
} else {
    Write-Host "Skipping node_modules removal and reinstallation."
}

Write-Host "Cleanup completed successfully!"

Write-Host "Cleanup complete!"
Write-Host "Next steps:"
Write-Host "1. Run 'npm test' to verify test environment"
Write-Host "2. If tests still hang, try using Node.js version 16.x or 18.x"
