@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo.
echo Starting Live Tommy Lines for the week of October 10...
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
py "%~dp0start-app.py"
goto server_stopped

:use_python
python "%~dp0start-app.py"
goto server_stopped

:server_stopped
echo.
echo The local server stopped.
goto failed

:failed
echo.
echo Press any key to close this window.
pause >nul
exit /b 1
