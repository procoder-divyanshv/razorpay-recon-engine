from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import pandas as pd
from io import BytesIO
import json
import os

app = FastAPI()


@app.get("/")
def read_root():
    return {"status": "Reconciliation Engine is Online"}
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_methods=["*"], 
    allow_headers=["*"]
)

# 1. Connect to Groq using the official OpenAI-compatible endpoint
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

# Use the exact Groq model identifier for GPT OSS 20B
MODEL_ID = "openai/gpt-oss-20b"

def parse_narration_with_ai(narration: str) -> str:
    prompt = f"Extract the transaction reference ID (e.g., TXN0001) from this bank narration: '{narration}'. Return strictly JSON: {{\"reference_id\": \"extracted_id\"}}. If missing, return empty string."

    try:
        response = client.chat.completions.create(
            model=MODEL_ID,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system", 
                    "content": "You are a deterministic financial parser. Only output valid JSON matching the schema."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0,  # 0 ensures deterministic, non-hallucinatory extraction
        )
        data = json.loads(response.choices[0].message.content)
        return data.get("reference_id", "")
    except Exception as e:
        print(f"Error parsing row: {e}")
        return ""

@app.post("/reconcile")
async def reconcile_data(ledger: UploadFile = File(...), bank: UploadFile = File(...)):
    df_ledger = pd.read_csv(BytesIO(await ledger.read()))
    df_bank = pd.read_csv(BytesIO(await bank.read()))

    # Apply the Groq AI extractor to clean the bank statement reference strings
    df_bank['clean_ref'] = df_bank['bank_narration'].apply(parse_narration_with_ai)

    # Deterministic Pandas matching
    merged = pd.merge(df_ledger, df_bank, left_on='transaction_id', right_on='clean_ref', how='left')

    reconciled = []
    exceptions = []

    for _, row in merged.iterrows():
        if pd.isna(row['clean_ref']):
            exceptions.append({
                "id": str(row['transaction_id']), 
                "reason": "Missing in Bank Statement", 
                "expected_amount": float(row['amount'])
            })
        elif float(row['amount']) != float(row['amount_credited']):
            exceptions.append({
                "id": str(row['transaction_id']), 
                "reason": "Amount Discrepancy", 
                "expected_amount": float(row['amount']), 
                "settled_amount": float(row['amount_credited'])
            })
        else:
            reconciled.append({
                "id": str(row['transaction_id']), 
                "amount": float(row['amount']), 
                "status": "Reconciled"
            })

    return {"reconciled": reconciled, "exceptions": exceptions}