import { useState } from 'react'

function App() {
  const [ledger, setLedger] = useState(null)
  const [bank, setBank] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    setLoading(true)
    const formData = new FormData()
    formData.append('ledger', ledger)
    formData.append('bank', bank)

    const res = await fetch('http://localhost:8000/reconcile', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    setResults(data)
    setLoading(false)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Finance Controller: Zero-Hallucination Recon Engine</h2>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>1. Internal Ledger (CSV)</label><br/><br/>
          <input type="file" accept=".csv" onChange={e => setLedger(e.target.files[0])} />
        </div>
        <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>2. Bank Statement (CSV)</label><br/><br/>
          <input type="file" accept=".csv" onChange={e => setBank(e.target.files[0])} />
        </div>
      </div>
      
      <button 
        onClick={handleUpload} 
        disabled={!ledger || !bank || loading}
        style={{ padding: '10px 20px', background: loading ? '#ccc' : '#0a58ca', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        {loading ? 'Running AI Parsing & Matching...' : 'Run Engine'}
      </button>

      {results && (
        <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
          <div style={{ flex: 1, background: '#f8fff8', padding: '1rem', border: '1px solid #c3e6cb', borderRadius: '8px' }}>
            <h3 style={{ color: '#155724', marginTop: 0 }}>✅ Reconciled ({results.reconciled.length})</h3>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>{JSON.stringify(results.reconciled, null, 2)}</pre>
          </div>
          <div style={{ flex: 1, background: '#fff8f8', padding: '1rem', border: '1px solid #f5c6cb', borderRadius: '8px' }}>
            <h3 style={{ color: '#721c24', marginTop: 0 }}>⚠️ Exceptions ({results.exceptions.length})</h3>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>{JSON.stringify(results.exceptions, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default App