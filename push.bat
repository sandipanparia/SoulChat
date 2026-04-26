@echo off
echo ====================================
echo    Auto-Pushing to GitHub
echo ====================================
echo.

:: Prompt for commit message
set /p msg="Enter commit message (or press enter for 'Update code'): "
if "%msg%"=="" set msg="Update code"

echo.
echo [1/3] Staging changes...
git add .

echo.
echo [2/3] Committing changes...
git commit -m "%msg%"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ====================================
echo    Done!
echo ====================================
pause
