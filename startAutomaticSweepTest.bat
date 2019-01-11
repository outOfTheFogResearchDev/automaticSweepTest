@echo off
goto again
:again
    set /p answer=Is the Signal Analyzer pluged into the computer (or are you just trying to print data)? (Y/N)
    if /i "%answer:~,1%" EQU "Y" goto run
    if /i "%answer:~,1%" EQU "N" exit /b
    echo Please type Y for Yes or N for No
    goto again

:run
    start /min startProgram.bat