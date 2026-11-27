@echo off
REM Convert any recording you made yourself into an X-ready MP4.
REM   scripts\to-mp4.cmd myclip.mov            -> myclip.mp4
REM   scripts\to-mp4.cmd myclip.mov out.mp4
setlocal
if "%~1"=="" (echo usage: scripts\to-mp4.cmd ^<input^> [output.mp4] & exit /b 1)
where ffmpeg >nul 2>nul || (echo ERROR: ffmpeg is not on PATH. & exit /b 1)
set OUT=%~2
if "%OUT%"=="" set OUT=%~dpn1.mp4
ffmpeg -y -i "%~1" -vf "scale='min(1280,iw)':-2:flags=lanczos,fps=30" -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 23 -movflags +faststart -an "%OUT%"
if errorlevel 1 (echo Conversion failed. & exit /b 1)
echo Wrote "%OUT%"
exit /b 0
