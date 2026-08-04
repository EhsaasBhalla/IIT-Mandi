# 🎓 Teacher AI Platform (TKP Generator)

> **Autonomous Multi-Stage Lesson Planning & Curriculum Intelligence System**  
> Developed for **Indian Institute of Technology Mandi**

---

## 🌟 Overview

The **Teacher Knowledge Package (TKP) Generator** is a production-grade AI platform that ingests raw educational materials (textbooks, PDFs, syllabus notes) and autonomously synthesizes an exhaustive, 10-stage **Teacher Knowledge Package**.

Each output is governed by strictly typed **Pydantic schemas**, featuring:
- **Local-First Extraction**: PyPDF2 text parsing with zero token costs and no API rate-limit overhead.
- **Resilient Multi-Provider LLM Engine**: Groq (`llama-3.1-8b-instant`, `llama-3.3-70b-versatile`) with automatic fallback to Gemini / OpenAI / HuggingFace.
- **Stage-Level Disk Caching & Auto-Resume**: Every stage caches incrementally to disk (`storage/cache/<hash>.json`). Failed or interrupted pipelines resume seamlessly.
- **Zero-Dependency Vanilla CSS Glassmorphism UI**: High-performance React SPA with responsive dark mode and real-time stage tracking.

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend (React + Vite)"]
        UI[Upload Page]
        PP[Progress Page]
        RP[Results Page]
        HP[History Page]
    end

    subgraph Backend["Backend (Flask + Python)"]
        API[REST API Layer<br/>Flask Blueprint]
        JM[Job Manager<br/>Thread Pool + Cache]
        PO[Pipeline Orchestrator]
        
        subgraph Pipeline["10-Stage Pipeline"]
            S1[S1: Document Intelligence]
            S2[S2: Educational Classification]
            S3[S3: Knowledge Extraction]
            S4[S4: Lesson Planning]
            S5[S5: Content Generation]
            S6[S6: Activity Design]
            S7[S7: Assessment Generation]
            S8[S8: Gap Analysis]
            S9[S9: Validation Engine]
            S10[S10: Publishing]
        end

        subgraph LLMLayer["LLM Abstraction Layer"]
            LC[LLM Client<br/>litellm + instructor]
            RT[Retry Engine<br/>Exponential Backoff]
            FB[Model Fallback<br/>Primary → Lite]
        end

        subgraph Storage["Persistent Storage"]
            CF[Cache Files<br/>Per-Stage JSON]
            JI[Jobs Index<br/>History Persistence]
            UF[Upload Storage]
        end
    end

    subgraph Providers["LLM Providers"]
        GQ[Groq<br/>llama-3.3-70b]
        GM[Gemini<br/>2.0-flash]
        OA[OpenAI<br/>gpt-4o-mini]
        HF[HuggingFace<br/>DeepSeek]
    end

    UI -->|POST /api/upload| API
    PP -->|GET /api/status| API
    RP -->|GET /api/result| API
    HP -->|GET /api/jobs| API

    API --> JM
    JM --> PO
    PO --> S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7 --> S8 --> S9 --> S10

    S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 --> LC
    LC --> RT --> FB
    FB --> GQ & GM & OA & HF

    JM --> CF & JI
    S1 -->|PyPDF2| UF
```

---

## 📁 Repository Structure

```
Application/
├── DESIGN_DOCUMENT.md          # Comprehensive Architecture & Design Document
├── DESIGN_DOCUMENT.docx        # Formatted Word Document of Design Specs
├── README.md                   # Master Repository Guide (This file)
│
├── backend/                    # Python Flask Backend
│   ├── app/
│   │   ├── api/routes.py       # REST API Endpoints (/upload, /status, /result, /jobs)
│   │   ├── llm/client.py       # LLM Client (Groq, Gemini, OpenAI) + Pacing + Retry
│   │   ├── models/             # Pydantic Schemas (Stages 1–10 + Master TKP)
│   │   ├── orchestrator/       # JobManager & Pipeline Runner
│   │   ├── parsers/pdf_parser.py # Local-First PyPDF2 Parser
│   │   └── stages/             # Stage 1 to Stage 10 implementations
│   ├── storage/                # Cache & Uploads directory
│   ├── requirements.txt        # Backend dependencies
│   ├── run.py                  # Server entry point
│   └── README.md               # Backend specific documentation
│
└── frontend/                   # React + Vite Frontend
    ├── src/
    │   ├── components/         # Reusable UI (UploadZone, StageProgress, TKPViewer, etc.)
    │   ├── pages/              # UploadPage, ProgressPage, ResultsPage, HistoryPage
    │   ├── config.js           # API Base URL configuration
    │   ├── App.jsx             # React Router Setup
    │   └── index.css           # Vanilla CSS Design System (Glassmorphism + Dark Mode)
    ├── vercel.json             # Vercel SPA routing rewrite rules
    ├── package.json            # Frontend dependencies
    └── README.md               # Frontend specific documentation
```

---

## 🚀 Quick Local Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Groq or Gemini API Key

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Create .env file with your API key
echo GROQ_API_KEY=your_groq_api_key_here > .env
echo LLM_PROVIDER=groq >> .env

# Start backend server (runs on http://127.0.0.1:5000)
python run.py
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

## 🌐 Full Deployment Guide (GitHub + Render + Vercel + Database)

### Part 1: Push Code to GitHub

1. Initialize git and commit:
```bash
cd "E:\IIT Mandi\Application"
git init
git add .
git commit -m "feat: Initial commit of Teacher AI Platform with 10-stage pipeline and local caching"
```
2. Create a new repository on [GitHub](https://github.com/new).
3. Link and push:
```bash
git remote add origin https://github.com/<your-username>/teacher-ai-platform.git
git branch -M main
git push -u origin main
```

---

### Part 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn run:app`
4. Add **Environment Variables** in Render dashboard:
   - `GROQ_API_KEY`: `gsk_...` (Your Groq Key)
   - `LLM_PROVIDER`: `groq`
   - `GEMINI_API_KEY`: `AQ...` (Optional Fallback)
5. Click **Deploy Web Service**.
6. Copy your live backend URL (e.g., `https://teacher-ai-backend.onrender.com`).

---

### Part 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new) and import your GitHub repository.
2. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add **Environment Variables** in Vercel:
   - `VITE_API_BASE_URL`: `https://teacher-ai-backend.onrender.com` (Your Render backend URL)
4. Click **Deploy**.
5. Your frontend is live with full SPA routing (configured via `vercel.json`).

---

### Part 4: Database Architecture & Options

#### Current Setup (Default: Zero-Cost Persistent Disk Storage)
- The platform currently uses a **file-based JSON persistence engine**:
  - `storage/cache/<file_hash>.json`: Saves stage outputs incrementally.
  - `storage/cache/_jobs_index.json`: Saves historical jobs metadata across restarts.
- **Pros**: Zero external dependencies, instant setup, no database hosting fees.

#### Production Database Scaling Options

If you wish to scale beyond single-instance disk storage:

| Option | Best Used For | Free Tier | Migration Effort |
|--------|---------------|-----------|------------------|
| **Supabase (PostgreSQL)** | Structured relational data + JSONB for TKP packages | 500 MB Free | Low (Use `SQLAlchemy` or `psycopg2` with JSONB column) |
| **MongoDB Atlas** | Document-based schema natively matching Pydantic dicts | 512 MB Free | Very Low (Direct `pymongo` insert of `tkp.model_dump()`) |
| **SQLite (Mounted Volume)** | Single-server persistent deployments on Render / Fly.io | Free | Zero (Change file path to SQLite DB) |

To connect Supabase or PostgreSQL:
1. Add `DATABASE_URL=postgresql://user:pass@host:5432/dbname` in backend `.env`.
2. In `app/orchestrator/job_manager.py`, replace file read/write methods with database query operations.

---

## 📄 License & Attribution

Designed and engineered for educational research at **IIT Mandi**.  
For detailed architectural specifications, refer to [DESIGN_DOCUMENT.md](file:///E:/IIT%20Mandi/Application/DESIGN_DOCUMENT.md) and [DESIGN_DOCUMENT.docx](file:///E:/IIT%20Mandi/Application/DESIGN_DOCUMENT.docx).
