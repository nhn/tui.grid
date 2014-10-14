set CUR_DIR=%CD%
set FILE_DIR=%~dp0
set PRJ_DIR=%FILE_DIR%..\

cd %PRJ_DIR%
call "C:\Program Files\Microsoft SDKs\Windows\v7.1\bin\Setenv.cmd" /Release /x64
npm install
cd %CUR_DIR%


