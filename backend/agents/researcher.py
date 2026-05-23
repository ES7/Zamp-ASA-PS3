from groq import Groq
from tavily import TavilyClient
from dotenv import load_dotenv
import os

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

async def research_prospect(
    prospect_name: str,
    company_name: str,
    edge_case: str
) -> str:

    # Step 1 — Real web search based on edge case
    if edge_case == "no_news":
        search_query = f"{company_name} job postings products services 2025"
    elif edge_case == "job_change":
        search_query = f"{prospect_name} new role {company_name} previous company 2024 2025"
    elif edge_case == "bad_news":
        search_query = f"{company_name} layoffs controversy challenges 2024 2025"
    elif edge_case == "competitor":
        search_query = f"{company_name} tech stack tools software platforms used"
    else:
        search_query = f"{prospect_name} {company_name} news announcements 2025"

    # Tavily real web search
    search_results = tavily_client.search(
        query=search_query,
        max_results=5,
        search_depth="advanced"
    )

    # Extract results
    web_context = ""
    for r in search_results.get("results", []):
        web_context += f"SOURCE: {r.get('url', '')}\n"
        web_context += f"CONTENT: {r.get('content', '')}\n\n"

    # Step 2 — LLM synthesizes real data
    if edge_case == "bad_news":
        instruction = """Company is going through challenges.
        Focus on: what happened, how they're responding,
        prospect's role in this. Be factual, use only 
        the provided web data."""

    elif edge_case == "no_news":
        instruction = """Limited news available.
        Focus on: job postings that reveal priorities,
        product/service positioning, industry context.
        Use only the provided web data."""

    elif edge_case == "job_change":
        instruction = """Prospect recently changed roles.
        Focus on: when they joined, previous company/role,
        what they're likely trying to build or prove.
        Use only the provided web data."""

    elif edge_case == "competitor":
        instruction = """Company uses competitor products.
        Focus on: their current tech stack, tools they use,
        any gaps or limitations publicly mentioned.
        Use only the provided web data."""

    else:
        instruction = """Find the most compelling recent facts.
        Focus on: specific news, product launches, funding,
        prospect's recent statements or interviews.
        Use only the provided web data."""

    prompt = f"""You are a B2B sales researcher.
    
Based ONLY on the following real web search results,
research {prospect_name} at {company_name}.

{instruction}

WEB SEARCH RESULTS:
{web_context}

Provide a concise research summary with:
- 3-4 specific, factual findings
- Dates where available
- No hallucination — only use what's in the search results
- If something is unclear, say so"""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are an expert B2B sales researcher. Only use the provided web search data. Never hallucinate or make up facts."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
        max_tokens=800
    )

    return response.choices[0].message.content