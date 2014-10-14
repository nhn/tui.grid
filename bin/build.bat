set CUR_DIR=%CD%
set FILE_DIR=%~dp0
set PRJ_DIR=%FILE_DIR%..\

cd %PRJ_DIR%
grunt build
cd %CUR_DIR%
