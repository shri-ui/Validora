from typing import TypedDict, Annotated, List, Any
import operator

# The `AgentState` defines the data structure that is passed between nodes in our LangGraph.
# Every node in the graph will receive this state, and can return updates to it.
class AgentState(TypedDict):
    # The original startup idea provided by the user.
    idea: str
    
    # We use `Annotated` with `operator.add` to create a "reducer".
    # Since our 4 research agents will run in PARALLEL, they will all try to update the `results` key at the same time.
    # Without `operator.add`, the last agent to finish would overwrite the others. 
    # With `operator.add`, LangGraph knows to *append* their results into a single list safely.
    results: Annotated[List[dict[str, Any]], operator.add]
    
    # The final evaluation score from 0-100
    score: int
    
    # A categorical verdict: "Go", "Caution", or "No-Go"
    verdict: str
    
    # A brief textual summary of the final report
    summary: str
