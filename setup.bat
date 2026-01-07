@echo off
SETLOCAL EnableDelayedExpansion

echo ===================================================
echo   HRTEK SYSTEM - ONE-CLICK SETUP
echo ===================================================
echo.

:: 1. Check Node.js installation
echo [1/4] Checking Node.js...
node -v >node_version.txt 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed. Please install Node.js v20 or higher.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
set /p NODE_VERSION=<node_version.txt
del node_version.txt
echo ✅ Node.js found: %NODE_VERSION%
echo.

:: 2. Install dependencies
echo [2/4] Installing dependencies ^(this may take a few minutes^)...
call npm install
if %errorlevel% neq 0 (
    echo ❌ ERROR: Failed to install dependencies.
    pause
    exit /b 1
)
echo ✅ Dependencies installed.
echo.

:: 3. Setup Environment Variables
echo [3/4] Setting up environment variables...
if not exist .env (
    if exist .env.template (
        copy .env.template .env
        echo ⚠️  IMPORTANT: I've created a .env file for you from .env.template.
        echo Please open .env and fill in your AWS and SMTP credentials before running the app.
    ) else (
        echo ❌ ERROR: .env.template not found. Please create a .env file manually.
    )
) else (
    echo ✅ .env file already exists.
)
echo.

:: 4. Validate Setup
echo [4/4] Validating setup...
node scripts/check-env.cjs
if %errorlevel% neq 0 (
    echo ⚠️  Setup validation failed. Please check the errors above.
) else (
    echo ✅ Setup successful!
    echo.
    echo You can now start the application with: npm run dev
)

echo.
echo ===================================================
echo   Setup Complete!
echo ===================================================
echo.
pause
