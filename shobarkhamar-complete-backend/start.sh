#!/bin/bash

# Shobarkhamar Quick Start Script

echo "==================================="
echo "Shobarkhamar Setup & Start"
echo "==================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "Docker and Docker Compose are installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ".env file created. Please edit it with your settings."
    echo ""
else
    echo ".env file already exists"
    echo ""
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p uploads logs
echo "Directories created"
echo ""

# Build and start services
echo "Starting services with Docker Compose..."
docker-compose up -d --build

echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "Services are running!"
    echo ""
    echo "==================================="
    echo "Setup Complete!"
    echo "==================================="
    echo ""
    echo "Application is running at:"
    echo "  API: http://localhost:8000"
    echo "  Docs: http://localhost:8000/docs"
    echo "  ReDoc: http://localhost:8000/redoc"
    echo ""
    echo "Database:"
    echo "  PostgreSQL: localhost:5432"
    echo "  Redis: localhost:6379"
    echo ""
    echo "Useful commands:"
    echo "  View logs: docker-compose logs -f app"
    echo "  Stop: docker-compose down"
    echo "  Restart: docker-compose restart"
    echo ""
else
    echo "Some services failed to start. Check logs:"
    echo "   docker-compose logs"
fi
