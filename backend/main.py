import os
import json
import asyncio
import pandas as pd
from io import BytesIO
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI

app = FastAPI(title="Razorpay ReconZero Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Asynchronous Groq Client
client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)
MODEL_ID = "openai/gpt-oss-20b"

async def parse_single_narration(narration: str, semaphore: asyncio.Semaphore) -> str:
    """Parses a single messy bank string asynchronously with bounded concurrency."""
    prompt = (
        f"Extract the transaction reference ID (e.g., TXN0001) from this bank narration: '{narration}'. "
        f"Return strictly a JSON object: {{\"reference_id\": \"extracted_id\"}}. "
        f"If no reference ID is found, return {{\"reference_id\": \"\"}}."
    )
    
    async with semaphore:
        try:
            response = await client.chat.completions.create(
                model=MODEL_ID,
                response_format={"type": "json_object"},
                messages=[
                    {
                        "role": "system",
                        "content": "You are a deterministic financial parser. Only output valid JSON matching the schema.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0,  # Strict zero-hallucination threshold
            )
            data = json.loads(response.choices[0].message.content)
            return data.get("reference_id", "").strip()
        except Exception as e:
            print(f"Extraction error on narration '{narration}': {e}")
            return ""

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "ReconZero Engine v2.0"}

@app.post("/reconcile")
async def reconcile_data(ledger: UploadFile = File(...), bank: UploadFile = File(...)):
    try:
        df_ledger = pd.read_csv(BytesIO(await ledger.read()))
        df_bank = pd.read_csv(BytesIO(await bank.read()))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV files: {str(e)}")

    # 1. Asynchronous Concurrent Parsing (Max 10 parallel requests)
    semaphore = asyncio.Semaphore(10)
    narrations = df_bank['bank_narration'].tolist()
    tasks = [parse_single_narration(n, semaphore) for n in narrations]
    df_bank['clean_ref'] = await asyncio.gather(*tasks)

    # 2. Deterministic Left Join on Reference Keys
    merged = pd.merge(df_ledger, df_bank, left_on='transaction_id', right_on='clean_ref', how='left')

    reconciled = []
    exceptions = []

    # Financial Audit Loop
    for _, row in merged.iterrows():
        tx_id = str(row['transaction_id'])
        expected_amt = round(float(row['amount']), 2)

        # Case 1: Complete Bank Dropout
        if pd.isna(row['clean_ref']) or pd.isna(row['amount_credited']):
            exceptions.append({
                "id": tx_id,
                "type": "DROPOUT",
                "severity": "CRITICAL",
                "reason": "Missing in Bank Settlement",
                "expected_amount": expected_amt,
                "settled_amount": 0.0,
                "variance": expected_amt,
                "suggested_action": "Trigger Payment Gateway Inquiry"
            })
            continue

        settled_amt = round(float(row['amount_credited']), 2)
        variance = round(expected_amt - settled_amt, 2)

        # Case 2: Exact Parity Match
        if abs(variance) < 0.01:
            reconciled.append({
                "id": tx_id,
                "amount": expected_amt,
                "status": "Reconciled",
                "type": "EXACT_MATCH"
            })
            continue

        # Case 3: Gateway MDR / Fee Deductions (1.5% to 2.5% standard fee band)
        variance_pct = round((variance / expected_amt) * 100, 2)
        if 1.0 <= variance_pct <= 3.0:
            exceptions.append({
                "id": tx_id,
                "type": "MDR_FEE",
                "severity": "LOW",
                "reason": f"MDR Processing Fee (~{variance_pct}%)",
                "expected_amount": expected_amt,
                "settled_amount": settled_amt,
                "variance": variance,
                "suggested_action": "Auto-allocate to Gateway Fee Ledger"
            })
        else:
            # Case 4: Unexplained Discrepancy
            exceptions.append({
                "id": tx_id,
                "type": "UNEXPLAINED_VARIANCE",
                "severity": "HIGH",
                "reason": f"Unmatched Discrepancy ({variance_pct}%)",
                "expected_amount": expected_amt,
                "settled_amount": settled_amt,
                "variance": variance,
                "suggested_action": "Hold Settlement for Manual Ops Review"
            })

    # Summary Analytics for Dashboard KPIs
    total_ledger_amt = round(float(df_ledger['amount'].sum()), 2)
    total_reconciled_amt = round(sum(r['amount'] for r in reconciled), 2)
    total_exception_amt = round(sum(e['expected_amount'] for e in exceptions), 2)
    total_records = len(df_ledger)
    recon_rate = round((len(reconciled) / total_records) * 100, 1) if total_records else 0

    return {
        "summary": {
            "total_records": total_records,
            "reconciled_count": len(reconciled),
            "exceptions_count": len(exceptions),
            "reconciliation_rate": recon_rate,
            "total_ledger_volume": total_ledger_amt,
            "reconciled_volume": total_reconciled_amt,
            "exception_volume": total_exception_amt,
            "total_slippage": round(total_ledger_amt - total_reconciled_amt, 2)
        },
        "reconciled": reconciled,
        "exceptions": exceptions
    }