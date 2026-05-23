from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

async def draft_email(
    prospect_name: str,
    company_name: str,
    hook: str,
    research: str
) -> str:

    first_name = prospect_name.split()[0]

    prompt = f"""Write a cold outreach email for:
Prospect: {prospect_name}
Company: {company_name}

Hook identified:
{hook}

Research context:
{research}

Rules:
- Subject line must be specific, not generic
- Opening line must reference the hook directly
- Max 4 sentences in body
- One clear CTA at the end
- Do NOT use "synergy", "leverage", 
  "hope this finds you well"
- Sound like a human wrote it
- Do NOT mention our company name —
  use "our platform" instead

Return in this exact format:

SUBJECT: [subject line]

Hi {first_name},

[Email body — 4 sentences max]

[CTA sentence]

Best,
[SDR Name]"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": """You are an expert B2B copywriter 
                who writes personalized cold emails that get replies.
                
                STRICT RULES:
                - Never mention negative news, controversies, 
                legal issues, safety incidents, or scandals
                - Never mention layoffs, losses, or problems
                - Focus ONLY on positive growth signals
                - Emails must be concise — max 4 sentences in body
                - CTA should vary — not always "schedule a call"
                - Sound human, not corporate
                - Never use: synergy, leverage, 
                hope this finds you well, excited to connect
                
                - STRICTLY count — body must be exactly 4 sentences, no more
                - Never use "we're excited", "we're thrilled"
                - Never assume prospect is new to their role unless 
                research explicitly confirms a recent job change
                
                - Never write "Our technology has already helped 
                other companies" or similar generic claims
                - Every sentence must be specific to this prospect"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7,
        max_tokens=400
    )

    return response.choices[0].message.content