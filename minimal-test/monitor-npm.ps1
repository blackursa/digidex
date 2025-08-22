# Get initial process list
$before = Get-Process

# Start npm install
$npmProcess = Start-Process npm -ArgumentList "install", "--verbose" -PassThru -NoNewWindow

# Wait for 10 seconds
Start-Sleep -Seconds 10

# Get process list after npm start
$after = Get-Process

# Find new processes
$newProcesses = Compare-Object -ReferenceObject $before -DifferenceObject $after -Property Name, Id | Where-Object { $_.SideIndicator -eq '=>' }

Write-Host "New processes started:"
$newProcesses | Format-Table Name, Id

# Check npm process state
$npmProcess | Format-Table Id, Name, StartTime, CPU, WorkingSet

# Get network connections for npm-related processes
Get-NetTCPConnection | Where-Object { $_.OwningProcess -eq $npmProcess.Id } | Format-Table LocalAddress, LocalPort, RemoteAddress, RemotePort, State
