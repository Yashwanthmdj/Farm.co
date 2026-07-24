@echo off
echo Installing Farmer Assistant Application...
echo.

echo Installing backend dependencies...
cd server
npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ../client
npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

echo.
echo Installation completed successfully!
echo.
echo Next steps:
echo 1. Create a .env file in the server directory with your API keys
echo 2. Set up MongoDB Atlas connection
echo 3. Run 'npm start' in the server directory
echo 4. Run 'npm start' in the client directory
echo.
pause 