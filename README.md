# Shobarkhamar - AI-Powered Disease Detection System

Complete data pipeline and backend API for fish and poultry disease detection using AI.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Development](#development)

## ✨ Features

- **User Authentication** - JWT-based authentication with role management
- **Farm Management** - Create and manage farms and units (ponds, coops, tanks)
- **Disease Database** - Comprehensive disease and symptom database
- **AI Disease Detection** - Upload images for disease diagnosis
- **Treatment Recommendations** - Get treatment protocols for diseases
- **Notification System** - Alerts and reminders for farmers
- **Admin Panel** - Disease and symptom management
- **Image Processing** - Upload and store diagnosis images
- **Prediction System** - AI model integration for disease prediction

## 🛠 Tech Stack

- **Framework**: FastAPI 0.109
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0 (Async)
- **Cache**: Redis 7
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt
- **Validation**: Pydantic 2.5
- **Image Processing**: Pillow
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
shobarkhamar-complete/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── core/
│   │   ├── config.py          # Configuration settings
│   │   ├── database.py        # Database setup
│   │   └── security.py        # Authentication & security
│   ├── models/                # SQLAlchemy models
│   │   ├── user.py
│   │   ├── farm.py
│   │   ├── disease.py
│   │   ├── diagnosis.py
│   │   ├── treatment.py
│   │   ├── ai_models.py
│   │   └── notification.py
│   ├── schemas/               # Pydantic schemas
│   │   ├── user.py
│   │   ├── farm.py
│   │   ├── disease.py
│   │   ├── diagnosis.py
│   │   ├── treatment.py
│   │   ├── prediction.py
│   │   └── notification.py
│   ├── services/              # Business logic
│   │   ├── user_service.py
│   │   ├── farm_service.py
│   │   ├── disease_service.py
│   │   └── diagnosis_service.py
│   └── routers/               # API endpoints
│       ├── auth.py
│       ├── farms.py
│       ├── diseases.py
│       └── diagnosis.py
├── tests/                     # Test files
├── uploads/                   # Uploaded images
├── logs/                      # Application logs
├── .env.example              # Environment variables template
├── requirements.txt          # Python dependencies
├── Dockerfile               # Docker container definition
├── docker-compose.yml       # Docker services orchestration
└── README.md               # This file
```

## 🚀 Installation

### Prerequisites
- Python 3.11+
- Docker & Docker Compose (recommended)
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (if not using Docker)

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd shobarkhamar-complete
```

2. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Check services are running**
```bash
docker-compose ps
```

5. **View logs**
```bash
docker-compose logs -f app
```

### Option 2: Local Development

1. **Clone and setup**
```bash
git clone <repository-url>
cd shobarkhamar-complete
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Setup database**
```bash
# Create PostgreSQL database
createdb shobarkhamar

# Update .env with your database URL
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/shobarkhamar
```

5. **Run the application**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 💾 Database Setup

The application automatically creates all tables on startup. However, you can also use Alembic for migrations:

```bash
# Initialize Alembic (first time only)
alembic init alembic

# Create a migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### Database Schema

16 main entities:
- User
- Farm & FarmUnit
- Disease & Symptom
- Diagnosis & DiagnosisImage
- Treatment
- Prediction
- AITrainingData
- ModelVersion
- Notification
- UserFeedback

## 🌐 Running the Application

### Using Docker
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# View logs
docker-compose logs -f app
```

### Local Development
```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📖 API Documentation

Once the application is running, access the documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Main API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

#### Farms
- `GET /api/v1/farms` - Get all farms
- `POST /api/v1/farms` - Create farm
- `GET /api/v1/farms/{farm_id}` - Get farm details
- `PUT /api/v1/farms/{farm_id}` - Update farm
- `DELETE /api/v1/farms/{farm_id}` - Delete farm

#### Diseases
- `GET /api/v1/diseases` - Get all diseases
- `POST /api/v1/diseases` - Create disease (Admin)
- `GET /api/v1/diseases/{disease_id}` - Get disease details
- `PUT /api/v1/diseases/{disease_id}` - Update disease (Admin)

#### Detection (Diagnosis)
- `POST /api/v1/detection/analyze` - Create diagnosis
- `GET /api/v1/detection/{diagnosis_id}` - Get diagnosis
- `GET /api/v1/detection/history` - Get diagnosis history
- `POST /api/v1/detection/{diagnosis_id}/images` - Upload image

#### Symptoms
- `GET /api/v1/symptoms` - Get all symptoms
- `POST /api/v1/symptoms` - Create symptom (Admin)

### Example Requests

**Register User**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "john@farm.com",
    "password": "SecurePass123!",
    "phone": "+1234567890"
  }'
```

**Create Farm**
```bash
curl -X POST http://localhost:8000/api/v1/farms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "farm_name": "Green Valley Farm",
    "farm_type": "FISH",
    "area_size": 5.5,
    "address": "123 Farm Road"
  }'
```

**Create Diagnosis**
```bash
curl -X POST http://localhost:8000/api/v1/detection/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "farm_id": "uuid-here",
    "target_species": "FISH",
    "symptoms_text": "White spots on body",
    "symptom_ids": []
  }'
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_auth.py
```

## 👨‍💻 Development

### Code Style
```bash
# Format code
black app/

# Check linting
flake8 app/

# Sort imports
isort app/
```

### Adding New Endpoints

1. Create model in `app/models/`
2. Create schema in `app/schemas/`
3. Create service in `app/services/`
4. Create router in `app/routers/`
5. Add router to `app/main.py`

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Farmer/Admin)
- CORS configuration
- Input validation with Pydantic

## 📝 Environment Variables

Key variables in `.env`:

```env
# Application
ENVIRONMENT=development
DEBUG=True

# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/shobarkhamar

# Redis
REDIS_URL=redis://redis:6379/0

# JWT
JWT_SECRET_KEY=your-secret-key-here

# File Upload
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=./uploads
```

## 🐛 Troubleshooting

**Port already in use**
```bash
# Change port in docker-compose.yml or
docker-compose down
```

**Database connection error**
```bash
# Check database is running
docker-compose ps
docker-compose logs db
```

**Permission errors with uploads**
```bash
mkdir -p uploads logs
chmod 755 uploads logs
```

## 📄 License

MIT License

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📧 Support

For support, email support@shobarkhamar.com or create an issue in the repository.