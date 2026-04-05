---
title: Startup Validator
emoji: 🚀
colorFrom: indigo
colorTo: purple
sdk: streamlit
sdk_version: 1.56.0
app_file: app.py
pinned: true
license: mit
short_description: AI Multi-Agent System for Startup Idea Validation
---

<div align="center">

# 🚀 Startup Validator

### AI-Powered Multi-Agent Due Diligence — in Seconds

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![Streamlit](https://img.shields.io/badge/Streamlit-Frontend-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://streamlit.io)
[![OpenAI](https://img.shields.io/badge/GPT--4o--mini-LLM-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)

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

<img src="assets/architecture.png" alt="System Architecture" width="700"/>

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
The user enters a startup idea through the Streamlit interface.

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
The Streamlit UI displays:
- Live agent status updates with progress bar
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
| ⚡ **~10s Execution** | Full validation in approximately 10–15 seconds |
| 📊 **Structured Scoring** | Pydantic-enforced JSON output ensures consistent Go/Caution/No-Go verdicts |
| 🔗 **Source Citations** | ChatGPT-style clickable source pills with favicons for every finding |
| 📄 **PDF Export** | Download a professionally formatted report with scores, findings, and sources |
| 💾 **Smart Caching** | Re-submitting the same idea returns instant cached results |
| 📈 **Progress Bar** | Real-time progress tracking as each agent completes (20% per node) |
| 🎨 **Premium Dark UI** | Glassmorphism design with gradient cards, animations, and responsive layout |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Orchestration** | [LangGraph](https://langchain-ai.github.io/langgraph/) | Multi-agent graph with parallel fan-out/fan-in |
| **LLM** | [GPT-4o-mini](https://platform.openai.com/) via `langchain-openai` | Powers all agents and the scoring engine |
| **Web Search** | [Tavily API](https://tavily.com/) | Real-time web research for competitors and market data |
| **Community Data** | [HackerNews Algolia API](https://hn.algolia.com/api) | Developer community sentiment analysis |
| **Code Search** | [GitHub REST API](https://docs.github.com/en/rest) | Open-source alternative detection |
| **Frontend** | [Streamlit](https://streamlit.io/) | Interactive web interface |
| **PDF Generation** | [fpdf2](https://py-pdf.github.io/fpdf2/) | Downloadable validation reports |
| **Deployment** | [Hugging Face Spaces](https://huggingface.co/spaces) | Free cloud hosting |

---

## 📁 Project Structure

```
startup-validator/
├── app.py                    # Streamlit frontend + UI logic
├── requirements.txt          # Python dependencies
├── README.md                 # This file
├── .streamlit/
│   └── config.toml           # Dark theme configuration
├── assets/
│   └── architecture.png      # Architecture diagram
└── src/
    ├── __init__.py
    ├── state.py              # AgentState TypedDict with reducer
    ├── tools.py              # @tool functions (web_search, hn_search, github_search)
    ├── agents.py             # 4 research agent nodes + source extraction
    └── graph.py              # LangGraph construction + scoring engine
```

### Key Files Explained

- **`src/state.py`** — Defines the shared state schema using `TypedDict` with `Annotated[List, operator.add]` for safe parallel writes
- **`src/tools.py`** — Three `@tool`-decorated functions that wrap external APIs (Tavily, HackerNews Algolia, GitHub)
- **`src/agents.py`** — Four agent node functions using `create_react_agent` (ReAct pattern). Each extracts source URLs from tool responses for citation
- **`src/graph.py`** — Builds the `StateGraph` with fan-out edges (START → 4 agents), fan-in edges (4 agents → scoring), and the scoring engine using `with_structured_output()`
- **`app.py`** — Streamlit app with custom CSS, streaming execution, progress bar, caching, PDF export, and ChatGPT-style source display

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- API keys for: [OpenAI](https://platform.openai.com/api-keys), [Tavily](https://tavily.com/), [GitHub](https://github.com/settings/tokens)

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
```

### Configuration

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=sk-your-openai-key-here
TAVILY_API_KEY=tvly-your-tavily-key-here
GITHUB_TOKEN=ghp_your-github-token-here
```

### Run Locally

```bash
streamlit run app.py
```

The app will open at `http://localhost:8501`

---

## ☁️ Deployment

This project is deployed on **Hugging Face Spaces** using the Streamlit SDK.

### Deploy Your Own

1. Create a new Space at [huggingface.co/new-space](https://huggingface.co/new-space) with **Streamlit** SDK
2. Push your code:
   ```bash
   git remote add space https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
   git push space main
   ```
3. Add your API keys as **Secrets** in Space Settings:
   - `OPENAI_API_KEY`
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

**Built with ❤️ using LangGraph & GPT-4o-mini**

</div>