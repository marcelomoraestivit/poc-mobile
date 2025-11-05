@echo off
echo ========================================
echo   Executando App Android (Windows)
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando Android...
call npm run android

pause
