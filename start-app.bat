@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "PORT=8000"

echo.
echo Starting College Football Picks...
echo Keep this window open while using the app.
echo.

where py >nul 2>&1
if not errorlevel 1 goto use_py

where python >nul 2>&1
if not errorlevel 1 goto use_python

echo Python was not found on this computer.
echo Install Python from https://www.python.org/downloads/ and try again.
goto failed

:use_py
py -m http.server %PORT%
goto server_stopped

:use_python
python -m http.server %PORT%
goto server_stopped

:server_stopped
echo.
echo The local server stopped. If the app did not open, visit:
echo http://localhost:%PORT%
goto failed

:failed
echo.
echo Press any key to close this window.
pause >nul
exit /b 1
