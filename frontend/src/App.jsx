// import React, { useState, useMemo } from 'react'
// import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
// import { Search, Download, AlertCircle, CheckCircle, Activity, FileSpreadsheet, Sun, Moon, Database, LayoutDashboard } from 'lucide-react'

// export default function App() {
//   const [theme, setTheme] = useState('dark')
//   const [mainView, setMainView] = useState('ingestion') // 'ingestion' | 'results'
  
//   const [ledger, setLedger] = useState(null)
//   const [bank, setBank] = useState(null)
//   const [results, setResults] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [activeTab, setActiveTab] = useState('ALL')
//   const [searchTerm, setSearchTerm] = useState('')

//   const handleUpload = async () => {
//     if (!ledger || !bank) return
//     setLoading(true)
//     try {
//       const formData = new FormData()
//       formData.append('ledger', ledger)
//       formData.append('bank', bank)

//       const res = await fetch('http://localhost:8000/reconcile', {
//         method: 'POST',
//         body: formData
//       })

//       if (!res.ok) {
//         const errData = await res.json()
//         alert("Backend Error: " + JSON.stringify(errData))
//         return
//       }
      
//       const data = await res.json()
//       setResults(data)
//       setMainView('results') // Auto-switch to results tab on success
      
//     } catch (err) {
//       console.error(err)
//       alert("Network Error: Could not connect to FastAPI server at http://localhost:8000")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const exportExceptionsCSV = () => {
//     if (!results || !results.exceptions.length) return
//     const headers = ["Transaction ID", "Type", "Severity", "Reason", "Expected Amount (INR)", "Settled Amount (INR)", "Variance (INR)", "Action"]
//     const rows = results.exceptions.map(e => [
//       e.id, e.type, e.severity, `"${e.reason}"`, e.expected_amount, e.settled_amount, e.variance, `"${e.suggested_action}"`
//     ])
//     const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
//     const encodedUri = encodeURI(csvContent)
//     const link = document.createElement("a")
//     link.setAttribute("href", encodedUri)
//     link.setAttribute("download", `recon_audit_${new Date().toISOString().slice(0,10)}.csv`)
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   const filteredData = useMemo(() => {
//     if (!results) return { reconciled: [], exceptions: [] }
//     const term = searchTerm.toLowerCase()
//     return {
//       reconciled: results.reconciled.filter(r => r.id.toLowerCase().includes(term)),
//       exceptions: results.exceptions.filter(e => e.id.toLowerCase().includes(term))
//     }
//   }, [results, searchTerm])

//   const chartData = useMemo(() => {
//     if (!results) return []
//     const dropouts = results.exceptions.filter(e => e.type === 'DROPOUT').length
//     const mdr = results.exceptions.filter(e => e.type === 'MDR_FEE').length
//     return [
//       { name: 'Balanced', value: results.summary.reconciled_count, color: '#10b981' },
//       { name: 'MDR Deductions', value: mdr, color: '#3b82f6' },
//       { name: 'Dropouts / Drift', value: dropouts, color: '#ef4444' }
//     ]
//   }, [results])

//   // --- Dynamic Theme Colors ---
//   const t = theme === 'dark' ? {
//     bg: '#090d16', card: '#111827', border: '#1f2937', text: '#ffffff', muted: '#9ca3af',
//     dropzone: '#0f172a', tabBg: '#1f2937', tabActive: '#374151', hover: '#1f2937', input: '#0f172a'
//   } : {
//     bg: '#f1f5f9', card: '#ffffff', border: '#e2e8f0', text: '#0f172a', muted: '#64748b',
//     dropzone: '#f8fafc', tabBg: '#e2e8f0', tabActive: '#ffffff', hover: '#f8fafc', input: '#ffffff'
//   }

//   return (
//     <div style={{ backgroundColor: t.bg, color: t.text, minHeight: '100vh', padding: '2.5rem', fontFamily: 'Inter, system-ui, sans-serif', transition: 'all 0.3s ease' }}>
      
//       {/* Top Header */}
//       <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
//         <div>
//           <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.025em', color: t.text }}>ReconZero Engine</h1>
//           <p style={{ margin: '0.4rem 0 0 0', color: t.muted, fontSize: '0.9rem' }}>Deterministic Financial Reconciliation Pipeline</p>
//         </div>
        
//         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
//           <span style={{ backgroundColor: '#064e3b', color: '#34d399', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
//             <Activity size={14} style={{ marginRight: '6px' }} /> System Ready
//           </span>
//           <button 
//             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//             style={{ background: 'transparent', border: `1px solid ${t.border}`, color: t.text, padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//           >
//             {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
//           </button>
//         </div>
//       </header>

//       {/* Main Navigation Tabs */}
//       <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: `1px solid ${t.border}`, paddingBottom: '1rem' }}>
//         <button 
//           onClick={() => setMainView('ingestion')}
//           style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: mainView === 'ingestion' ? '#2563eb' : 'transparent', color: mainView === 'ingestion' ? '#fff' : t.muted, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
//         >
//           <Database size={18} /> Ingestion Pipeline
//         </button>
//         <button 
//           onClick={() => setMainView('results')}
//           disabled={!results}
//           style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: mainView === 'results' ? '#2563eb' : 'transparent', color: mainView === 'results' ? '#fff' : t.muted, fontWeight: 600, cursor: results ? 'pointer' : 'not-allowed', opacity: results ? 1 : 0.5, transition: 'all 0.2s' }}
//         >
//           <LayoutDashboard size={18} /> Results Dashboard
//         </button>
//       </div>

//       {/* --- VIEW: INGESTION PIPELINE --- */}
//       {mainView === 'ingestion' && (
//         <section style={{ backgroundColor: t.card, borderRadius: '12px', border: `1px solid ${t.border}`, padding: '2rem' }}>
//           <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: t.text }}>Upload Ledger Data</h3>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
//             <div style={{ border: `1px dashed ${t.muted}`, borderRadius: '8px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', backgroundColor: t.dropzone }}>
//               <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}><FileSpreadsheet size={18} /> Internal Ledger (ERP)</span>
//               <input type="file" accept=".csv" onChange={e => setLedger(e.target.files[0])} style={{ color: t.muted, fontSize: '0.85rem' }} />
//               {ledger && <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>✓ {ledger.name} uploaded</span>}
//             </div>

//             <div style={{ border: `1px dashed ${t.muted}`, borderRadius: '8px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', backgroundColor: t.dropzone }}>
//               <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}><FileSpreadsheet size={18} /> Bank Statement Dump</span>
//               <input type="file" accept=".csv" onChange={e => setBank(e.target.files[0])} style={{ color: t.muted, fontSize: '0.85rem' }} />
//               {bank && <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>✓ {bank.name} uploaded</span>}
//             </div>

//           </div>
          
//           <button 
//             onClick={handleUpload} 
//             disabled={!ledger || !bank || loading}
//             style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: (!ledger || !bank || loading) ? 'not-allowed' : 'pointer', opacity: (!ledger || !bank || loading) ? 0.6 : 1, transition: 'background 0.2s' }}
//           >
//             {loading ? 'Executing AI Extraction & Audit...' : 'Run Reconciliation Engine'}
//           </button>
//         </section>
//       )}

//       {/* --- VIEW: RESULTS DASHBOARD --- */}
//       {mainView === 'results' && results && (
//         <div style={{ animation: 'fadeIn 0.5s ease' }}>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '2rem' }}>
            
//             {/* KPI Column */}
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
//               <div style={{ backgroundColor: t.card, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
//                 <span style={{ fontSize: '0.8rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Reconciliation Rate</span>
//                 <span style={{ fontSize: '2.2rem', fontWeight: 700, margin: '0.2rem 0', color: '#10b981' }}>{results.summary.reconciliation_rate}%</span>
//                 <span style={{ fontSize: '0.75rem', color: t.muted }}>{results.summary.reconciled_count} balanced records</span>
//               </div>
//               <div style={{ backgroundColor: t.card, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
//                 <span style={{ fontSize: '0.8rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Actionable Slippage</span>
//                 <span style={{ fontSize: '2.2rem', fontWeight: 700, margin: '0.2rem 0', color: '#ef4444' }}>₹{results.summary.total_slippage.toLocaleString()}</span>
//                 <span style={{ fontSize: '0.75rem', color: t.muted }}>{results.summary.exceptions_count} items require review</span>
//               </div>
//             </div>

//             {/* Chart Column */}
//             <div style={{ backgroundColor: t.card, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
//               <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ledger Health Overview</h3>
//               <div style={{ height: '180px', width: '100%' }}>
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie data={chartData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
//                       {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
//                     </Pie>
//                     <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>

//           {/* Table Section */}
//           <section style={{ backgroundColor: t.card, borderRadius: '12px', border: `1px solid ${t.border}`, padding: '1.75rem' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              
//               <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: t.tabBg, padding: '4px', borderRadius: '8px' }}>
//                 <button onClick={() => setActiveTab('ALL')} style={{ backgroundColor: activeTab === 'ALL' ? t.tabActive : 'transparent', border: 'none', color: activeTab === 'ALL' ? t.text : t.muted, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === 'ALL' ? 600 : 400 }}>All</button>
//                 <button onClick={() => setActiveTab('RECONCILED')} style={{ backgroundColor: activeTab === 'RECONCILED' ? t.tabActive : 'transparent', border: 'none', color: activeTab === 'RECONCILED' ? t.text : t.muted, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === 'RECONCILED' ? 600 : 400 }}>Reconciled</button>
//                 <button onClick={() => setActiveTab('EXCEPTIONS')} style={{ backgroundColor: activeTab === 'EXCEPTIONS' ? t.tabActive : 'transparent', border: 'none', color: activeTab === 'EXCEPTIONS' ? t.text : t.muted, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === 'EXCEPTIONS' ? 600 : 400 }}>Exceptions</button>
//               </div>
              
//               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
//                 <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
//                   <Search size={16} color={t.muted} style={{ position: 'absolute', left: '10px' }} />
//                   <input type="text" placeholder="Search TXN ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ backgroundColor: t.input, border: `1px solid ${t.border}`, color: t.text, padding: '8px 12px 8px 32px', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', width: '220px' }} />
//                 </div>
//                 {results.exceptions.length > 0 && (
//                   <button onClick={exportExceptionsCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'transparent', border: `1px solid ${t.border}`, color: t.text, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
//                     <Download size={16} /> Export Audit CSV
//                   </button>
//                 )}
//               </div>
//             </div>

//             <div style={{ overflowX: 'auto' }}>
//               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
//                 <thead>
//                   <tr style={{ borderBottom: `1px solid ${t.border}` }}>
//                     <th style={{ padding: '12px 16px', color: t.muted, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>TXN ID</th>
//                     <th style={{ padding: '12px 16px', color: t.muted, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Expected (₹)</th>
//                     <th style={{ padding: '12px 16px', color: t.muted, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Settled (₹)</th>
//                     <th style={{ padding: '12px 16px', color: t.muted, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Variance (₹)</th>
//                     <th style={{ padding: '12px 16px', color: t.muted, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
//                     <th style={{ padding: '12px 16px', color: t.muted, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Guidance</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {(activeTab === 'ALL' || activeTab === 'RECONCILED') && filteredData.reconciled.map(r => (
//                     <tr key={r.id} style={{ borderBottom: `1px solid ${t.border}` }}>
//                       <td style={{ padding: '14px 16px', color: t.text, fontWeight: 600, fontFamily: 'monospace' }}>{r.id}</td>
//                       <td style={{ padding: '14px 16px', color: t.text }}>{r.amount.toFixed(2)}</td>
//                       <td style={{ padding: '14px 16px', color: t.text }}>{r.amount.toFixed(2)}</td>
//                       <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 600 }}>0.00</td>
//                       <td style={{ padding: '14px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}><CheckCircle size={12} style={{marginRight: '4px'}}/> Balanced</span></td>
//                       <td style={{ padding: '14px 16px', color: t.muted, fontSize: '0.8rem' }}>Closed & Settled</td>
//                     </tr>
//                   ))}
//                   {(activeTab === 'ALL' || activeTab === 'EXCEPTIONS') && filteredData.exceptions.map(e => (
//                     <tr key={e.id} style={{ borderBottom: `1px solid ${t.border}`, backgroundColor: e.type === 'MDR_FEE' ? 'transparent' : 'rgba(239, 68, 68, 0.03)' }}>
//                       <td style={{ padding: '14px 16px', color: t.text, fontWeight: 600, fontFamily: 'monospace' }}>{e.id}</td>
//                       <td style={{ padding: '14px 16px', color: t.text }}>{e.expected_amount.toFixed(2)}</td>
//                       <td style={{ padding: '14px 16px', color: t.text }}>{e.settled_amount.toFixed(2)}</td>
//                       <td style={{ padding: '14px 16px', color: '#ef4444', fontWeight: 'bold' }}>-{e.variance.toFixed(2)}</td>
//                       <td style={{ padding: '14px 16px' }}>
//                         <span style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: e.type === 'MDR_FEE' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: e.type === 'MDR_FEE' ? '#3b82f6' : '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
//                           <AlertCircle size={12} style={{marginRight: '4px'}}/> {e.type === 'MDR_FEE' ? 'MDR Fee' : 'Discrepancy'}
//                         </span>
//                       </td>
//                       <td style={{ padding: '14px 16px', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 500 }}>{e.suggested_action}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </section>
//         </div>
//       )}
//     </div>
//   )
// }



import React, { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { 
  Search, Download, AlertCircle, CheckCircle, Activity, 
  FileSpreadsheet, Sun, Moon, Database, LayoutDashboard, 
  Zap, ArrowDown, ArrowUp, Info 
} from 'lucide-react'

export default function App() {
  const [theme, setTheme] = useState('dark')
  const [mainView, setMainView] = useState('ingestion')
  
  const [ledger, setLedger] = useState(null)
  const [bank, setBank] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const [activeTab, setActiveTab] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('desc') // 'desc' | 'asc' | 'none'
  
  const [isDraggingLedger, setIsDraggingLedger] = useState(false)
  const [isDraggingBank, setIsDraggingBank] = useState(false)

  // --- UPGRADE A: One-Click Demo Mode ---
  const loadDemoData = async () => {
    try {
      const [ledgerRes, bankRes] = await Promise.all([
        fetch('/mock_data/internal_ledger.csv'),
        fetch('/mock_data/bank_statement.csv')
      ])
      if (!ledgerRes.ok || !bankRes.ok) throw new Error("Files not found")
      
      const ledgerBlob = await ledgerRes.blob()
      const bankBlob = await bankRes.blob()
      
      setLedger(new File([ledgerBlob], 'internal_ledger.csv', { type: 'text/csv' }))
      setBank(new File([bankBlob], 'bank_statement.csv', { type: 'text/csv' }))
    } catch (err) {
      alert("Could not load demo files. Did you copy mock_data to frontend/public/?")
    }
  }

  const handleUpload = async () => {
    if (!ledger || !bank) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('ledger', ledger)
      formData.append('bank', bank)

      const res = await fetch('http://localhost:8000/reconcile', { method: 'POST', body: formData })
      if (!res.ok) {
        const errData = await res.json()
        alert("Backend Error: " + JSON.stringify(errData))
        return
      }
      setResults(await res.json())
      setMainView('results')
    } catch (err) {
      alert("Network Error: Could not connect to FastAPI server at http://localhost:8000")
    } finally {
      setLoading(false)
    }
  }

  const exportExceptionsCSV = () => {
    if (!results || !results.exceptions.length) return
    const headers = ["Transaction ID", "Type", "Severity", "Reason", "Expected Amount (INR)", "Settled Amount (INR)", "Variance (INR)", "Action"]
    const rows = results.exceptions.map(e => [
      e.id, e.type, e.severity, `"${e.reason}"`, e.expected_amount, e.settled_amount, e.variance, `"${e.suggested_action}"`
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `recon_audit_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // --- UPGRADE C: Variance Sorting ---
  const filteredData = useMemo(() => {
    if (!results) return { reconciled: [], exceptions: [] }
    const term = searchTerm.toLowerCase()
    
    let filteredExceptions = results.exceptions.filter(e => e.id.toLowerCase().includes(term))
    
    if (sortOrder === 'desc') {
      filteredExceptions.sort((a, b) => b.variance - a.variance)
    } else if (sortOrder === 'asc') {
      filteredExceptions.sort((a, b) => a.variance - b.variance)
    }

    return {
      reconciled: results.reconciled.filter(r => r.id.toLowerCase().includes(term)),
      exceptions: filteredExceptions
    }
  }, [results, searchTerm, sortOrder])

  const chartData = useMemo(() => {
    if (!results) return []
    const dropouts = results.exceptions.filter(e => e.type === 'DROPOUT').length
    const mdr = results.exceptions.filter(e => e.type === 'MDR_FEE').length
    return [
      { name: 'Balanced', value: results.summary.reconciled_count, color: '#10b981' },
      { name: 'MDR Deductions', value: mdr, color: '#3b82f6' },
      { name: 'Dropouts / Drift', value: dropouts, color: '#ef4444' }
    ]
  }, [results])

  const t = theme === 'dark' ? {
    bg: '#090d16', card: '#111827', border: '#1f2937', text: '#ffffff', muted: '#9ca3af',
    dropzone: '#0f172a', tabBg: '#1f2937', tabActive: '#374151', hover: '#1f2937', input: '#0f172a'
  } : {
    bg: '#f1f5f9', card: '#ffffff', border: '#e2e8f0', text: '#0f172a', muted: '#64748b',
    dropzone: '#f8fafc', tabBg: '#e2e8f0', tabActive: '#ffffff', hover: '#f8fafc', input: '#ffffff'
  }

  // --- UPGRADE B: Drag and Drop Handlers ---
  const handleDrop = (e, setter, setDragging) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setter(e.dataTransfer.files[0])
  }

  return (
    <div style={{ backgroundColor: t.bg, color: t.text, minHeight: '100vh', padding: '2.5rem', fontFamily: 'Inter, system-ui, sans-serif', transition: 'all 0.3s ease' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.025em', color: t.text }}>ReconZero Engine</h1>
          <p style={{ margin: '0.4rem 0 0 0', color: t.muted, fontSize: '0.9rem' }}>Deterministic Financial Reconciliation Pipeline</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ backgroundColor: '#064e3b', color: '#34d399', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <Activity size={14} style={{ marginRight: '6px' }} /> System Ready
          </span>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ background: 'transparent', border: `1px solid ${t.border}`, color: t.text, padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: `1px solid ${t.border}`, paddingBottom: '1rem' }}>
        <button 
          onClick={() => setMainView('ingestion')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: mainView === 'ingestion' ? '#2563eb' : 'transparent', color: mainView === 'ingestion' ? '#fff' : t.muted, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <Database size={18} /> Ingestion Pipeline
        </button>
        <button 
          onClick={() => setMainView('results')}
          disabled={!results}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: mainView === 'results' ? '#2563eb' : 'transparent', color: mainView === 'results' ? '#fff' : t.muted, fontWeight: 600, cursor: results ? 'pointer' : 'not-allowed', opacity: results ? 1 : 0.5, transition: 'all 0.2s' }}
        >
          <LayoutDashboard size={18} /> Results Dashboard
        </button>
      </div>

      {mainView === 'ingestion' && (
        <section style={{ backgroundColor: t.card, borderRadius: '12px', border: `1px solid ${t.border}`, padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: t.text }}>Upload Ledger Data</h3>
            <button onClick={loadDemoData} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              <Zap size={14} /> Load Demo Data
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Ledger Dropzone */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDraggingLedger(true) }}
              onDragLeave={() => setIsDraggingLedger(false)}
              onDrop={(e) => handleDrop(e, setLedger, setIsDraggingLedger)}
              style={{ border: `2px dashed ${isDraggingLedger ? '#3b82f6' : t.muted}`, borderRadius: '8px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', backgroundColor: isDraggingLedger ? 'rgba(59,130,246,0.05)' : t.dropzone, transition: 'all 0.2s' }}
            >
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}><FileSpreadsheet size={20} /> Internal Ledger (ERP)</span>
              <span style={{ fontSize: '0.8rem', color: t.muted }}>Drag & drop CSV here, or click to browse</span>
              <input type="file" accept=".csv" onChange={e => setLedger(e.target.files[0])} style={{ color: t.muted, fontSize: '0.85rem', marginTop: '0.5rem' }} />
              {ledger && <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, marginTop: '0.5rem' }}>✓ {ledger.name} ready</span>}
            </div>

            {/* Bank Dropzone */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDraggingBank(true) }}
              onDragLeave={() => setIsDraggingBank(false)}
              onDrop={(e) => handleDrop(e, setBank, setIsDraggingBank)}
              style={{ border: `2px dashed ${isDraggingBank ? '#3b82f6' : t.muted}`, borderRadius: '8px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', backgroundColor: isDraggingBank ? 'rgba(59,130,246,0.05)' : t.dropzone, transition: 'all 0.2s' }}
            >
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}><FileSpreadsheet size={20} /> Bank Statement Dump</span>
              <span style={{ fontSize: '0.8rem', color: t.muted }}>Drag & drop CSV here, or click to browse</span>
              <input type="file" accept=".csv" onChange={e => setBank(e.target.files[0])} style={{ color: t.muted, fontSize: '0.85rem', marginTop: '0.5rem' }} />
              {bank && <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, marginTop: '0.5rem' }}>✓ {bank.name} ready</span>}
            </div>
          </div>
          
          <button 
            onClick={handleUpload} 
            disabled={!ledger || !bank || loading}
            style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: (!ledger || !bank || loading) ? 'not-allowed' : 'pointer', opacity: (!ledger || !bank || loading) ? 0.6 : 1, transition: 'background 0.2s' }}
          >
            {loading ? 'Executing Async Processing...' : 'Run Reconciliation Engine'}
          </button>
        </section>
      )}

      {mainView === 'results' && results && (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ backgroundColor: t.card, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Reconciliation Rate</span>
                <span style={{ fontSize: '2.2rem', fontWeight: 700, margin: '0.2rem 0', color: '#10b981' }}>{results.summary.reconciliation_rate}%</span>
                <span style={{ fontSize: '0.75rem', color: t.muted }}>{results.summary.reconciled_count} balanced records</span>
              </div>
              <div style={{ backgroundColor: t.card, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Actionable Slippage</span>
                <span style={{ fontSize: '2.2rem', fontWeight: 700, margin: '0.2rem 0', color: '#ef4444' }}>₹{results.summary.total_slippage.toLocaleString()}</span>
                <span style={{ fontSize: '0.75rem', color: t.muted }}>{results.summary.exceptions_count} items require review</span>
              </div>
            </div>

            <div style={{ backgroundColor: t.card, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ledger Health Overview</h3>
              <div style={{ height: '180px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <section style={{ backgroundColor: t.card, borderRadius: '12px', border: `1px solid ${t.border}`, padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: t.tabBg, padding: '4px', borderRadius: '8px' }}>
                <button onClick={() => setActiveTab('ALL')} style={{ backgroundColor: activeTab === 'ALL' ? t.tabActive : 'transparent', border: 'none', color: activeTab === 'ALL' ? t.text : t.muted, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === 'ALL' ? 600 : 400 }}>All</button>
                <button onClick={() => setActiveTab('RECONCILED')} style={{ backgroundColor: activeTab === 'RECONCILED' ? t.tabActive : 'transparent', border: 'none', color: activeTab === 'RECONCILED' ? t.text : t.muted, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === 'RECONCILED' ? 600 : 400 }}>Reconciled</button>
                <button onClick={() => setActiveTab('EXCEPTIONS')} style={{ backgroundColor: activeTab === 'EXCEPTIONS' ? t.tabActive : 'transparent', border: 'none', color: activeTab === 'EXCEPTIONS' ? t.text : t.muted, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === 'EXCEPTIONS' ? 600 : 400 }}>Exceptions</button>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={16} color={t.muted} style={{ position: 'absolute', left: '10px' }} />
                  <input type="text" placeholder="Search TXN ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ backgroundColor: t.input, border: `1px solid ${t.border}`, color: t.text, padding: '8px 12px 8px 32px', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', width: '220px' }} />
                </div>
                {results.exceptions.length > 0 && (
                  <button onClick={exportExceptionsCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'transparent', border: `1px solid ${t.border}`, color: t.text, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                    <Download size={16} /> Export Audit CSV
                  </button>
                )}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                    <th style={{ padding: '12px 16px', color: t.muted, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>TXN ID</th>
                    <th style={{ padding: '12px 16px', color: t.muted, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Expected (₹)</th>
                    <th style={{ padding: '12px 16px', color: t.muted, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Settled (₹)</th>
                    {/* UPGRADE C: Interactive Sorting Column */}
                    <th 
                      onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} 
                      style={{ padding: '12px 16px', color: t.muted, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Click to sort by severity"
                    >
                      Variance (₹) {sortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                    </th>
                    <th style={{ padding: '12px 16px', color: t.muted, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', color: t.muted, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Guidance</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'ALL' || activeTab === 'RECONCILED') && filteredData.reconciled.map(r => (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                      <td style={{ padding: '14px 16px', color: t.text, fontWeight: 600, fontFamily: 'monospace' }}>{r.id}</td>
                      <td style={{ padding: '14px 16px', color: t.text }}>{r.amount.toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', color: t.text }}>{r.amount.toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 600 }}>0.00</td>
                      <td style={{ padding: '14px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}><CheckCircle size={12} style={{marginRight: '4px'}}/> Balanced</span></td>
                      <td style={{ padding: '14px 16px', color: t.muted, fontSize: '0.8rem' }}>Closed & Settled</td>
                    </tr>
                  ))}
                  {(activeTab === 'ALL' || activeTab === 'EXCEPTIONS') && filteredData.exceptions.map(e => (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${t.border}`, backgroundColor: e.type === 'MDR_FEE' ? 'transparent' : 'rgba(239, 68, 68, 0.03)' }}>
                      <td style={{ padding: '14px 16px', color: t.text, fontWeight: 600, fontFamily: 'monospace' }}>{e.id}</td>
                      <td style={{ padding: '14px 16px', color: t.text }}>{e.expected_amount.toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', color: t.text }}>{e.settled_amount.toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', color: '#ef4444', fontWeight: 'bold' }}>-{e.variance.toFixed(2)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: e.type === 'MDR_FEE' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: e.type === 'MDR_FEE' ? '#3b82f6' : '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          <AlertCircle size={12} style={{marginRight: '4px'}}/> {e.type === 'MDR_FEE' ? 'MDR Fee' : 'Discrepancy'}
                        </span>
                      </td>
                      {/* UPGRADE D: Interactive Tooltips */}
                      <td style={{ padding: '14px 16px', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 500 }}>
                        <div title={`Reason: ${e.reason}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'help' }}>
                          <Info size={14} color={t.muted} /> {e.suggested_action}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}