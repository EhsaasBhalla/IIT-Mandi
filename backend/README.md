# ⚙️ Teacher AI Platform — Backend Service

> Python Flask REST API and 10-Stage Pipeline Execution Engine.

---

## 📋 Architecture Overview

The backend orchestrates the conversion of educational documents into structured Teacher Knowledge Packages (TKP).

### Core Components
1. **REST API Layer (`app/api/routes.py`)**:
   - `POST /api/upload`: Receives PDF/text documents, computes SHA-256 hash, and queues background pipeline job.
   - `GET /api/status/<job_id>`: Returns real-time progress percentage and active stage name.
   - `GET /api/result/<job_id>`: Returns completed TKP package JSON.
   - `GET /api/jobs`: Returns historical jobs index.

2. **Orchestrator & State Machine (`app/orchestrator/job_manager.py`)**:
   - Spawns background worker thread per job.
   - Saves intermediate state to `storage/cache/<file_hash>.json` after every single stage.
   - Automatically resumes from last completed stage on server restart or interruption.

3. **10-Stage Pipeline (`app/stages/`)**:
   - **Stage 1 (Doc Intelligence)**: Local PyPDF2 parsing (0 LLM cost).
   - **Stage 2 (Classification)**: Subject, grade level, curriculum alignment.
   - **Stage 3 (Knowledge Extraction)**: Core concepts, learning objectives, definitions, formulae, and common misconceptions.
   - **Stage 4 (Lesson Planner)**: Multi-period timing and pedagogical distribution.
   - **Stage 5 (Content Generation)**: Entry/Exit tickets, teacher lecture scripts, blackboard diagrams, and differentiation.
   - **Stage 6 (Activities)**: In-class group discussions, debates, and experiments.
   - **Stage 7 (Assessment)**: Differentiated A/B test assessment variants.
   - **Stage 8 (Gap Analysis)**: Misconception diagnostic questions and remedial interventions.
   - **Stage 9 (Validation)**: Automated consistency and completeness checking.
   - **Stage 10 (Publishing)**: Final TKP synthesis and packaging.

4. **Resilient LLM Client (`app/llm/client.py`)**:
   - Multi-provider support: **Groq**, **Google Gemini**, **OpenAI**, **HuggingFace**.
   - Built-in dynamic request pacing and exponential backoff retry logic.

---

## 🛠️ Local Development Setup

### 1. Environment Setup
```bash
# In Application/backend directory:
python -m venv .venv
# Activate:
.\.venv\Scripts\activate   # Windows
source .venv/bin/activate  # macOS / Linux

pip install -r requirements.txt
```

### 2. Configure Environment Variables (`.env`)
Create a `.env` file in `backend/`:
```ini
# LLM Provider Configuration (groq / gemini / openai)
LLM_PROVIDER=groq

# API Keys
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here

# Optional: Custom Port
PORT=5000
```

### 3. Run Development Server
```bash
python run.py
```
The server will start at `http://127.0.0.1:5000`.

---

## 🚀 Deployment to Render

1. Create a **New Web Service** on Render.
2. Select your repository and specify `backend` as the root directory.
3. Configure settings:
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn run:app`
4. Add environment variables:
   - `GROQ_API_KEY`: `<your-key>`
   - `LLM_PROVIDER`: `groq`
5. Click **Deploy**.

---

## 🗄️ Database & Storage Architecture

### Current Persistence (File-Based)
- Cache files: `storage/cache/<file_hash>.json`
- Index metadata: `storage/cache/_jobs_index.json`
- Uploaded files: `storage/uploads/`

### Scaling to PostgreSQL / Supabase
To connect to an external PostgreSQL database:
1. Install `psycopg2-binary` or `SQLAlchemy`.
2. Define a `jobs` table with a `JSONB` column to store the TKP payload:
```sql
CREATE TABLE tkp_jobs (
    id UUID PRIMARY KEY,
    file_hash VARCHAR(64) UNIQUE,
    status VARCHAR(32),
    progress INT,
    stage VARCHAR(128),
    language VARCHAR(64),
    created_at TIMESTAMP,
    result JSONB
);
```
3. Update `app/orchestrator/job_manager.py` to write state to the database instead of local JSON files.
