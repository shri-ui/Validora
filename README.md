<div align="center">

# 🚀 Validora

### AI-assisted startup research and idea validation

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![React](https://img.shields.io/badge/React-Frontend-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Django](https://img.shields.io/badge/Django-Backend-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![xAI](https://img.shields.io/badge/Grok-LLM-000000?style=for-the-badge)](https://x.ai/)

**Explore a startup idea with web, community, and open-source research, then review a structured viability score and verdict.**

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

**Validora** is an AI-assisted research tool for exploring startup ideas. It uses four focused research agents to gather information from web search, Hacker News, and GitHub, then produces a structured viability score, verdict, and summary with source links.

The output is an early research aid, not a substitute for validating assumptions with customers or conducting professional financial, legal, or investment diligence.

A final **Scoring Engine** synthesizes all findings into:
- A **0–100 confidence score**
- A categorical **Go / Caution / No-Go** verdict
- An **executive summary** explaining the reasoning

Results depend on the response times of the language model and external research services.

---

## 🏗️ Architecture

<div align="center">

<img src="backend/assets/architecture.png" alt="System Architecture" width="700"/>

</div>

The LangGraph workflow runs four research agents in sequence, then passes their findings to a scoring step:

1. **Competitor research** — Searches the web for direct and indirect competitors.
2. **Market research** — Searches for market size, growth, and industry context.
3. **Community research** — Searches Hacker News for related discussions.
4. **Open-source research** — Searches GitHub for related projects and alternatives.
5. **Scoring** — The configured language model synthesizes the findings into a score, verdict, and summary.

### State Management

The system uses a `TypedDict` state schema with a **reducer pattern** to collect results from each agent:

```python
class AgentState(TypedDict):
    idea: str
    results: Annotated[List[dict], operator.add]  # Append each agent's results
    score: int
    verdict: str
    summary: str
```

The `operator.add` annotation on `results` appends each agent's findings as the workflow progresses.

---

## ⚙️ How It Works

### Step 1: User Input
The user enters a startup idea through the React interface.

### Step 2: Sequential Agent Research
Four agents run in sequence, each with a specialized role:

| Agent | Role | Data Source | Tool |
|-------|------|-------------|------|
| 🔍 **Competitor Agent** | Identifies existing competitors and market saturation | Web | Tavily Search API |
| 📊 **Market Sizing Agent** | Estimates TAM/SAM/SOM and growth rates | Web | Tavily Search API |
| 💬 **Sentiment Agent** | Analyzes developer/community sentiment | HackerNews | Algolia HN API |
| ⚠️ **OS Risk Agent** | Finds open-source alternatives that threaten the idea | GitHub | GitHub REST API |

Each research agent uses LangGraph's `create_react_agent`:
1. The LLM receives a specialized prompt and decides which tool to call
2. The tool returns real-time data
3. The LLM analyzes the data and produces a concise finding
4. Source URLs are extracted and returned alongside findings

### Step 3: Scoring Engine
After all agents finish, the **Scoring Engine** sends their findings to the configured OpenRouter model and requests **structured output** matching a Pydantic schema. The default model is `x-ai/grok-4.7`; it can be changed with `OPENROUTER_MODEL`.

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
| 🤖 **4 Research Agents** | Competitor, market, community sentiment, and open-source risk research |
| 🔐 **Login / Signup** | Local email/password accounts with signed bearer-token sessions |
| 📡 **Research Sources** | Web search, Hacker News discussions, and GitHub repositories |
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
| **Orchestration** | [LangGraph](https://langchain-ai.github.io/langgraph/) | Sequential multi-agent research and scoring workflow |
| **LLM** | OpenRouter via `langchain-openai` (defaults to `x-ai/grok-4.7`) | Powers the research agents and scoring engine |
| **Web Search** | [Tavily API](https://tavily.com/) | Real-time web research for competitors and market data |
| **Community Data** | [HackerNews Algolia API](https://hn.algolia.com/api) | Developer community sentiment analysis |
| **Code Search** | [GitHub REST API](https://docs.github.com/en/rest) | Open-source alternative detection |
| **API** | [Django](https://www.djangoproject.com/) | HTTP API for authentication, validation, and PDF reports |
| **Frontend** | [React](https://react.dev/) + [Vite](https://vite.dev/) | Interactive web interface |
| **PDF Generation** | [fpdf2](https://py-pdf.github.io/fpdf2/) | Downloadable validation reports |
| **Deployment** | Django API and Vite frontend | Deploy using hosting services that support Python and static or Node.js web apps |

---

## 📁 Project Structure

```
validora/
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

- **`backend/validator/state.py`** — Defines the shared state schema using `TypedDict` with `Annotated[List, operator.add]` to append agent findings
- **`backend/validator/tools.py`** — Three `@tool` functions that wrap external APIs (Tavily, HackerNews Algolia, GitHub)
- **`backend/validator/agents.py`** — Four agent functions using `create_react_agent`, each extracting source URLs for citation
- **`backend/validator/graph.py`** — Builds the sequential LangGraph workflow and scoring engine
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
git clone https://github.com/<YOUR_GITHUB_USERNAME>/validora.git
cd validora

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

The project has a Django API and a Vite-built React frontend. For production, serve the Django application with a production WSGI server (for example, `cd backend && gunicorn config.wsgi:application`), build and host the frontend, and configure the API URL and allowed hosts for your deployment. Store API keys, signing secrets, and database credentials in your hosting provider's secret manager; do not commit them to the repository.

---

## 🧩 Key Design Patterns

### 1. Sequential Research Workflow
The workflow runs each research agent in sequence and then scores the collected findings.

### 2. ReAct Agent Pattern
Each agent uses `create_react_agent` — the LLM autonomously decides when and how to call its tools, enabling flexible multi-step research.

### 3. Structured LLM Output
The scoring engine uses `.with_structured_output(FinalReport)` with a Pydantic schema to guarantee consistent JSON responses.

### 4. Incremental State Updates
The `Annotated[List[dict], operator.add]` reducer appends each agent's findings to the shared workflow state.

---

## 📝 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with LangGraph, Django, React, and OpenRouter**

</div>
