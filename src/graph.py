from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from pydantic import BaseModel, Field
from src.state import AgentState
from src.agents import competitor_agent, market_sizing_agent, sentiment_agent, os_risk_agent, get_llm

# --- Structured Output Schema ---
# We use Pydantic to tell the LLM exactly what JSON structure we want back.
class FinalReport(BaseModel):
    score: int = Field(description="A confidence score from 0 to 100 based on the viability of the startup idea.")
    verdict: str = Field(description="A categorical verdict: 'Go', 'Caution', or 'No-Go'.")
    summary: str = Field(description="A brief 2-3 sentence summary explaining the final verdict and score.")

# --- The Scoring Engine (Node) ---
# This node runs AFTER all 4 parallel agents have finished.
def scoring_node(state: AgentState) -> dict:
    idea = state["idea"]
    results = state["results"]
    
    print(f"\n[Scoring Engine] All 4 agents finished. Analyzing results for: {idea[:30]}...")
    
    # Format the findings from all 4 agents into a readable string for the LLM
    compiled_research = ""
    for result in results:
        compiled_research += f"\n### {result['agent'].replace('_', ' ').title()} ###\n"
        compiled_research += f"{result['findings']}\n"
        
    prompt = f"""You are a harsh but fair Y Combinator partner evaluating a startup idea.
    
    Idea: '{idea}'
    
    Here is the research from your 4 analysts:
    {compiled_research}
    
    Based on this research, provide a final evaluation.
    - Score (0-100): How viable is this? (100 = Guaranteed unicorn, 0 = Terrible idea)
    - Verdict: 'Go', 'Caution', or 'No-Go'
    - Summary: Justify your decision in 2-3 sentences based on the research.
    """
    
    llm = get_llm()
    # We use `.with_structured_output` to force the LLM to return a JSON object matching our Pydantic schema
    structured_llm = llm.with_structured_output(FinalReport)
    
    response = structured_llm.invoke([{"role": "user", "content": prompt}])
    
    # Return the updates to the state. We are updating the 3 final fields.
    return {
        "score": response.score,
        "verdict": response.verdict,
        "summary": response.summary
    }

# --- Construct the Graph ---
def build_graph():
    # 1. Initialize the graph with our state schema
    workflow = StateGraph(AgentState)
    
    # 2. Add all the nodes (functions)
    workflow.add_node("competitor_agent", competitor_agent)
    workflow.add_node("market_sizing_agent", market_sizing_agent)
    workflow.add_node("sentiment_agent", sentiment_agent)
    workflow.add_node("os_risk_agent", os_risk_agent)
    workflow.add_node("scoring_node", scoring_node)
    
    # 3. Define the routing (Edges)
    
    # Fan-out: START branches to all 4 research agents simultaneously
    workflow.add_edge(START, "competitor_agent")
    workflow.add_edge(START, "market_sizing_agent")
    workflow.add_edge(START, "sentiment_agent")
    workflow.add_edge(START, "os_risk_agent")
    
    # Fan-in: All 4 agents must finish and point to the scoring node
    # LangGraph automatically waits for all incoming edges to a node to complete
    workflow.add_edge("competitor_agent", "scoring_node")
    workflow.add_edge("market_sizing_agent", "scoring_node")
    workflow.add_edge("sentiment_agent", "scoring_node")
    workflow.add_edge("os_risk_agent", "scoring_node")
    
    # Finish the graph
    workflow.add_edge("scoring_node", END)
    
    # Compile the graph into an executable format
    return workflow.compile()

# Export the compiled graph
app = build_graph()
