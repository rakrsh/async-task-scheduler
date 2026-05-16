@echo off
REM Quick launcher for Async Task Scheduler
REM Usage: launch.bat [setup|dev|build|run|clean]

setlocal enabledelayedexpansion

if "%1"=="" (
    echo Async Task Scheduler - Quick Launcher
    echo.
    echo Usage: launch.bat [command]
    echo.
    echo Commands:
    echo   setup     Full setup ^(dependencies + build^)
    echo   dev       Setup and run in development mode
    echo   build     Build C++ project only
    echo   run       Run already-built project
    echo   clean     Clean build artifacts
    echo   help      Show this help message
    echo.
    echo Examples:
    echo   launch.bat setup
    echo   launch.bat dev
    echo   launch.bat run
    echo.
    goto :eof
)

if /I "%1"=="help" goto :help
if /I "%1"=="setup" goto :setup
if /I "%1"=="dev" goto :dev
if /I "%1"=="build" goto :build
if /I "%1"=="run" goto :run
if /I "%1"=="clean" goto :clean

echo Unknown command: %1
echo Run 'launch.bat help' for usage information
exit /b 1

:help
    call powershell -Command "Get-Help '%~dp0setup.ps1' -Full"
    goto :eof

:setup
    call powershell -ExecutionPolicy Bypass -File "%~dp0setup.ps1" -Mode setup
    goto :eof

:dev
    call powershell -ExecutionPolicy Bypass -File "%~dp0setup.ps1" -Mode dev
    goto :eof

:build
    call powershell -ExecutionPolicy Bypass -File "%~dp0setup.ps1" -Mode build
    goto :eof

:run
    call powershell -ExecutionPolicy Bypass -File "%~dp0setup.ps1" -Mode run
    goto :eof

:clean
    call powershell -ExecutionPolicy Bypass -File "%~dp0setup.ps1" -Mode clean
    goto :eof

:eof
    endlocal
