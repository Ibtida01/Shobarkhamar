# Shobarkhamar — AI-Powered Fish & Poultry Disease Detection

![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal)
![React](https://img.shields.io/badge/React-18-blue)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-black)

> Diagnostic software for fish and poultry diseases powered by EfficientNet deep learning models.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Models](#models)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Treatment References](#treatment-references)
- [Team](#team)

---

## Overview

Shobarkhamar ("Shobar Khamar" = "Everyone's Farm" in Bengali) is an AI-powered web platform that helps farmers in Bangladesh detect diseases in their fish and poultry livestock by uploading images. The system uses two trained EfficientNet models to classify diseases and provides treatment recommendations.

---

## Features

- **Fish Disease Detection** — EfficientNet-B4 model classifying 8 disease categories
- **Poultry Disease Detection** — EfficientNetV2 model classifying 5 disease categories
- **Treatment Recommendations** — Medication, dosage, and precautions per disease
- **Diagnosis History** — Full record of past diagnoses per user
- **Notifications** — Real-time diagnosis result notifications
- **Farm Management** — Register and manage multiple farms
- **Disease Database** — Reference database of common fish/poultry diseases
- **CI/CD Pipeline** — Automated testing and deployment via GitHub Actions

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React + Vite  │────▶│  FastAPI Backend │────▶│   PostgreSQL    │
│   (Vercel)      │     │   (Railway)      │     │   (Railway)     │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
           ┌────────▼──────┐        ┌────────▼──────┐
           │ EfficientNet  │        │ EfficientNetV2 │
           │ B4 (Fish)     │        │ (Poultry)      │
           └───────────────┘        └────────────────┘
```

---

## Models

### Fish Disease Model — `best_B4_wiener_False.pth`
- **Architecture**: EfficientNet-B4
- **Input size**: 380×380
- **Classes**:
  | Index | Class |
  |-------|-------|
  | 0 | Bacterial Red Disease |
  | 1 | Bacterial Diseases - Aeromoniasis |
  | 2 | Bacterial Gill Disease |
  | 3 | Fungal Diseases Saprolegniasis |
  | 4 | Healthy Fish |
  | 5 | Not Fish |
  | 6 | Parasitic Diseases |
  | 7 | Viral Diseases White Tail Disease |

### Poultry Disease Model — `best_model.pt`
- **Architecture**: EfficientNetV2
- **Input size**: 384×384
- **Classes**:
  | Index | Class |
  |-------|-------|
  | 0 | Coccidiosis |
  | 1 | Healthy |
  | 2 | Newcastle Disease |
  | 3 | Non Poultry |
  | 4 | Salmonella |

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Backend Setup

```bash
cd shobarkhamar-complete-backend

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env

# Place model files
mkdir -p models
# Copy best_B4_wiener_False.pth and best_model.pt to models/

# Run the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd shobarkhamar-complete-frontend

npm install
npm run dev
```

### Run Tests

```bash
cd shobarkhamar-complete-backend
pytest tests/test_smoke.py -v
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/farms` | List user farms |
| POST | `/api/v1/farms` | Create farm |
| POST | `/api/v1/detection/analyze` | Create diagnosis record |
| POST | `/api/v1/detection/{id}/images/fish` | Upload fish image → AI inference |
| POST | `/api/v1/detection/{id}/images/poultry` | Upload poultry image → AI inference |
| POST | `/api/v1/detection/fish/predict` | Quick fish prediction (stateless) |
| POST | `/api/v1/detection/poultry/predict` | Quick poultry prediction (stateless) |
| GET | `/api/v1/detection/history` | Get diagnosis history |
| GET | `/health` | Health check |
| GET | `/docs` | Swagger UI |

---

## Treatment References

Treatment recommendations provided by this system are based on the following peer-reviewed sources and veterinary guidelines:

### Fish Disease References

1. **Bacterial Red Disease (Aeromoniasis)**
   - Plumb, J.A. & Hanson, L.A. (2011). *Health Maintenance and Principal Microbial Diseases of Cultured Fishes* (3rd ed.). Wiley-Blackwell.
   - FAO (2005). *Cultured Aquatic Species Information Programme: Cyprinus carpio*. FAO Fisheries and Aquaculture Department.

2. **Bacterial Gill Disease**
   - Noga, E.J. (2010). *Fish Disease: Diagnosis and Treatment* (2nd ed.). Wiley-Blackwell.
   - Ferguson, H.W. (2006). *Systemic Pathology of Fish* (2nd ed.). Scotian Press.

3. **Fungal Diseases (Saprolegniasis)**
   - Bruno, D.W. & Wood, B.P. (1999). *Saprolegnia and Other Oomycetes*. In: Woo, P.T.K. (ed.) Fish Diseases and Disorders. CABI Publishing.
   - Willoughby, L.G. (1994). *Fungi and Fish Diseases*. Pisces Press.

4. **Parasitic Diseases**
   - Rohde, K. (ed.) (2005). *Marine Parasitology*. CABI Publishing.
   - Woo, P.T.K. (ed.) (2006). *Fish Diseases and Disorders, Volume 1: Protozoan and Metazoan Infections* (2nd ed.). CABI Publishing.

5. **White Tail Disease (Viral)**
   - OIE (World Organisation for Animal Health). (2021). *Aquatic Animal Health Code*. OIE, Paris.
   - Bondad-Reantaso, M.G. et al. (2005). Disease and health management in Asian aquaculture. *Veterinary Parasitology*, 132(3-4), 249-272.

### Poultry Disease References

6. **Coccidiosis**
   - Chapman, H.D. et al. (2010). A review of coccidiosis in poultry. *Avian Pathology*, 39(1), 1-6. https://doi.org/10.1080/03079450903488233
   - Conway, D.P. & McKenzie, M.E. (2007). *Poultry Coccidiosis: Diagnostic and Testing Procedures* (3rd ed.). Blackwell Publishing.

7. **Newcastle Disease**
   - Alexander, D.J. (2000). Newcastle disease and other avian paramyxoviruses. *Revue Scientifique et Technique*, 19(2), 443-462.
   - OIE (2021). *Newcastle Disease*. In: OIE Terrestrial Manual. https://www.oie.int/en/disease/newcastle-disease/

8. **Salmonellosis**
   - Barrow, P.A. & Methner, U. (eds.) (2013). *Salmonella in Domestic Animals* (2nd ed.). CABI Publishing.
   - EFSA (European Food Safety Authority). (2019). Salmonella control in poultry flocks. *EFSA Journal*, 17(2), e05596.

### General Guidelines

9. **Bangladesh Department of Livestock Services (DLS)**
   - DLS (2020). *Guidelines for Disease Control in Poultry Farms*. Ministry of Fisheries and Livestock, Bangladesh.

10. **Department of Fisheries, Bangladesh**
    - DoF (2021). *Fish Disease Management Manual*. Ministry of Fisheries and Livestock, Bangladesh.

11. **World Organisation for Animal Health (OIE/WOAH)**
    - WOAH (2023). *Terrestrial Animal Health Code*. https://www.woah.org/en/what-we-do/standards/codes-and-manuals/

---

> **Disclaimer**: Treatment recommendations are for reference only and should be verified by a licensed veterinarian before administration. Drug availability and regulations may vary by region.

---

## Deployment

- **Backend**: [Railway](https://shobarkhamar-production.up.railway.app)
- **Frontend**: [Vercel](https://shobarkhamar.vercel.app)
- **API Docs**: https://shobarkhamar-production.up.railway.app/docs

## CI/CD

GitHub Actions pipeline runs on every push to `main`:
1. Backend smoke tests (pytest)
2. Frontend build check (Vite)
3. Deploy frontend to Vercel

---

## License

MIT License — see [LICENSE](LICENSE) for details.
