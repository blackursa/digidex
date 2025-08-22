# Check for file locks in npm directories
Write-Host "Checking for file locks in npm directories..."
$npmPaths = @(
    "$env:LOCALAPPDATA\npm-cache",
    "$env:APPDATA\npm",
    "$env:USERPROFILE\.npm"
)

foreach ($path in $npmPaths) {
    if (Test-Path $path) {
        Write-Host "`nChecking $path"
        Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue | 
        ForEach-Object {
            $file = $_
            try {
                $stream = [System.IO.File]::Open($file.FullName, 'Open', 'Read', 'None')
                $stream.Close()
            }
            catch {
                Write-Host "Locked file found: $($file.FullName)"
            }
        }
    }
}

# Check for antivirus real-time scanning
Write-Host "`nChecking Windows Defender status..."
Get-MpComputerStatus | Select-Object RealTimeProtectionEnabled, IoavProtectionEnabled

# Check disk performance where npm cache is stored
Write-Host "`nChecking disk performance..."
Get-PhysicalDisk | 
    Where-Object { $_.DeviceId -eq ((Get-Partition -DriveLetter $env:LOCALAPPDATA[0]).DiskNumber) } |
    Select-Object FriendlyName, MediaType, HealthStatus, OperationalStatus

# Check network connectivity to npm registry
Write-Host "`nTesting connection to npm registry..."
Test-NetConnection registry.npmjs.org -Port 443

# Check for resource constraints
Write-Host "`nChecking system resources..."
Get-Process | 
    Where-Object { $_.CPU -gt 50 -or $_.WorkingSet -gt 500MB } |
    Select-Object ProcessName, CPU, WorkingSet, Id

# Check Windows event log for relevant errors
Write-Host "`nChecking recent application errors..."
Get-EventLog -LogName Application -EntryType Error -Newest 5 |
    Select-Object TimeGenerated, Source, Message
