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
):
    if edge_case == "no_news":
        search_query = f"{company_name} job postings products services 2025"
    elif edge_case == "job_change":
        search_query = f"{prospect_name} new role {company_name} previous company 2024 2025"
    elif edge_case == "bad_news":
        search_query = f"{company_name} challenges strategy response 2024 2025"
    elif edge_case == "competitor":
        search_query = f"{company_name} tech stack tools software platforms used"
    else:
        search_query = f"{prospect_name} {company_name} news announcements 2025"

    search_results = tavily_client.search(
        query=search_query,
        max_results=5,
        search_depth="advanced"
    )

    web_context = ""
    sources = []
    for r in search_results.get("results", []):
        url = r.get("url", "")
        content = r.get("content", "")
        web_context += f"SOURCE: {url}\nCONTENT: {content}\n\n"
        if url:
            sources.append(url)

    if edge_case == "bad_news":
        instruction = "Company facing challenges. Focus on how they are responding positively. Be factual."
    elif edge_case == "no_news":
        instruction = "Limited news. Focus on job postings and product positioning. Use only provided data."
    elif edge_case == "job_change":
        instruction = "Prospect recently changed roles. Focus on when they joined, previous role, what they are building. Use only provided data."
    elif edge_case == "competitor":
        instruction = "Company uses competitor products. Focus on their tech stack and gaps. Use only provided data."
    else:
        instruction = "Find most compelling recent facts. Focus on news, launches, funding, prospect statements. Use only provided data."

    prompt = f"""You are a B2B sales researcher.

Based ONLY on the following real web search results, research {prospect_name} at {company_name}.

{instruction}

WEB SEARCH RESULTS:
{web_context}

Provide a concise research summary with:
- 3-4 specific factual findings
- Dates where available
- No hallucination — only use what is in the search results"""

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

    return response.choices[0].message.content, sources
