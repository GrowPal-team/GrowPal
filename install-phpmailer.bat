@echo off
cd /d "%~dp0"
set PHP_EXE=php
where php >nul 2>nul || set PHP_EXE=C:\xampp\php\php.exe
echo Downloading Composer...
where curl >nul 2>nul && (curl -L -sS -o composer.phar https://getcomposer.org/composer.phar) || (powershell -Command "Invoke-WebRequest -Uri 'https://getcomposer.org/composer.phar' -OutFile 'composer.phar' -UseBasicParsing")
if exist composer.phar (
    echo Installing PHPMailer...
    "%PHP_EXE%" composer.phar install
    echo.
    echo Done! Configure config/email.php with your Gmail and App Password.
) else (
    echo Download failed. Try manually:
    echo 1. Go to https://getcomposer.org/Composer-Setup.exe
    echo 2. Install Composer, then run: composer install
)
pause
