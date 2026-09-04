# Zero-Hallucination Financial Reconciliation Engine
**Track: AI Finance Controller | Razorpay AI Buildathon 2026**

## Core Philosophy: "Accuracy Over Everything"
Financial ledgers do not tolerate hallucinations. Large Language Models (LLMs) are notorious for arithmetic drift when asked to perform mathematical operations or compare decimals directly. 

This engine decouples **unstructured data parsing** from **deterministic financial reconciliation**:
1. **AI Parsing Layer:** Uses LPUs via Groq (`openai/gpt-oss-20b`) with temperature `0` strictly for entity extraction from unstructured bank narrations (e.g., standardizing `UPI/REF/TXN0002/RAZORPAY` into clean JSON schema `{ "reference_id": "TXN0002" }`).
2. **Deterministic Settlement Engine:** Matches records via vectorized Pandas joins and validates exact decimal parity.
3. **Automated Exception Queue:** Flags missing transactions, un-settled balances, and gateway fee deductions into an auditable review pipeline.

## System Invariants
* **Zero Math in LLM:** The AI model is physically prohibited from calculating sums or validating balance equality.
* **Deterministic Matching:** Transactions must match primary key references and exact floating amounts; otherwise, they are routed to the exception ledger.

## Architecture & Tech Stack
* **AI Extraction:** Groq LPUs (`openai/gpt-oss-20b`), JSON mode, temperature `0`
* **Backend:** FastAPI, Pandas, Pydantic
* **Frontend:** React, Vite
* **Input Formats:** Internal Ledger CSV & Unstructured Bank Settlement Statement CSV

## How to Run Locally
1. Clone repo: `git clone <repo-url>`
2. Backend:
   ```bash
   cd backend && python3 -m venv venv && source venv/bin/activate
   pip install fastapi uvicorn pandas pydantic openai python-multipart
   export GROQ_API_KEY="your-key"
   uvicorn main:app --reload
