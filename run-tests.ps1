$testTimeout = 30

Write-Host "Running single test file with $testTimeout second timeout..."
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node --trace-warnings node_modules/jest/bin/jest.js src/screens/__tests__/QRScannerScreen.test.js --config=jest.minimal.config.js
}

$completed = Wait-Job $job -Timeout $testTimeout
if ($completed -eq $null) {
    Write-Host "Test execution timed out after $testTimeout seconds"
    Stop-Job $job
    Remove-Job $job
    exit 1
} else {
    Receive-Job $job
    Remove-Job $job
}
