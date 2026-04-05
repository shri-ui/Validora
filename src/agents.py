import os
import json
from urllib.parse import urlparse
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from src.state import AgentState
from src.tools import web_search, hn_search, github_search
from langgraph.prebuilt import create_react_agent

# Initialize the OpenAI model we will use for our agents.
def get_llm():
    return ChatOpenAI(model="gpt-4o-mini", temperature=0.2)


# ──────────────────────────────────────────────
#  Source Extraction Utility
# ──────────────────────────────────────────────
def _extract_sources(messages):
    """
    Parse the ReAct agent's tool-response messages and pull out
    every (title, url) pair that was returned by our tools.
    """
    sources = []
    seen_urls = set()

    for msg in messages:
        # Only look at ToolMessage objects
        if not (hasattr(msg, "type") and msg.type == "tool"):
            continue

        content = getattr(msg, "content", "")
        if not content:
            continue

        lines = content.split("\n")
        current_title = None

        for line in lines:
            stripped = line.strip()

            # Capture title / repo name from the line before the URL
            if stripped.startswith("Title:"):
                current_title = stripped[len("Title:"):].strip()
            elif stripped.startswith("Repo:"):
                current_title = stripped[len("Repo:"):].strip()

            # Capture URL
            elif stripped.startswith("URL:"):
                url = stripped[len("URL:"):].strip()
                if url and url.startswith("http") and url not in seen_urls:
                    seen_urls.add(url)
                    domain = urlparse(url).netloc.replace("www.", "")
                    sources.append({
                        "title": current_title or domain,
                        "url": url,
                        "domain": domain,
                    })
                    current_title = None

    return sources


# ──────────────────────────────────────────────
#  Agent 1: Competitor Analysis
# ──────────────────────────────────────────────
def competitor_agent(state: AgentState) -> dict:
    idea = state["idea"]
    print(f"[Agent: Competitor] Starting research on idea: {idea[:30]}...")

    llm = get_llm()
    agent = create_react_agent(llm, tools=[web_search])

    prompt = f"""You are a top-tier startup analyst. Your job is to find direct and indirect competitors for this startup idea: '{idea}'
    Use the web_search tool to find existing companies doing this.
    Provide a concise summary (max 3-4 sentences) of who the biggest players are and how crowded the space is."""

    response = agent.invoke({"messages": [HumanMessage(content=prompt)]})
    final_message = response["messages"][-1].content
    sources = _extract_sources(response["messages"])

    return {"results": [{"agent": "competitor_analysis", "findings": final_message, "sources": sources}]}


# ──────────────────────────────────────────────
#  Agent 2: Market Sizing
# ──────────────────────────────────────────────
def market_sizing_agent(state: AgentState) -> dict:
    idea = state["idea"]
    print(f"[Agent: Market Sizing] Starting research on idea: {idea[:30]}...")

    llm = get_llm()
    agent = create_react_agent(llm, tools=[web_search])

    prompt = f"""You are a market researcher. Estimate the Total Addressable Market (TAM) for this startup idea: '{idea}'
    Use the web_search tool to find market reports, industry growth rates (CAGR), and overall market value.
    Provide a concise summary (max 3-4 sentences) with rough dollar estimates if possible."""

    response = agent.invoke({"messages": [HumanMessage(content=prompt)]})
    final_message = response["messages"][-1].content
    sources = _extract_sources(response["messages"])

    return {"results": [{"agent": "market_sizing", "findings": final_message, "sources": sources}]}


# ──────────────────────────────────────────────
#  Agent 3: Community Sentiment
# ──────────────────────────────────────────────
def sentiment_agent(state: AgentState) -> dict:
    idea = state["idea"]
    print(f"[Agent: Sentiment] Starting research on idea: {idea[:30]}...")

    llm = get_llm()
    agent = create_react_agent(llm, tools=[hn_search])

    prompt = f"""You are a community manager and developer advocate. Analyze the sentiment around this startup idea: '{idea}'
    Use the hn_search tool to find past discussions, Show HN posts, or similar concepts on HackerNews.
    Provide a concise summary (max 3-4 sentences) of whether the tech community is generally positive, skeptical, or ignores this problem."""

    response = agent.invoke({"messages": [HumanMessage(content=prompt)]})
    final_message = response["messages"][-1].content
    sources = _extract_sources(response["messages"])

    return {"results": [{"agent": "community_sentiment", "findings": final_message, "sources": sources}]}


# ──────────────────────────────────────────────
#  Agent 4: Open-Source Risk Detection
# ──────────────────────────────────────────────
def os_risk_agent(state: AgentState) -> dict:
    idea = state["idea"]
    print(f"[Agent: OS Risk] Starting research on idea: {idea[:30]}...")

    llm = get_llm()
    agent = create_react_agent(llm, tools=[github_search])

    prompt = f"""You are a technical due diligence expert. Find open-source alternatives to this startup idea: '{idea}'
    Use the github_search tool to find repositories that solve the same problem.
    Provide a concise summary (max 3-4 sentences) naming the top repos (if any) and whether they are a major threat to a paid SaaS product."""

    response = agent.invoke({"messages": [HumanMessage(content=prompt)]})
    final_message = response["messages"][-1].content
    sources = _extract_sources(response["messages"])

    return {"results": [{"agent": "os_risk", "findings": final_message, "sources": sources}]}
