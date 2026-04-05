import os
import requests
from langchain_core.tools import tool
from tavily import TavilyClient

@tool
def web_search(query: str) -> str:
    """
    Search the web for information using Tavily API.
    Great for finding competitors, market sizing, and general industry trends.
    """
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return "Error: TAVILY_API_KEY not set in environment."
    
    try:
        client = TavilyClient(api_key=api_key)
        # We perform a basic search and ask for answer and raw content
        response = client.search(query=query, search_depth="basic", max_results=3)
        
        # Format the response back to a string so the LLM can read it
        results_str = []
        for result in response.get("results", []):
            results_str.append(f"Title: {result.get('title')}\nURL: {result.get('url')}\nContent: {result.get('content')}\n")
            
        return "\n---\n".join(results_str)
    except Exception as e:
        return f"Error during web search: {e}"

@tool
def hn_search(query: str) -> str:
    """
    Search HackerNews to gauge community sentiment, find past discussions, or see similar product launches.
    """
    url = f"http://hn.algolia.com/api/v1/search?query={query}&tags=story"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        results_str = []
        for item in data.get("hits", [])[:5]: # Get top 5 discussions
            results_str.append(f"Title: {item.get('title')}\nURL: {item.get('url')}\nPoints: {item.get('points')}\nComments: {item.get('num_comments')}\n")
            
        return "\n---\n".join(results_str) if results_str else "No HackerNews discussions found."
    except Exception as e:
        return f"Error during HackerNews search: {e}"

@tool
def github_search(query: str) -> str:
    """
    Search GitHub repositories to identify open-source alternatives or technical risks.
    """
    # Using the GitHub API to search for repositories
    url = f"https://api.github.com/search/repositories?q={query}&sort=stars&order=desc"
    
    headers = {"Accept": "application/vnd.github.v3+json"}
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"token {token}"
        
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        results_str = []
        for item in data.get("items", [])[:3]: # Get top 3 repos
            results_str.append(f"Repo: {item.get('full_name')}\nDescription: {item.get('description')}\nStars: {item.get('stargazers_count')}\nURL: {item.get('html_url')}\n")
            
        return "\n---\n".join(results_str) if results_str else "No open-source alternatives found on GitHub."
    except Exception as e:
        return f"Error during GitHub search: {e}"
