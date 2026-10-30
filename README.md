---
title: Startup Validator
emoji: 🚀
colorFrom: indigo
colorTo: purple
sdk: docker
pinned: true
license: mit
short_description: AI Multi-Agent System for Startup Idea Validation
---

<div align="center">

# 🚀 Startup Validator

### AI-Powered Multi-Agent Due Diligence — in Seconds

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![React](https://img.shields.io/badge/React-Frontend-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Django](https://img.shields.io/badge/Django-Backend-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![xAI](https://img.shields.io/badge/Grok-LLM-000000?style=for-the-badge)](https://x.ai/)

**Enter a startup idea → 4 AI agents research it in parallel → Get a Go / Caution / No-Go verdict with a confidence score.**

[Live Demo](https://huggingface.co/spaces/vaibhavbasidoni/startup-validator) · [Report Bug](https://huggingface.co/spaces/vaibhavbasidoni/startup-validator/discussions) · [Request Feature](https://huggingface.co/spaces/vaibhavbasidoni/startup-validator/discussions)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [How It Works](#-how-it-works)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Deployment](#-deployment)

---

## 🧠 Overview

**Startup Validator** is a multi-agent AI system that performs automated due diligence on startup ideas. Instead of spending weeks researching manually, this system deploys **4 specialized AI agents in parallel** that use real-time data from the web, HackerNews, and GitHub to evaluate your idea from multiple angles.

A final **Scoring Engine** synthesizes all findings into:
- A **0–100 confidence score**
- A categorical **Go / Caution / No-Go** verdict
- An **executive summary** explaining the reasoning

All of this happens in approximately **10–15 seconds**.

---

## 🏗️ Architecture

<div align="center">

<img src="backend/assets/architecture.png" alt="System Architecture" width="700"/>

</div>

The system uses a **fan-out / fan-in** pattern powered by LangGraph:

1. **Fan-Out** — The user's startup idea is sent simultaneously to 4 independent research agents
2. **Parallel Execution** — All agents run concurrently, each querying different data sources
3. **Fan-In** — LangGraph waits for all agents to finish, then merges their results
4. **Scoring** — A final scoring node synthesizes everything into a structured verdict

### State Management

The system uses a `TypedDict` state schema with a **reducer pattern** for safe parallel writes:

```python
class AgentState(TypedDict):
    idea: str
    results: Annotated[List[dict], operator.add]  # Safe parallel appends
    score: int
    verdict: str
    summary: str
```

The `operator.add` annotation on `results` ensures that when multiple agents finish simultaneously, their findings are **appended** (not overwritten) — a critical pattern for parallel execution.

---

## ⚙️ How It Works

### Step 1: User Input
The user enters a startup idea through the React interface.

### Step 2: Parallel Agent Execution
Four agents execute simultaneously, each with a specialized role:

| Agent | Role | Data Source | Tool |
|-------|------|-------------|------|
| 🔍 **Competitor Agent** | Identifies existing competitors and market saturation | Web | Tavily Search API |
| 📊 **Market Sizing Agent** | Estimates TAM/SAM/SOM and growth rates | Web | Tavily Search API |
| 💬 **Sentiment Agent** | Analyzes developer/community sentiment | HackerNews | Algolia HN API |
| ⚠️ **OS Risk Agent** | Finds open-source alternatives that threaten the idea | GitHub | GitHub REST API |

Each agent uses the **ReAct (Reasoning + Acting) pattern** via LangGraph's `create_react_agent`:
1. The LLM receives a specialized prompt and decides which tool to call
2. The tool returns real-time data
3. The LLM analyzes the data and produces a concise finding
4. Source URLs are extracted and returned alongside findings

### Step 3: Scoring Engine
After all agents finish, the **Scoring Engine** receives all findings and uses GPT-4o-mini with **structured output** (Pydantic schema) to generate:

```json
{
  "score": 72,
  "verdict": "Caution",
  "summary": "The idea shows promise with a large TAM, but faces significant competition..."
}
```

### Step 4: Results Dashboard
The React UI displays:
- Login and signup before running protected validations
- Agent run status with progress feedback
- Verdict card with color-coded score
- Executive summary
- Detailed agent reports in a 2×2 grid
- Clickable source pills linking to original research
- Downloadable PDF report

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **4 Parallel Agents** | Competitor, Market, Sentiment, and OS Risk analysis run simultaneously |
| 🔐 **Login / Signup** | Local email/password accounts with signed bearer-token sessions |
| ⚡ **~10s Execution** | Full validation in approximately 10–15 seconds |
| 📊 **Structured Scoring** | Pydantic-enforced JSON output ensures consistent Go/Caution/No-Go verdicts |
| 🔗 **Source Citations** | ChatGPT-style clickable source pills with favicons for every finding |
| 📄 **PDF Export** | Download a professionally formatted report with scores, findings, and sources |
| 💾 **Smart Caching** | Re-submitting the same idea returns instant cached results from the API |
| 📈 **Progress Feedback** | Agent run status and activity indicator while validation is running |
| 🎨 **React UI** | Responsive dashboard with score, summary, detailed reports, sources, and PDF export |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Orchestration** | [LangGraph](https://langchain-ai.github.io/langgraph/) | Multi-agent graph with parallel fan-out/fan-in |
| **LLM** | [Grok 4.7](https://openrouter.ai/x-ai/grok-4.7) via OpenRouter and `langchain-openai` | Powers all agents and the scoring engine |
| **Web Search** | [Tavily API](https://tavily.com/) | Real-time web research for competitors and market data |
| **Community Data** | [HackerNews Algolia API](https://hn.algolia.com/api) | Developer community sentiment analysis |
| **Code Search** | [GitHub REST API](https://docs.github.com/en/rest) | Open-source alternative detection |
| **API** | [Django](https://www.djangoproject.com/) | HTTP API for authentication, validation, and PDF reports |
| **Frontend** | [React](https://react.dev/) + [Vite](https://vite.dev/) | Interactive web interface |
| **PDF Generation** | [fpdf2](https://py-pdf.github.io/fpdf2/) | Downloadable validation reports |
| **Deployment** | [Hugging Face Spaces](https://huggingface.co/spaces) | Free cloud hosting |

---

## 📁 Project Structure

```
startup-validator/
├── backend/                  # Django project, API app, and validation services
│   ├── manage.py              # Django management entry point
│   ├── config/                # Settings, root URLs, and WSGI app
│   ├── api/                   # Django API app, views, and routes
│   ├── validator/             # Auth, agents, graph, tools, and reports
│   └── assets/                # Architecture diagram
├── frontend/                 # React + Vite frontend
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       └── components/
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

### Key Files Explained

- **`backend/validator/state.py`** — Defines the shared state schema using `TypedDict` with `Annotated[List, operator.add]` for safe parallel writes
- **`backend/validator/tools.py`** — Three `@tool` functions that wrap external APIs (Tavily, HackerNews Algolia, GitHub)
- **`backend/validator/agents.py`** — Four agent functions using `create_react_agent`, each extracting source URLs for citation
- **`backend/validator/graph.py`** — Builds the parallel LangGraph workflow and scoring engine
- **`backend/api/views.py`** — Django API views for authentication, validation, caching, and PDF reports
- **`frontend/src/App.tsx`** — React dashboard; API calls are in `frontend/src/lib/api.ts`

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- API keys for: [OpenRouter](https://openrouter.ai/settings/keys), [Tavily](https://tavily.com/), [GitHub](https://github.com/settings/tokens)

### Installation

```bash
# Clone the repository
git clone https://huggingface.co/spaces/vaibhavbasidoni/startup-validator
cd startup-validator

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Configuration

Create a `.env` file in the root directory:

```env
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=x-ai/grok-4.7
TAVILY_API_KEY=your-tavily-api-key
GITHUB_TOKEN=your-github-token
AUTH_SECRET_KEY=replace-with-a-long-random-secret
AUTH_DB_PATH=startup_validator.db
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
```

Authentication uses SQLite by default for local development. To store signup and login accounts in PostgreSQL, set `AUTH_DATABASE_URL` to your PostgreSQL connection string (for example, `postgresql://user:password@host:5432/database`). The backend creates the `users` table on startup. `AUTH_DATABASE_URL` takes precedence over `AUTH_DB_PATH`; if it is unset, SQLite is used. Install dependencies with `pip install -r requirements.txt` to include the PostgreSQL driver.

Users have a `status` column (`active` or `inactive`). New accounts default to `active`; startup adds the column to an existing users table and marks existing accounts active. Inactive users cannot log in or use an existing token. To deactivate a PostgreSQL account, run `UPDATE users SET status = 'inactive' WHERE email = 'user@example.com';`; to reactivate it, set the status back to `active`.

Set `AUTH_SECRET_KEY` to a long, random, stable value in production so signed login sessions remain valid across restarts. Keep the database URL and signing secret in the deployment environment or secret manager, not in source control. Existing SQLite accounts are not migrated automatically; migrate them separately before switching databases if you need to retain them.

### Run Locally

```bash
# Terminal 1: Django API
python backend/manage.py runserver 8000

# Terminal 2: React UI
cd frontend
npm run dev
```

The React app will open at `http://localhost:5173`

---

## ☁️ Deployment

This project uses a React frontend with a Django backend. For production, run `cd backend && gunicorn config.wsgi:application` and configure `DJANGO_ALLOWED_HOSTS`, `DJANGO_SECRET_KEY`, and the database connection in deployment secrets.

### Deploy Your Own

1. Create a new Space at [huggingface.co/new-space](https://huggingface.co/new-space) with **Docker** SDK
2. Push your code:
   ```bash
   git remote add space https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
   git push space main
   ```
3. Add your API keys as **Secrets** in Space Settings:
  - `OPENROUTER_API_KEY`
  - `OPENROUTER_MODEL` (optional; defaults to `x-ai/grok-4.7`)
   - `TAVILY_API_KEY`
   - `GITHUB_TOKEN`

---

## 🧩 Key Design Patterns

### 1. Fan-Out / Fan-In Parallelism
All 4 research agents execute simultaneously via LangGraph's parallel edges, reducing total execution time from ~40s (sequential) to ~10s.

### 2. ReAct Agent Pattern
Each agent uses `create_react_agent` — the LLM autonomously decides when and how to call its tools, enabling flexible multi-step research.

### 3. Structured LLM Output
The scoring engine uses `.with_structured_output(FinalReport)` with a Pydantic schema to guarantee consistent JSON responses.

### 4. Safe Parallel State Writes
The `Annotated[List[dict], operator.add]` reducer pattern ensures concurrent agent results are merged without race conditions.

---

## 📝 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ using LangGraph & Grok**

</div>
