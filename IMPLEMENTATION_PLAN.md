# Implementation Plan: Startup Validator Multi-Agent System

## 1. Objective
Build a multi-agent system using LangGraph and the Claude API that validates startup ideas in ~10 seconds by running four research agents in parallel. The system will aggregate findings into a final Go/Caution/No-Go verdict with a 0–100 confidence score, and will be deployed as a live demo on Hugging Face Spaces.

## 2. Architecture & Tech Stack
- **Framework:** LangGraph (for orchestration and state management) + LangChain
- **LLM:** Claude API (`langchain-anthropic` for `ChatAnthropic`)
- **Parallel Execution:** LangGraph static fan-out/fan-in using the `Send` API or parallel edges.
- **Tools / APIs:**
  - Web Search (e.g., Tavily or DuckDuckGo) for Competitor & Market Analysis.
  - HackerNews API for Community Sentiment.
  - GitHub API for Open-Source Risk Detection.
- **Frontend / Deployment:** Streamlit app hosted on Hugging Face Spaces.

## 3. Graph Design
1. **State Schema:** A `TypedDict` containing the `idea`, `results` (using `Annotated[list, operator.add]` for safe parallel writes), `verdict`, and `score`.
2. **Input Phase:** Capture the startup idea.
3. **Map Phase (Parallel execution):** Route the idea simultaneously to four nodes:
   - `competitor_agent`: Identifies existing solutions.
   - `market_sizing_agent`: Estimates TAM/SAM/SOM.
   - `sentiment_agent`: Searches HackerNews for discussions on similar concepts.
   - `os_risk_agent`: Searches GitHub for open-source alternatives.
4. **Reduce Phase (Scoring Engine):** Wait for all 4 agents to finish. A single node synthesizes the list of results and uses Claude (with structured output) to generate a final report, a 0-100 score, and a categorical verdict.

## 4. Step-by-Step Implementation

### Step 1: Project Setup
- Initialize project and set up virtual environment.
- Install dependencies: `langgraph`, `langchain-anthropic`, `langchain`, `streamlit`, `requests`, `tavily-python`.
- Configure environment variables for API keys (Anthropic, GitHub, Tavily).

### Step 2: Define State Schema & Tools
- Define `AgentState` with `TypedDict` and `operator.add` for aggregating research results.
- Implement `@tool` functions:
  - `web_search(query)`
  - `hn_search(query)`
  - `github_search(query)`

### Step 3: Implement Research Agents (Nodes)
- Write node functions for each of the 4 agents.
- Each agent will use a specific prompt, invoke its corresponding tool(s), and return its findings as a dictionary to be appended to the state's `results` list.

### Step 4: Implement Scoring Engine (Node)
- Write the `scoring_node` that takes the accumulated `results`.
- Use `ChatAnthropic` with `.with_structured_output()` to enforce a strict JSON response containing `score` (0-100), `verdict` (Go/Caution/No-Go), and a brief `summary`.

### Step 5: Construct the Graph
- Initialize `StateGraph(AgentState)`.
- Add all 5 nodes (4 agents + 1 scoring engine).
- Add edges: `START` branches out to the 4 agents (fan-out).
- Add edges: All 4 agents point to the `scoring_node` (fan-in).
- Add edge: `scoring_node` points to `END`.
- Compile the graph.

### Step 6: Build the Streamlit Frontend
- Create `app.py`.
- Add a text area for the user to input their startup idea.
- Implement LangGraph streaming (`stream_mode="updates"`) to show real-time progress as each agent finishes.
- Display the final verdict, score, and individual agent reports in an easy-to-read dashboard format.

### Step 7: Deploy to Hugging Face
- Create `requirements.txt`.
- Add Hugging Face Space secrets for the API keys.
- Push the code to Hugging Face Spaces using the Streamlit SDK.

## 5. Verification
- Test individual tool functions via unit tests.
- Test graph flow using mock LLM responses to ensure parallel fan-out and fan-in works correctly without race conditions.
- Perform end-to-end tests with 3 sample startup ideas (one clearly good, one saturated, one heavily open-sourced) to validate the scoring accuracy.