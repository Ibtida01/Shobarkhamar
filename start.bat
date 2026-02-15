@echo off
REM Shobarkhamar Quick Start Script for Windows

echo ===================================
echo Shobarkhamar Setup and Start
echo ===================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo [OK] Docker and Docker Compose are installed
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo [INFO] Creating .env file from .env.example...
    copy .env.example .env
    echo [OK] .env file created. Please edit it with your settings.
    echo.
) else (
    echo [OK] .env file already exists
    echo.
)

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist uploads mkdir uploads
if not exist logs mkdir logs
echo [OK] Directories created
echo.

REM Build and start services
echo [INFO] Starting services with Docker Compose...
docker-compose up -d --build

echo.
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if not errorlevel 1 (
    echo [OK] Services are running!
    echo.
    echo ===================================
    echo Setup Complete!
    echo ===================================
    echo.
    echo Application is running at:
    echo   API: http://localhost:8000
    echo   Docs: http://localhost:8000/docs
    echo   ReDoc: http://localhost:8000/redoc
    echo.
    echo Database:
    echo   PostgreSQL: localhost:5432
    echo   Redis: localhost:6379
    echo.
    echo Useful commands:
    echo   View logs: docker-compose logs -f app
    echo   Stop: docker-compose down
    echo   Restart: docker-compose restart
    echo.
) else (
    echo [ERROR] Some services failed to start. Check logs:
    echo   docker-compose logs
)

pause