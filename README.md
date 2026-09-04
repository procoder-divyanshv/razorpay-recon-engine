<!-- # ReconZero: Zero-Hallucination Financial Reconciliation Engine
### **Track: AI Finance Controller | Razorpay AI Buildathon 2026**

## 📌 Core Philosophy: "Accuracy Over Everything"
Financial ledgers do not tolerate hallucinations. Large Language Models (LLMs) are prone to arithmetic drift when asked to perform mathematical operations or compare decimals directly. 

**ReconZero** decouples **unstructured data parsing** from **deterministic financial reconciliation**:
1. **AI Parsing Layer:** Uses Groq LPUs (`openai/gpt-oss-20b`) with temperature `0` strictly for entity extraction from unstructured bank narrations (e.g., standardizing `UPI/REF/TXN0002/RAZORPAY` into clean JSON schema `{ "reference_id": "TXN0002" }`).
2. **Deterministic Settlement Engine:** Matches records via vectorized Pandas joins and validates exact decimal parity.
3. **Automated Exception Queue:** Distinguishes normal gateway fees (MDR 1.0%–3.0%) from critical transaction dropouts and generates an auditable review ledger.

---

## ⚙️ System Invariants
* **Zero Math in LLM:** The AI model is strictly bounded to JSON entity extraction. It is physically prohibited from calculating sums or evaluating parity.
* **Bounded Concurrency:** Ingestion uses `asyncio.Semaphore(10)` to prevent rate-limit throttling while achieving parallel sub-2-second execution.
* **Categorical Settlement Rules:** Separates anticipated merchant fees (1.0%–3.0%) from unauthorized balance slippage and payment dropouts.

---

## 🛠️ Architecture & Tech Stack
* **AI Extraction:** Groq LPUs (`openai/gpt-oss-20b`), Structured JSON Mode, Temperature `0`
* **Backend:** FastAPI, AsyncOpenAI, Pandas, Pydantic, Python-Multipart
* **Frontend:** React, Vite, Modern Dark Dashboard UI
* **Input Formats:** Internal Ledger CSV & Unstructured Bank Settlement Statement CSV

---

## 📐 System Architecture

```mermaid
flowchart TD
    subgraph Ingestion ["1. Multi-Source Ingestion"]
        A[Internal Ledger CSV]
        B[Messy Bank Settlement CSV]
    end

    subgraph Extraction ["2. AI Parsing Layer (Groq LPUs)"]
        B -->|Async Concurrent Chunks| C[openai/gpt-oss-20b]
        C -->|temp=0, Strict JSON Schema| D[Normalized Reference IDs]
    end

    subgraph Settlement ["3. Deterministic Policy Engine (Pandas)"]
        A --> E{Vectorized Left Join}
        D --> E
        E -->|Variance == 0.00| F[Reconciled Ledger]
        E -->|Variance 1.0% - 3.0%| G[MDR Processing Fee Queue]
        E -->|Missing Ref / Severe Drift| H[Critical Exception Queue]
    end

    subgraph Interface ["4. Audit & Executive Reporting"]
        F --> I[React KPI Dashboard]
        G --> I
        H --> I
        I --> J[Downloadable Audit CSV]
    end
    %% Color Palettes (Compatible with GitHub Dark & Light Mode)
    classDef ingestion fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef ai fill:#312e81,stroke:#6366f1,stroke-width:2px,color:#e0e7ff;
    classDef join fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff;
    classDef success fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5;
    classDef fee fill:#78350f,stroke:#f59e0b,stroke-width:2px,color:#fffbeb;
    classDef danger fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fef2f2;
    classDef ui fill:#0c4a6e,stroke:#0284c7,stroke-width:2px,color:#f0f9ff;

    class A,B ingestion;
    class C,D ai;
    class E join;
    class F success;
    class G fee;
    class H danger;
    class I,J ui;
```

---

## 🚀 How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/procoder-divyanshv/razorpay-recon-engine.git
cd razorpay-recon-engine
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn pandas pydantic openai python-multipart
export GROQ_API_KEY="your-groq-api-key"
uvicorn main:app --reload
```
*The API documentation will run interactively at `http://127.0.0.1:8000/docs`.*

### 3. Frontend Setup
Open a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The interface will run locally at `http://localhost:5173`.*

### 4. Running Mock Data
Generate realistic test files with simulated un-settled transfers and fee slippage:
```bash
python3 mock_data/generate_mock_data.py
```
Upload `mock_data/internal_ledger.csv` and `mock_data/bank_statement.csv` directly into the dashboard to test the pipeline. -->



# ReconZero: Zero-Hallucination Financial Reconciliation Engine

### Track: AI Finance Controller | Razorpay AI Buildathon 2026

## Core Philosophy: "Accuracy Over Everything"

Financial ledgers do not tolerate hallucinations. Large Language Models (LLMs) are prone to arithmetic drift when asked to perform mathematical operations or compare decimal balances directly. **ReconZero** decouples unstructured data parsing from deterministic financial reconciliation.

1. **Hybrid AI Parsing Layer:** Implements a sub-millisecond regex fast-path for standard banking identifiers, automatically falling back to Groq LPUs (`openai/gpt-oss-20b`) in batches of 25 for unstructured narrations. Operates strictly at `temperature: 0` for entity extraction into typed schemas.
2. **Deterministic Settlement Engine:** Matches ledger and bank statements via vectorized Pandas joins to evaluate exact decimal parity without LLM intervention.
3. **Automated Exception & MDR Triage:** Discrepancies are categorized into predictable Payment Gateway fees (MDR 1.0%–3.0%), un-settled transaction dropouts, and unexplained revenue drift for human audit.

## Key Enterprise Features

* **Hybrid Fast-Path Parsing:** Bypasses LLM calls for structured narrations using instant regex evaluation, slashing token consumption and eliminating HTTP latency.
* **Batch Token Optimization:** Chunks irregular narrations into 25-item batches per API request, cutting API calls by up to 96% and preventing `429 Rate Limit Exceeded` throttling.
* **Smart Gateway Fee (MDR) Auditing:** Flags expected 1.5%–2.5% merchant discount rates separately from outright missing funds to eliminate false alarms.
* **Dual-Axis Financial Analytics:** Visualizes transaction volume against variance loss using an interactive dual-axis composed chart (Bar + Line) and composition donut charts.
* **Executive Ops Experience:** Full-screen responsive layout, dynamic Light/Dark mode, tabbed navigation (Ingestion vs. Results), 1-click demo data loading, drag-and-drop CSV ingestion, live search, variance severity sorting, and audit CSV exports.

## System Invariants

* **Zero Math in LLM:** The AI model is strictly bounded to JSON entity extraction. It is physically prohibited from calculating sums or validating parity.
* **Zero-Token Fast-Path:** Standard bank identifiers are resolved locally in Python (0ms, 0 tokens). The LLM is invoked only as an intelligent fallback.
* **Deterministic Matching:** Settlements are resolved strictly through vectorized joins against primary reference keys (`transaction_id`) and floating-point comparisons.
* **Idempotent Audit Queue:** Operations do not overwrite balances. Exceptions are routed to an exportable review queue with operational guidance tags.

## Architecture & Tech Stack

* **AI Extraction:** Groq LPUs (`openai/gpt-oss-20b`), Structured JSON Mode, Temperature `0`
* **Backend:** FastAPI, AsyncOpenAI, Pandas, Pydantic, Python-Multipart
* **Frontend:** React, Vite, Recharts, Lucide React, Full-Screen Fluid CSS
* **Input Formats:** Internal Ledger CSV & Unstructured Bank Settlement Statement CSV

## System Architecture

```mermaid
flowchart TD
    subgraph Ingestion ["1. Multi-Source Ingestion"]
        A[Internal Ledger CSV]
        B[Messy Bank Settlement CSV]
    end

    subgraph HybridExtraction ["2. Hybrid Parsing Pipeline"]
        B --> C{Deterministic Regex Match?}
        C -->|Match Found: 0 Tokens| D[Direct TXN Extraction]
        C -->|Unstructured Fallback| E[Groq LPU: Batch of 25]
        E -->|temp=0, JSON Schema| D
    end

    subgraph SettlementEngine ["3. Deterministic Policy Engine (Pandas)"]
        A --> F{Vectorized Left Join}
        D --> F
        F -->|Variance == 0.00| G[Balanced Ledger]
        F -->|Variance 1.0% - 3.0%| H[MDR Gateway Fee Queue]
        F -->|Missing Record / Drift > 3%| I[Critical Exception Queue]
    end

    subgraph AnalyticsDashboard ["4. Executive BI Dashboard"]
        G --> J[4-Grid KPI Metrics]
        H --> J
        I --> J
        J --> K[Dual-Axis & Donut Charts]
        J --> L[Sortable Table & Audit CSV Export]
    end

    classDef Ingestion fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef ai fill:#312e81,stroke:#6366f1,stroke-width:2px,color:#e0e7ff;
    classDef join fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff;
    classDef success fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5;
    classDef fee fill:#78350f,stroke:#f59e0b,stroke-width:2px,color:#fffbeb;
    classDef danger fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fef2f2;
    classDef ui fill:#0c4a6e,stroke:#0284c7,stroke-width:2px,color:#f0f9ff;

    class A,B Ingestion;
    class C,E ai;
    class D,F join;
    class G success;
    class H fee;
    class I danger;
    class J,K,L ui;
```

## How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/procoder-divyanshv/razorpay-recon-engine.git
cd razorpay-recon-engine
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn pandas pydantic openai python-multipart
export GROQ_API_KEY="your-groq-api-key"
uvicorn main:app --reload
```
The interactive Swagger API documentation will run at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
Open a separate terminal window:
```bash
cd frontend
npm install
npm install recharts lucide-react
npm run dev
```
The dashboard interface will run at `http://localhost:5173`.

### 4. Running Mock Data & One-Click Demo
Generate 100 realistic records with simulated merchant fee slippage, payment dropouts, and varying bank narrations:
```bash
python3 mock_data/generate_mock_data.py
```
1. Open `http://localhost:5173`.
2. Click **Load Demo Data** on the Ingestion Pipeline tab (or drag-and-drop the generated CSVs).
3. Click **Run Reconciliation Engine** to view the live KPIs, dual-axis charts, and exception ledger.
