import React from 'react'

const mono = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

const PAGE_HELP = {
  Login: {
    who: 'Start here. Use any sample login below.',
    steps: ['Enter email + password', 'Click “Sign in”', 'Use the top navigation to explore pages']
  },
  Dashboard: {
    who: 'Any role',
    steps: ['Open Dashboard to see overall counts and portfolio value']
  },
  'Debt Search': {
    who: 'Any role',
    steps: ['Paste one of the sample invoice numbers', 'Click Search to view case details']
  },
  'My Debts': {
    who: 'DCA_AGENT (agent1@dca.local / agent2@dca.local)',
    steps: ['Use “Refresh” to load assigned debts', 'Update Stage and save a Message for any invoice']
  },
  Reports: {
    who: 'Any role',
    steps: ['Click any report button (Summary / By status / By stage)', 'Use High value / Overdue inputs to filter and rerun']
  },
  Export: {
    who: 'Any role',
    steps: ['Optionally set filters (status, stage, min/max amount, min overdue days)', 'Click Preview to see first 20 results', 'Download CSV / JSON to export data']
  },
  'CSV Upload': {
    who: 'FEDEX_ADMIN (admin@fedex.local)',
    steps: ['Upload a CSV file with the required columns', 'Reload to see imported cases', 'Select invoices and assign them to an agency ID (AGENCY_ALPHA / AGENCY_BETA)']
  },
  AI: {
    who: 'Any role',
    steps: ['Try “Health” first', 'Score a single invoice or paste multiple invoices for batch scoring', 'Use “Top scored cases” to list the highest scores']
  },
  Analytics: {
    who: 'Typically admin/manager',
    steps: ['Run “Collections stats” and “Agent performance” to view aggregated metrics']
  },
  Backlog: {
    who: 'FEDEX_ADMIN only',
    steps: ['View recent activity logs', 'Use Summary/Stats and filters to find specific actions', 'Try “Failed” to see unsuccessful operations']
  },
  'Admin Users': {
    who: 'FEDEX_ADMIN',
    steps: ['List all users or counts', 'Search by email/agency', 'Update role/agency for a user (use sample emails)']
  },
  'Manager Agents': {
    who: 'DCA_MANAGER (manager@dca.local)',
    steps: ['List agents, then view performance/workload', 'Enter an agent email to view details or activate/deactivate']
  },
  'Manager Tasks': {
    who: 'DCA_MANAGER (manager@dca.local)',
    steps: ['Load your tasks', 'Assign debts by entering agent email + invoice numbers']
  },
  'Debt Ops': {
    who: 'Any role',
    steps: ['Use Lookups with a sample invoice', 'Use Search to filter by customer/invoice/status/amount', 'Try High value / Overdue / Stats / Date range']
  },
  Profile: {
    who: 'Any role',
    steps: ['View your profile details', 'Optionally change agency ID', 'Delete account only if you want to test deletion flow']
  }
}

const SAMPLE = {
  password: 'Password@123',
  users: {
    admin: { email: 'admin@fedex.local', role: 'FEDEX_ADMIN' },
    manager: { email: 'manager@dca.local', role: 'DCA_MANAGER', agency: 'AGENCY_ALPHA' },
    agent1: { email: 'agent1@dca.local', role: 'DCA_AGENT', agency: 'AGENCY_ALPHA' },
    agent2: { email: 'agent2@dca.local', role: 'DCA_AGENT', agency: 'AGENCY_BETA' }
  },
  agencies: ['AGENCY_ALPHA', 'AGENCY_BETA'],
  invoices: ['INV-10001', 'INV-10002', 'INV-10003', 'INV-10004', 'INV-10005'],
  assignments: {
    agent1: ['INV-10002', 'INV-10005'],
    agent2: ['INV-10004']
  }
}

function shouldShowLoginCreds(page) {
  return page === 'Login'
}

function shouldShowInvoiceList(page) {
  return page === 'Debt Search' || page === 'Debt Ops' || page === 'AI' || page === 'Reports' || page === 'Export'
}

function shouldShowAgentCreds(page) {
  return page === 'My Debts'
}

function shouldShowAdminCreds(page) {
  return page === 'CSV Upload' || page === 'Backlog' || page === 'Admin Users'
}

function shouldShowManagerCreds(page) {
  return page === 'Manager Agents' || page === 'Manager Tasks'
}

function shouldShowCsvInfo(page) {
  return page === 'CSV Upload'
}

export default function EvaluatorNotes({ page }) {
  const help = page ? PAGE_HELP[page] : null

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>How to use this page</h3>

      <div style={{ display: 'grid', gap: 10 }}>
        {help ? (
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>This page: {page}</div>
            <div className="muted" style={{ marginBottom: 8 }}>Recommended user: {help.who}</div>
            <div style={{ display: 'grid', gap: 4 }}>
              {help.steps.map((s) => (
                <div key={s}>• {s}</div>
              ))}
            </div>
          </div>
        ) : null}

        {shouldShowLoginCreds(page) ? (
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>Sample logins (password: <span style={mono}>{SAMPLE.password}</span>)</div>
            <div style={{ display: 'grid', gap: 4 }}>
              <div><span className="muted">Admin:</span> {SAMPLE.users.admin.email} ({SAMPLE.users.admin.role})</div>
              <div><span className="muted">Manager:</span> {SAMPLE.users.manager.email} ({SAMPLE.users.manager.role}, agency {SAMPLE.users.manager.agency})</div>
              <div><span className="muted">Agent 1:</span> {SAMPLE.users.agent1.email} ({SAMPLE.users.agent1.role}, agency {SAMPLE.users.agent1.agency})</div>
              <div><span className="muted">Agent 2:</span> {SAMPLE.users.agent2.email} ({SAMPLE.users.agent2.role}, agency {SAMPLE.users.agent2.agency})</div>
            </div>
          </div>
        ) : null}

        {shouldShowAdminCreds(page) ? (
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>Recommended login</div>
            <div>Use <span style={mono}>{SAMPLE.users.admin.email}</span> (Admin). Password: <span style={mono}>{SAMPLE.password}</span></div>
          </div>
        ) : null}

        {shouldShowManagerCreds(page) ? (
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>Recommended login</div>
            <div>Use <span style={mono}>{SAMPLE.users.manager.email}</span> (Manager). Password: <span style={mono}>{SAMPLE.password}</span></div>
          </div>
        ) : null}

        {shouldShowAgentCreds(page) ? (
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>Recommended login</div>
            <div style={{ display: 'grid', gap: 4 }}>
              <div>Use <span style={mono}>{SAMPLE.users.agent1.email}</span> (Agent). Password: <span style={mono}>{SAMPLE.password}</span></div>
              <div className="muted">Try invoices: <span style={mono}>{SAMPLE.assignments.agent1.join(', ')}</span></div>
              <div>Or use <span style={mono}>{SAMPLE.users.agent2.email}</span> (Agent). Password: <span style={mono}>{SAMPLE.password}</span></div>
              <div className="muted">Try invoice: <span style={mono}>{SAMPLE.assignments.agent2.join(', ')}</span></div>
            </div>
          </div>
        ) : null}

        {shouldShowInvoiceList(page) ? (
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>Sample invoices to try</div>
            <div style={{ ...mono, fontSize: 12 }}>{SAMPLE.invoices.join(', ')}</div>
          </div>
        ) : null}

        {shouldShowCsvInfo(page) ? (
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>CSV Upload tips</div>
            <div className="muted" style={{ marginBottom: 6 }}>Use one of these agency IDs when assigning invoices:</div>
            <div style={{ ...mono, fontSize: 12, marginBottom: 8 }}>{SAMPLE.agencies.join(', ')}</div>
            <div className="muted" style={{ marginBottom: 6 }}>CSV must include these column names in the first row:</div>
            <div style={{ ...mono, fontSize: 12, whiteSpace: 'pre-wrap' }}>
              invoiceNumber,customerName,amount,daysOverdue,serviceType,pastDefaults
            </div>
            <div className="muted" style={{ marginTop: 6 }}>Service type values: EXPRESS, GROUND, FREIGHT</div>
          </div>
        ) : null}

        <div className="muted">Sample data is auto-created by the backend on startup (safe to restart).</div>
      </div>
    </div>
  )
}
