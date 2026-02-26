# ============================================================
# Shobarkhamar Backend Auto-Checker
# Run this from your backend folder:
#   cd "D:\3-2\Capstone Project\my part\shobarkhamar-pipeline\shobarkhamar-complete"
#   .\check_backend.ps1
# ============================================================

$GREEN  = "Green"
$RED    = "Red"
$YELLOW = "Yellow"
$CYAN   = "Cyan"
$WHITE  = "White"

function Print-Header($text) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $CYAN
    Write-Host "  $text" -ForegroundColor $CYAN
    Write-Host "========================================" -ForegroundColor $CYAN
}

function Print-OK($text)   { Write-Host "  [OK]   $text" -ForegroundColor $GREEN }
function Print-FAIL($text) { Write-Host "  [FAIL] $text" -ForegroundColor $RED }
function Print-WARN($text) { Write-Host "  [WARN] $text" -ForegroundColor $YELLOW }
function Print-INFO($text) { Write-Host "  [INFO] $text" -ForegroundColor $WHITE }

$allGood = $true

# -----------------------------------------------------------
# 1. CHECK .env FILE
# -----------------------------------------------------------
Print-Header "STEP 1 - Checking .env file"

if (Test-Path ".\.env") {
    Print-OK ".env file exists"

    $envContent = Get-Content ".\.env" -Raw

    $required = @("DATABASE_URL", "JWT_SECRET", "REDIS_URL", "ENVIRONMENT")
    foreach ($key in $required) {
        if ($envContent -match $key) {
            Print-OK "$key is set"
        } else {
            Print-FAIL "$key is MISSING from .env"
            $allGood = $false
        }
    }

    # Check JWT_SECRET length
    if ($envContent -match 'JWT_SECRET=(.+)') {
        $secret = $matches[1].Trim()
        if ($secret.Length -ge 32) {
            Print-OK "JWT_SECRET is long enough ($($secret.Length) chars)"
        } else {
            Print-FAIL "JWT_SECRET is too short ($($secret.Length) chars) - needs at least 32"
            Print-INFO "Fix: Set JWT_SECRET=anyrandomlongstring1234567890abcdefgh in .env"
            $allGood = $false
        }
    }
} else {
    Print-FAIL ".env file NOT found"
    Print-INFO "Fix: Run this command:  copy .env.example .env"
    Print-INFO "Then edit .env and fill in the values"
    $allGood = $false
}

# -----------------------------------------------------------
# 2. CHECK DOCKER IS RUNNING
# -----------------------------------------------------------
Print-Header "STEP 2 - Checking Docker"

try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-OK "Docker Desktop is running"
    } else {
        Print-FAIL "Docker is installed but NOT running"
        Print-INFO "Fix: Open Docker Desktop and wait for it to fully start, then re-run this script"
        $allGood = $false
    }
} catch {
    Print-FAIL "Docker is not installed or not in PATH"
    Print-INFO "Fix: Install Docker Desktop from https://www.docker.com/products/docker-desktop"
    $allGood = $false
}

# -----------------------------------------------------------
# 3. CHECK docker-compose.yml EXISTS
# -----------------------------------------------------------
Print-Header "STEP 3 - Checking docker-compose.yml"

if (Test-Path ".\docker-compose.yml") {
    Print-OK "docker-compose.yml found"
} else {
    Print-FAIL "docker-compose.yml NOT found - are you in the right folder?"
    Print-INFO "Fix: cd to your backend folder first"
    $allGood = $false
}

# -----------------------------------------------------------
# 4. CHECK RUNNING CONTAINERS
# -----------------------------------------------------------
Print-Header "STEP 4 - Checking Docker containers"

try {
    $containers = docker-compose ps 2>&1
    Write-Host $containers -ForegroundColor $WHITE

    # Check for "running" or "Up" state
    if ($containers -match "(Up|running)") {
        Print-OK "At least one container is running"
    } else {
        Print-FAIL "No containers appear to be running"
        Print-INFO "Fix: Run  docker-compose up -d"
        $allGood = $false
    }

    # Check for unhealthy or exited
    if ($containers -match "(Exit|unhealthy|Error)") {
        Print-FAIL "One or more containers have errors!"
        Print-INFO "Fix: Run  docker-compose logs  to see what went wrong"
        $allGood = $false
    }
} catch {
    Print-WARN "Could not check container status"
}

# -----------------------------------------------------------
# 5. CHECK PORT 8000 IS OPEN
# -----------------------------------------------------------
Print-Header "STEP 5 - Checking if port 8000 is open"

try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $connect = $tcp.BeginConnect("localhost", 8000, $null, $null)
    $wait = $connect.AsyncWaitHandle.WaitOne(2000, $false)
    if ($wait -and $tcp.Connected) {
        Print-OK "Port 8000 is open - something is listening!"
        $tcp.Close()
    } else {
        Print-FAIL "Port 8000 is NOT open - backend is not running"
        Print-INFO "Fix: Run  docker-compose up -d  and wait ~30 seconds"
        $allGood = $false
    }
} catch {
    Print-FAIL "Could not connect to port 8000"
    $allGood = $false
}

# -----------------------------------------------------------
# 6. CHECK /health ENDPOINT
# -----------------------------------------------------------
Print-Header "STEP 6 - Checking /health endpoint"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Print-OK "/health returned 200 OK"
        Print-INFO "Response: $($response.Content)"
    } else {
        Print-FAIL "/health returned status $($response.StatusCode)"
        $allGood = $false
    }
} catch {
    Print-FAIL "Could not reach http://localhost:8000/health"
    Print-INFO "Error: $($_.Exception.Message)"
    $allGood = $false
}

# -----------------------------------------------------------
# 7. CHECK /docs ENDPOINT
# -----------------------------------------------------------
Print-Header "STEP 7 - Checking /docs (Swagger UI)"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Print-OK "/docs is accessible - Swagger UI is working!"
        Print-INFO "Open in browser: http://localhost:8000/docs"
    } else {
        Print-FAIL "/docs returned status $($response.StatusCode)"
        $allGood = $false
    }
} catch {
    Print-FAIL "Could not reach http://localhost:8000/docs"
    $allGood = $false
}

# -----------------------------------------------------------
# 8. CHECK API ROUTES EXIST
# -----------------------------------------------------------
Print-Header "STEP 8 - Checking API routes"

$routes = @(
    "http://localhost:8000/api/v1/auth/register",
    "http://localhost:8000/api/v1/detection/history"
)

foreach ($url in $routes) {
    try {
        # These require auth so 401/422 means the route EXISTS (not 404)
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
        Print-OK "$url -> exists (status $($response.StatusCode))"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401 -or $statusCode -eq 405 -or $statusCode -eq 422) {
            Print-OK "$url -> exists (status $statusCode - expected, needs auth)"
        } elseif ($statusCode -eq 404) {
            Print-FAIL "$url -> 404 NOT FOUND - route missing!"
            $allGood = $false
        } else {
            Print-WARN "$url -> status $statusCode"
        }
    }
}

# -----------------------------------------------------------
# FINAL SUMMARY
# -----------------------------------------------------------
Print-Header "SUMMARY"

if ($allGood) {
    Write-Host ""
    Write-Host "  ALL CHECKS PASSED!" -ForegroundColor $GREEN
    Write-Host "  Your backend is running correctly." -ForegroundColor $GREEN
    Write-Host "  Open http://localhost:8000/docs to test your API" -ForegroundColor $GREEN
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "  SOME CHECKS FAILED - follow the [Fix] instructions above" -ForegroundColor $RED
    Write-Host ""
    Write-Host "  Most common fix sequence:" -ForegroundColor $YELLOW
    Write-Host "    1. copy .env.example .env" -ForegroundColor $YELLOW
    Write-Host "    2. Edit .env and set all values" -ForegroundColor $YELLOW
    Write-Host "    3. Make sure Docker Desktop is open and running" -ForegroundColor $YELLOW
    Write-Host "    4. docker-compose up -d" -ForegroundColor $YELLOW
    Write-Host "    5. Wait 30 seconds, then run this script again" -ForegroundColor $YELLOW
    Write-Host ""
}
