param(
    [string]$BuildDir = "build",
    [string]$UiDir = "ui",
    [string]$OutDir = "dist",
    [string]$InstallerName = "async-task-scheduler-installer.exe",
    [string]$ProductName = "Async Task Scheduler"
)

Set-StrictMode -Version Latest

Write-Host "Packaging for Windows: BuildDir=$BuildDir UiDir=$UiDir OutDir=$OutDir"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$staging = Join-Path $scriptDir "staging"
Remove-Item -Recurse -Force $staging -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $staging | Out-Null

# Copy binaries
$binSrc = Join-Path (Resolve-Path $BuildDir).Path "Release"
if (-Not (Test-Path $binSrc)) { $binSrc = Join-Path (Resolve-Path $BuildDir).Path }
Write-Host "Copying binaries from $binSrc"
Copy-Item -Recurse -Force (Join-Path $binSrc '*') $staging 2>$null || Write-Host "No binaries found in $binSrc"

# Copy UI build
$uiBuild = Join-Path (Resolve-Path $UiDir).Path "client/build"
if (Test-Path $uiBuild) {
    New-Item -ItemType Directory -Path (Join-Path $staging 'ui') | Out-Null
    Copy-Item -Recurse -Force (Join-Path $uiBuild '*') (Join-Path $staging 'ui')
    Write-Host "Copied UI build"
} else {
    Write-Host "UI build not found at $uiBuild"
}

# Create installer script from template
$nsiTemplate = Join-Path $scriptDir 'installer.nsi'
$nsiScript = Join-Path $staging 'installer_generated.nsi'

if (-Not (Test-Path $nsiTemplate)) {
    Write-Host "Missing NSIS template: $nsiTemplate"
} else {
    $template = Get-Content $nsiTemplate -Raw
    $template = $template -replace "\$\{PRODUCT_NAME\}", $ProductName
    $template = $template -replace "\$\{INSTALLER_NAME\}", $InstallerName
    Set-Content -Path $nsiScript -Value $template -Encoding UTF8

    # Run makensis if available
    if (Get-Command makensis -ErrorAction SilentlyContinue) {
        Write-Host "Building NSIS installer..."
        & makensis /NOCD /V2 $nsiScript
        # move generated installer to OutDir
        New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
        $built = Join-Path $staging $InstallerName
        if (Test-Path $built) { Copy-Item $built (Join-Path $OutDir $InstallerName) -Force }
        else { Write-Host "Installer not created at expected path: $built" }
    } else {
        Write-Host "makensis not found; generated script at $nsiScript. Install NSIS and run: makensis $nsiScript"
        New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
        Copy-Item $nsiScript (Join-Path $OutDir 'installer_generated.nsi') -Force
    }
}

Write-Host "Packaging complete. Output: $OutDir"
