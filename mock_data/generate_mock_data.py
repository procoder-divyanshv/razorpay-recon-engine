import csv
import random
from pathlib import Path
from datetime import datetime, timedelta

def generate_datasets(num_records=100):
    # Resolve paths relative to the repository root
    base_dir = Path(__file__).resolve().parent.parent
    mock_data_dir = base_dir / "mock_data"
    frontend_mock_dir = base_dir / "frontend" / "public" / "mock_data"

    # Ensure directories exist
    mock_data_dir.mkdir(parents=True, exist_ok=True)
    frontend_mock_dir.mkdir(parents=True, exist_ok=True)

    internal_ledger = []
    bank_statement = []
    
    start_date = datetime(2026, 9, 1)
    customers = [
        "Acme Corp", "Global Tech", "Stark Industries", "Wayne Enterprises", 
        "Daily Planet", "LexCorp", "Cyberdyne", "Umbrella Corp", 
        "Initech", "Soylent Corp", "Massive Dynamic", "Tyrell Corp"
    ]
    
    templates = [
        "UPI/REF/{id}/RAZORPAY/SETTLEMENT",
        "NEFT CR: HDFC {utr} RAZORPAY SETTLEMENT REF {id}",
        "IMPS/{id}/RAZORPAY/FUNDS",
        "RTGS-SETTLEMENT-{id}-RAZORPAY",
        "TRANSFER/{id}/PARTIAL-PAYMENT"
    ]

    for i in range(1, num_records + 1):
        txn_id = f"TXN{i:04d}"
        amount = round(random.uniform(500.0, 50000.0), 2)
        date_str = (start_date + timedelta(days=random.randint(0, 14))).strftime("%Y-%m-%d")
        customer = random.choice(customers)
        
        internal_ledger.append([txn_id, amount, date_str, customer])
        
        fate = random.random()
        
        if fate < 0.05:
            # 5% DROPOUT: Completely missing from bank statement
            continue
            
        settled_amount = amount
        if 0.05 <= fate < 0.25:
            # 20% MDR FEE: Deduct between 1.5% and 2.5%
            fee_pct = random.uniform(0.015, 0.025)
            settled_amount = round(amount * (1 - fee_pct), 2)
        elif 0.25 <= fate < 0.30:
            # 5% SEVERE DISCREPANCY: 5% to 15% drift
            severe_pct = random.uniform(0.05, 0.15)
            settled_amount = round(amount * (1 - severe_pct), 2)
            
        template = random.choice(templates)
        if "{utr}" in template:
            utr_mock = f"{random.randint(100000, 999999)}vxp0rj"
            narration = template.format(utr=utr_mock, id=txn_id)
        else:
            narration = template.format(id=txn_id)
            
        settle_date = (datetime.strptime(date_str, "%Y-%m-%d") + timedelta(days=random.randint(1, 2))).strftime("%Y-%m-%d")
        bank_statement.append([narration, settled_amount, settle_date])

    random.shuffle(bank_statement)

    # Save to both locations so you have direct files and web-served files
    target_locations = [mock_data_dir, frontend_mock_dir]

    for loc in target_locations:
        with open(loc / 'internal_ledger.csv', 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['transaction_id', 'amount', 'date', 'customer_name'])
            writer.writerows(internal_ledger)
            
        with open(loc / 'bank_statement.csv', 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['bank_narration', 'amount_credited', 'settlement_date'])
            writer.writerows(bank_statement)

    print(f"Generated {num_records} internal records and {len(bank_statement)} bank settlement records.")
    print(f"Files saved in:\n 1. {mock_data_dir}\n 2. {frontend_mock_dir}")

if __name__ == "__main__":
    generate_datasets(100)