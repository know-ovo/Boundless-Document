@echo off
chcp 65001 >nul
title Boundless Document

cd /d "%~dp0"

echo.
echo   ============================================
echo     Boundless Document  --  Wu Jie Wen Dang
echo   ============================================
echo.

:: ---- Check Node.js ----
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo   [ERR] Node.js not found. Please install Node.js 22+
    echo         https://nodejs.org
    pause
    goto :eof
)

for /f "tokens=1 delims=." %%a in ('node -v 2^>nul') do set NODE_VER=%%a
echo   [OK] %NODE_VER% ready

:: ---- Check dependencies ----
if not exist "node_modules\" (
    echo.
    echo   [..] First run -- installing dependencies...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo   [ERR] npm install failed
        pause
        goto :eof
    )
    echo   [OK] Dependencies installed
) else (
    echo   [OK] node_modules ready
)

:: ---- Check port ----
set PORT=1420
netstat -ano 2>nul | findstr ":%PORT% " | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo.
    echo   [!!] Port %PORT% is in use
    for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
        echo   [!!] Occupied by PID: %%a
    )
    echo.
    choice /c YN /n /m "  Kill the process and continue? [Y/N] "
    if errorlevel 2 (
        echo   Cancelled
        pause
        goto :eof
    )
    for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
        taskkill /pid %%a /f >nul 2>&1
    )
    timeout /t 1 >nul
    echo   [OK] Port released
)

:: ---- Launch browser after delay (background) ----
start "" /b cmd /c "timeout /t 3 >nul && start http://localhost:%PORT%"

:: ---- Start dev server ----
echo.
echo   [..] Starting dev server...
echo.
echo   --------------------------------------------------
echo     Frontend : http://localhost:%PORT%
echo     Press Ctrl+C to stop
echo   --------------------------------------------------
echo.

call npm run dev

:: ---- Done ----
echo.
echo   Server stopped.
pause
