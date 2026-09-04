import pandas as pd
import random

# 1. Clean Internal Ledger
ledger_data = [
    {"transaction_id": f"TXN{i:04d}", "amount": round(random.uniform(500, 5000), 2), "status": "pending"}
    for i in range(1, 21)
]
pd.DataFrame(ledger_data).to_csv("internal_ledger.csv", index=False)

# 2. Messy Bank Dump
bank_data = []
for i, row in enumerate(ledger_data):
    if i % 5 == 0: continue # Simulate failed/missing bank transfers
    
    # Simulate occasional payment gateway fees deducting from the total
    amount = row["amount"] - random.choice([0, 0, 5.0]) 
    
    bank_data.append({
        "bank_narration": f"UPI/REF/TXN{row['transaction_id'][3:]}/RAZORPAY/PAYMENT",
        "amount_credited": amount
    })
    
pd.DataFrame(bank_data).to_csv("bank_statement.csv", index=False)
print("Mock CSVs generated successfully.")