#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup and launch the Async Task Scheduler with Dashboard

.DESCRIPTION
    This script provides a single entry point to:
    - Check system prerequisites
    - Install all dependencies (C++, Node.js)
    - Build the C++ scheduler
    - Configure the dashboard
    - Launch the application

.PARAMETER Mode
    Setup mode: 'setup' (default), 'dev', 'build', 'run', 'clean'

.PARAMETER Help
    Show this help message

.EXAMPLE
    .\setup.ps1                    # Full setup
    .\setup.ps1 -Mode dev         # Setup and run in dev mode
    .\setup.ps1 -Mode build       # Just build the project
    .\setup.ps1 -Mode run         # Run already-built project
#>

param(
    [ValidateSet('setup', 'dev', 'build', 'run', 'clean')]
    [string]$Mode = 'setup',
    [switch]$Help
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Colors for output
function Write-Header {
    param([string]$Message)
    Write-Host "`n$('=' * 60)" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "$('=' * 60)`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

# Check prerequisites
function Check-Prerequisites {
    Write-Header "Checking Prerequisites"
    
    $allOk = $true
    
    # Check CMake
    if (Get-Command cmake -ErrorAction SilentlyContinue) {
        $version = cmake --version | Select-Object -First 1
        Write-Success "CMake: $version"
    }
    else {
        Write-Error "CMake not found. Install from https://cmake.org/download/"
        $allOk = $false
    }
    
    # Check C++ Compiler
    if (Get-Command cl -ErrorAction SilentlyContinue) {
        $version = cl 2>&1 | Select-Object -First 1
        Write-Success "MSVC: $version"
    }
    elseif (Get-Command clang++ -ErrorAction SilentlyContinue) {
        $version = clang++ --version | Select-Object -First 1
        Write-Success "Clang: $version"
    }
    elseif (Get-Command g++ -ErrorAction SilentlyContinue) {
        $version = g++ --version | Select-Object -First 1
        Write-Success "GCC: $version"
    }
    else {
        Write-Error "No C++ compiler found. Install Visual Studio, Clang, or GCC."
        $allOk = $false
    }
    
    # Check Node.js
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $version = node --version
        Write-Success "Node.js: $version"
    }
    else {
        Write-Error "Node.js not found. Install from https://nodejs.org/"
        $allOk = $false
    }
    
    # Check vcpkg
    if (Test-Path "vcpkg" -PathType Container) {
        Write-Success "vcpkg: Found locally"
    }
    elseif (Get-Command vcpkg -ErrorAction SilentlyContinue) {
        Write-Success "vcpkg: Found in PATH"
    }
    else {
        Write-Warning "vcpkg not found. It will be initialized if needed."
    }
    
    return $allOk
}

# Install vcpkg if needed
function Setup-Vcpkg {
    Write-Header "Setting Up vcpkg"
    
    if (-not (Test-Path "vcpkg" -PathType Container)) {
        Write-Info "Cloning vcpkg..."
        & git clone https://github.com/Microsoft/vcpkg.git
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to clone vcpkg"
            return $false
        }
    }
    
    $vcpkgDir = Join-Path (Get-Location) "vcpkg"
    
    if (-not (Test-Path (Join-Path $vcpkgDir "vcpkg.exe"))) {
        Write-Info "Building vcpkg bootstrap..."
        & (Join-Path $vcpkgDir "bootstrap-vcpkg.bat")
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to bootstrap vcpkg"
            return $false
        }
    }
    
    Write-Success "vcpkg ready"
    return $true
}

# Install C++ dependencies
function Install-CppDependencies {
    Write-Header "Installing C++ Dependencies"
    
    $vcpkgPath = "vcpkg"
    if (-not (Test-Path $vcpkgPath)) {
        if (-not (Setup-Vcpkg)) {
            return $false
        }
    }
    
    Write-Info "Installing dependencies via vcpkg..."
    & $vcpkgPath install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install C++ dependencies"
        return $false
    }
    
    Write-Success "C++ dependencies installed"
    return $true
}

# Install Node.js dependencies
function Install-NodeDependencies {
    Write-Header "Installing Node.js Dependencies"
    
    Write-Info "Installing UI dependencies..."
    
    Push-Location ui
    
    try {
        Write-Info "Root dependencies..."
        & npm install --silent
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install root dependencies"
            return $false
        }
        
        Write-Info "Server dependencies..."
        & npm install -w server --silent
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install server dependencies"
            return $false
        }
        
        Write-Info "Client dependencies..."
        & npm install -w client --silent
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install client dependencies"
            return $false
        }
        
        Write-Success "Node.js dependencies installed"
        return $true
    }
    finally {
        Pop-Location
    }
}

# Build C++ project
function Build-CppProject {
    Write-Header "Building C++ Project"
    
    $vcpkgRoot = Resolve-Path "vcpkg"
    $toolchain = Join-Path $vcpkgRoot "scripts/buildsystems/vcpkg.cmake"
    
    Write-Info "Configuring CMake..."
    & cmake -B build -S . -DCMAKE_TOOLCHAIN_FILE=$toolchain -DCMAKE_BUILD_TYPE=Release
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "CMake configuration failed"
        return $false
    }
    
    Write-Info "Building..."
    & cmake --build build --config Release --parallel
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed"
        return $false
    }
    
    Write-Success "C++ project built successfully"
    return $true
}

# Full setup
function Run-Setup {
    Write-Header "Async Task Scheduler - Complete Setup"
    
    if (-not (Check-Prerequisites)) {
        Write-Error "Prerequisites check failed. Please install missing components."
        exit 1
    }
    
    if (-not (Install-CppDependencies)) {
        Write-Error "C++ dependency installation failed"
        exit 1
    }
    
    if (-not (Install-NodeDependencies)) {
        Write-Error "Node.js dependency installation failed"
        exit 1
    }
    
    if (-not (Build-CppProject)) {
        Write-Error "C++ build failed"
        exit 1
    }
    
    Display-CompletionMessage
}

# Build only
function Run-Build {
    Write-Header "Building C++ Project"
    
    if (-not (Build-CppProject)) {
        exit 1
    }
    
    Write-Success "Build complete"
}

# Run application
function Run-Application {
    Write-Header "Starting Application"
    
    # Check if builds exist
    $schedulerExe = "build/Release/scheduler_test.exe"
    $dashboardSetup = "ui/server/package.json"
    
    if (-not (Test-Path $schedulerExe)) {
        Write-Warning "Scheduler not yet built. Building now..."
        if (-not (Build-CppProject)) {
            exit 1
        }
    }
    
    if (-not (Test-Path $dashboardSetup)) {
        Write-Warning "Dashboard not yet setup. Installing dependencies..."
        if (-not (Install-NodeDependencies)) {
            exit 1
        }
    }
    
    Write-Info "Starting dashboard and scheduler..."
    Write-Info "  Dashboard: http://localhost:3000"
    Write-Info "  API Server: http://localhost:3001"
    Write-Info ""
    
    Push-Location ui
    try {
        & npm run dev
    }
    finally {
        Pop-Location
    }
}

# Development mode (setup + run)
function Run-Dev {
    Run-Setup
    
    Write-Header "Starting Development Mode"
    Write-Info "Starting services..."
    Write-Info "  Dashboard: http://localhost:3000"
    Write-Info "  API Server: http://localhost:3001"
    Write-Info ""
    
    Push-Location ui
    try {
        & npm run dev
    }
    finally {
        Pop-Location
    }
}

# Clean build artifacts
function Run-Clean {
    Write-Header "Cleaning Build Artifacts"
    
    if (Test-Path "build") {
        Remove-Item -Recurse -Force "build"
        Write-Success "Removed build directory"
    }
    
    if (Test-Path "ui/node_modules") {
        Remove-Item -Recurse -Force "ui/node_modules"
        Write-Success "Removed UI node_modules"
    }
    
    if (Test-Path "ui/server/node_modules") {
        Remove-Item -Recurse -Force "ui/server/node_modules"
        Write-Success "Removed server node_modules"
    }
    
    if (Test-Path "ui/client/node_modules") {
        Remove-Item -Recurse -Force "ui/client/node_modules"
        Write-Success "Removed client node_modules"
    }
    
    Write-Success "Clean complete"
}

# Display completion message
function Display-CompletionMessage {
    Write-Host @"
`n$(Write-Host '╔' -NoNewline -ForegroundColor Green)$('═' * 58)$(Write-Host '╗' -ForegroundColor Green)
$(Write-Host '║' -NoNewline -ForegroundColor Green) Setup Complete! $(Write-Host '║' -ForegroundColor Green)
$(Write-Host '╚' -NoNewline -ForegroundColor Green)$('═' * 58)$(Write-Host '╝' -ForegroundColor Green)

📊 Async Task Scheduler with Dashboard

Next Steps:

  1. Run the application:
     .\setup.ps1 -Mode run

  2. Start in development mode:
     .\setup.ps1 -Mode dev

  3. Access the dashboard:
     → Browser: http://localhost:3000
     → API: http://localhost:3001

  4. Build only (without running):
     .\setup.ps1 -Mode build

  5. Clean build artifacts:
     .\setup.ps1 -Mode clean

Documentation:
  → Main docs: http://localhost:8000 (after 'mkdocs serve')
  → Dashboard: docs/dashboard.md
  → Integration: docs/integration-guide.md

Happy scheduling! 🚀

"@
}

# Show help
function Show-Help {
    Get-Help $PSCommandPath -Full
}

# Main
if ($Help) {
    Show-Help
    exit 0
}

switch ($Mode) {
    'setup' { Run-Setup }
    'dev' { Run-Dev }
    'build' { Run-Build }
    'run' { Run-Application }
    'clean' { Run-Clean }
    default { Run-Setup }
}
