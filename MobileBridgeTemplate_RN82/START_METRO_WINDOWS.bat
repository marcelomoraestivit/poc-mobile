@echo off
echo ========================================
echo   Iniciando Metro Bundler (Windows)
echo ========================================
echo.

cd /d "%~dp0"

echo Limpando cache do Metro...
call npm start -- --reset-cache

pause
