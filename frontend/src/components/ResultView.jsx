import React from 'react'

function summarize(v) {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) return `${v.length} items`
  if (typeof v === 'object') return 'Object'
  return String(v)
}

function getColumns(rows) {
  const cols = new Set()
  for (const r of rows.slice(0, 25)) {
    if (r && typeof r === 'object' && !Array.isArray(r)) {
      Object.keys(r).forEach((k) => cols.add(k))
    }
  }
  return Array.from(cols)
}

function Table({ rows }) {
  const cols = getColumns(rows)
  if (cols.length === 0) {
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map((r, idx) => (
          <div key={idx} className="card">
            {summarize(r)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} className="muted" style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              {cols.map((c) => (
                <td key={c} style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>
                  {summarize(r?.[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function KeyValues({ obj }) {
  const keys = Object.keys(obj || {})
  if (keys.length === 0) return <div className="muted">No data</div>

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {keys.map((k) => (
            <tr key={k}>
              <td className="muted" style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', width: '32%' }}>{k}</td>
              <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>{summarize(obj[k])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ResultView({ data }) {
  if (data === null || data === undefined || data === '') return null

  if (Array.isArray(data)) {
    return <Table rows={data} />
  }

  if (typeof data === 'object') {
    return <KeyValues obj={data} />
  }

  return <div className="card">{String(data)}</div>
}
