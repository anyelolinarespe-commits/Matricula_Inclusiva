@echo off
chcp 65001 > nul
echo ========================================================
echo   Iniciando Sistema de Matrícula Accesible UTP
echo ========================================================
echo.
echo Abriendo servidor local en http://localhost:3000 ...
echo.

start "" "http://localhost:3000"
npx --yes serve -l 3000 .
