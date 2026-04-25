@echo off
REM Forwarder so users can run .\runapplication.bat from inside frontend\
REM Change directory to parent of this script, then call the main runapplication.bat
pushd "%~dp0\.."
call "%~dp0..\runapplication.bat"
popd
