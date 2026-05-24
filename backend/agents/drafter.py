from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

async def draft_email(
    prospect_name: str,
    company_name: str,
    hook: str,
    research: str
):
    first_name = prospect_name.split()[0]

    prompt = f"""You are an expert B2B copywriter.

Write a cold outreach email for:
Prospect: {prospect_name}
Company: {company_name}

Hook: {hook}
Research: {research}

STRICT RULES:
- EXACTLY 4 sentences in body — count them
- Never use: "synergy", "leverage", "hope this finds you well", "we're excited", "we're thrilled"
- Never say "Our technology has helped other companies" 
- Every sentence must reference this specific prospect or company
- Sound human, not corporate
- Do NOT mention our company name — use "our platform"

Return ONLY valid JSON, no markdown, no extra text:
{{
  "subject": "primary subject line",
  "body": "Hi {first_name},\\n\\n[exactly 4 sentences]\\n\\n[CTA sentence]\\n\\nBest,\\n[SDR Name]",
  "subject_variants": ["variant 2", "variant 3"],
  "score": {{
    "overall": 8,
    "specificity": 8,
    "hook_strength": 9,
    "cta_quality": 7,
    "reasoning": "one line explanation"
  }}
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are an expert B2B copywriter. Return only valid JSON. No markdown. No extra text."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7,
        max_tokens=800
    )

    raw = response.choices[0].message.content.strip()
    
    try:
        # Remove markdown if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        
        parsed = json.loads(raw)
        email_text = f"SUBJECT: {parsed['subject']}\n\n{parsed['body']}"
        score = json.dumps(parsed.get("score", {}))
        variants = parsed.get("subject_variants", [])
        return email_text, score, variants
    except:
        return raw, "{}", []
