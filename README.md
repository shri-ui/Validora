---
title: Startup Validator
emoji: 🚀
colorFrom: indigo
colorTo: purple
sdk: streamlit
sdk_version: "1.45.0"
app_file: app.py
pinned: false
license: mit
short_description: AI Multi-Agent Startup Idea Validator
---

# 🚀 Startup Validator

AI-Powered Multi-Agent Due Diligence for Startup Ideas — in Seconds.

Enter a startup idea and 4 AI agents analyze it in parallel:
- 🔍 **Competitor Analysis** (Web Search via Tavily)
- 📊 **Market Sizing** (Web Search via Tavily)
- 💬 **Community Sentiment** (HackerNews API)
- ⚠️ **Open-Source Risk** (GitHub API)

Results are synthesized into a **Go / Caution / No-Go** verdict with a 0–100 confidence score.

## Tech Stack
- **LangGraph** — Multi-agent orchestration with parallel fan-out/fan-in
- **GPT-4o-mini** — Powers each research agent (ReAct pattern)
- **Streamlit** — Frontend UI
- **Tavily, HackerNews, GitHub APIs** — Real-time research tools
