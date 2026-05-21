@echo off
cd /d "%~dp0"
echo Stopping old Next.js dev servers on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
if exist ".next\dev\lock" del /f /q ".next\dev\lock"
echo Starting GrowPal on http://localhost:3000 ...
npm run dev
