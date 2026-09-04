import React, { useState } from 'react'

export default function App() {
  const [ledger, setLedger] = useState(null)
  const [bank, setBank] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('ALL') // 'ALL' | 'RECONCILED' | 'EXCEPTIONS'

  const handleUpload = async () => {
    if (!ledger || !bank) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('ledger', ledger)
      formData.append('bank', bank)

      const res = await fetch('http://localhost:8000/reconcile', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const errData = await res.json()
        alert("Backend Error: " + JSON.stringify(errData))
        return
      }

      const data = await res.json()
      setResults(data)
    } catch (err) {
      console.error(err)
      alert("Network Error: Could not connect to FastAPI server at http://localhost:8000")
    } finally {
      setLoading(false)
    }
  }

  const exportExceptionsCSV = () => {
    if (!results || !results.exceptions.length) return
    const headers = ["Transaction ID", "Type", "Severity", "Reason", "Expected Amount (INR)", "Settled Amount (INR)", "Variance (INR)", "Action"]
    const rows = results.exceptions.map(e => [
      e.id,
      e.type,
      e.severity,
      `"${e.reason}"`,
      e.expected_amount,
      e.settled_amount,
      e.variance,
      `"${e.suggested_action}"`
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `reconciliation_exceptions_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>ReconZero Engine</h1>
          <p style={styles.subtitle}>Deterministic Financial Reconciliation Pipeline | AI Finance Controller</p>
        </div>
        <div style={styles.badgeContainer}>
          <span style={styles.liveBadge}>● System Ready</span>
        </div>
      </header>

      {/* Upload Zone */}
      <section style={styles.card}>
        <h3 style={styles.cardHeader}>1. Ingestion Pipeline</h3>
        <div style={styles.uploadGrid}>
          <div style={styles.dropzone}>
            <span style={styles.label}>Internal Ledger (ERP / System DB)</span>
            <input 
              type="file" 
              accept=".csv" 
              onChange={e => setLedger(e.target.files[0])} 
              style={styles.fileInput}
            />
            {ledger && <span style={styles.fileName}>✓ {ledger.name}</span>}
          </div>

          <div style={styles.dropzone}>
            <span style={styles.label}>Bank Statement Dump (Messy Narration)</span>
            <input 
              type="file" 
              accept=".csv" 
              onChange={e => setBank(e.target.files[0])} 
              style={styles.fileInput}
            />
            {bank && <span style={styles.fileName}>✓ {bank.name}</span>}
          </div>
        </div>

        <button 
          onClick={handleUpload} 
          disabled={!ledger || !bank || loading}
          style={{
            ...styles.button,
            opacity: (!ledger || !bank || loading) ? 0.6 : 1,
            cursor: (!ledger || !bank || loading) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Executing Concurrent LPU Extraction & Ledger Audit...' : 'Run Reconciliation Engine'}
        </button>
      </section>

      {/* Results View */}
      {results && (
        <>
          {/* Executive KPI Stats */}
          <section style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Reconciliation Rate</span>
              <span style={{ ...styles.kpiValue, color: '#10b981' }}>{results.summary.reconciliation_rate}%</span>
              <span style={styles.kpiSubtext}>{results.summary.reconciled_count} of {results.summary.total_records} balanced</span>
            </div>

            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Total Ledger Volume</span>
              <span style={styles.kpiValue}>₹{results.summary.total_ledger_volume.toLocaleString()}</span>
              <span style={styles.kpiSubtext}>Gross transaction value</span>
            </div>

            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Settled Amount</span>
              <span style={{ ...styles.kpiValue, color: '#3b82f6' }}>₹{results.summary.reconciled_volume.toLocaleString()}</span>
              <span style={styles.kpiSubtext}>Clean bank credits</span>
            </div>

            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Actionable Slippage</span>
              <span style={{ ...styles.kpiValue, color: '#ef4444' }}>₹{results.summary.total_slippage.toLocaleString()}</span>
              <span style={styles.kpiSubtext}>{results.summary.exceptions_count} items requiring review</span>
            </div>
          </section>

          {/* Ledger Table & Controls */}
          <section style={styles.card}>
            <div style={styles.tableToolbar}>
              <div style={styles.tabContainer}>
                <button 
                  onClick={() => setActiveTab('ALL')} 
                  style={activeTab === 'ALL' ? styles.tabActive : styles.tab}
                >
                  All ({results.summary.total_records})
                </button>
                <button 
                  onClick={() => setActiveTab('RECONCILED')} 
                  style={activeTab === 'RECONCILED' ? styles.tabActive : styles.tab}
                >
                  Reconciled ({results.summary.reconciled_count})
                </button>
                <button 
                  onClick={() => setActiveTab('EXCEPTIONS')} 
                  style={activeTab === 'EXCEPTIONS' ? styles.tabActive : styles.tab}
                >
                  Exceptions ({results.summary.exceptions_count})
                </button>
              </div>

              {results.exceptions.length > 0 && (
                <button onClick={exportExceptionsCSV} style={styles.exportButton}>
                  ↓ Export Audit CSV
                </button>
              )}
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHead}>
                    <th style={styles.th}>TXN ID</th>
                    <th style={styles.th}>Expected (₹)</th>
                    <th style={styles.th}>Settled (₹)</th>
                    <th style={styles.th}>Variance (₹)</th>
                    <th style={styles.th}>Status / Type</th>
                    <th style={styles.th}>Operational Guidance</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Reconciled Rows */}
                  {(activeTab === 'ALL' || activeTab === 'RECONCILED') && results.reconciled.map(r => (
                    <tr key={r.id} style={styles.tr}>
                      <td style={styles.tdBold}>{r.id}</td>
                      <td style={styles.td}>₹{r.amount.toFixed(2)}</td>
                      <td style={styles.td}>₹{r.amount.toFixed(2)}</td>
                      <td style={{ ...styles.td, color: '#10b981' }}>₹0.00</td>
                      <td style={styles.td}><span style={styles.badgeSuccess}>Balanced</span></td>
                      <td style={styles.tdMuted}>Closed & Settled</td>
                    </tr>
                  ))}

                  {/* Exception Rows */}
                  {(activeTab === 'ALL' || activeTab === 'EXCEPTIONS') && results.exceptions.map(e => (
                    <tr key={e.id} style={styles.trException}>
                      <td style={styles.tdBold}>{e.id}</td>
                      <td style={styles.td}>₹{e.expected_amount.toFixed(2)}</td>
                      <td style={styles.td}>₹{e.settled_amount.toFixed(2)}</td>
                      <td style={{ ...styles.td, color: '#ef4444', fontWeight: 'bold' }}>-₹{e.variance.toFixed(2)}</td>
                      <td style={styles.td}>
                        <span style={e.type === 'MDR_FEE' ? styles.badgeFee : styles.badgeCritical}>
                          {e.type === 'MDR_FEE' ? 'MDR Fee' : 'Discrepancy'}
                        </span>
                      </td>
                      <td style={styles.tdAction}>{e.suggested_action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

const styles = {
  container: { backgroundColor: '#090d16', minHeight: '100vh', color: '#f3f4f6', padding: '2.5rem', fontFamily: 'Inter, system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { margin: 0, fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#ffffff' },
  subtitle: { margin: '0.4rem 0 0 0', color: '#9ca3af', fontSize: '0.9rem' },
  badgeContainer: { display: 'flex', gap: '0.5rem' },
  liveBadge: { backgroundColor: '#064e3b', color: '#34d399', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 },
  card: { backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '1.75rem', marginBottom: '2rem' },
  cardHeader: { margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: '#e5e7eb' },
  uploadGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' },
  dropzone: { border: '1px dashed #374151', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#0f172a' },
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#93c5fd' },
  fileInput: { color: '#9ca3af', fontSize: '0.85rem' },
  fileName: { fontSize: '0.8rem', color: '#10b981', fontWeight: 500 },
  button: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', transition: 'background 0.2s' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' },
  kpiCard: { backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column' },
  kpiLabel: { fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' },
  kpiValue: { fontSize: '1.8rem', fontWeight: 700, margin: '0.5rem 0 0.2rem 0', color: '#ffffff' },
  kpiSubtext: { fontSize: '0.75rem', color: '#6b7280' },
  tableToolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  tabContainer: { display: 'flex', gap: '0.5rem', backgroundColor: '#1f2937', padding: '4px', borderRadius: '8px' },
  tab: { backgroundColor: 'transparent', border: 'none', color: '#9ca3af', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  tabActive: { backgroundColor: '#374151', border: 'none', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  exportButton: { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' },
  trHead: { borderBottom: '1px solid #374151' },
  th: { padding: '12px 16px', color: '#9ca3af', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #1f2937' },
  trException: { borderBottom: '1px solid #1f2937', backgroundColor: 'rgba(239, 68, 68, 0.02)' },
  td: { padding: '14px 16px', color: '#d1d5db' },
  tdBold: { padding: '14px 16px', color: '#ffffff', fontWeight: 600, fontFamily: 'monospace' },
  tdMuted: { padding: '14px 16px', color: '#6b7280', fontSize: '0.8rem' },
  tdAction: { padding: '14px 16px', color: '#fbbf24', fontSize: '0.8rem' },
  badgeSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 },
  badgeFee: { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 },
  badgeCritical: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }
}