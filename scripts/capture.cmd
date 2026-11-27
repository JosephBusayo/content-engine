@echo off
REM Capture a week's shots on Windows.
REM   scripts\capture.cmd projects\acag\2026-W49\shotlist.json
setlocal
if "%~1"=="" (
  echo usage: scripts\capture.cmd ^<shotlist.json^> [--only id,id] [--mode screenshot^|recording]
  exit /b 1
)
where node >nul 2>nul || (echo ERROR: node is not on PATH. Install Node 18+ and reopen cmd. & exit /b 1)
where ffmpeg >nul 2>nul || (echo ERROR: ffmpeg is not on PATH. winget install Gyan.FFmpeg  then reopen cmd. & exit /b 1)
pushd "%~dp0.."
if not exist node_modules\playwright (
  echo Installing Playwright, one time only...
  call npm install playwright || (popd & exit /b 1)
  call npx playwright install chromium || (popd & exit /b 1)
)
node scripts\capture.js %*
set RC=%ERRORLEVEL%
popd
exit /b %RC%
