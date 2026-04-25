@echo off
REM Forwarder so users can run .\setupdev.bat from inside frontend\
pushd "%~dp0\.."
call "%~dp0..\setupdev.bat"
popd
