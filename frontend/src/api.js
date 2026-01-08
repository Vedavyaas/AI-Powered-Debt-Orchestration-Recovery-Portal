const TOKEN_KEY = 'fedex.jwt'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')

  if (!(options.body instanceof FormData)) {
    if (options.body !== undefined && options.body !== null) {
      headers.set('Content-Type', 'application/json')
    }
  }

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(path, {
    ...options,
    headers
  })

  const contentType = res.headers.get('content-type') || ''
  const rawText = await res.text().catch(() => '')

  let data = rawText
  const looksLikeJson = rawText && (/^\s*\{/.test(rawText) || /^\s*\[/.test(rawText))
  const isJson = contentType.includes('application/json') || contentType.includes('application/problem+json')
  if (isJson || looksLikeJson) {
    try {
      data = rawText ? JSON.parse(rawText) : null
    } catch {
      data = rawText
    }
  }

  if (!res.ok) {
    const messageFromObject =
      data &&
      typeof data === 'object' &&
      (data.message || data.error || data.detail || data.title || data.error_description || data.description)

    const messageFromString =
      typeof data === 'string' && data.trim() && !/^\s*<!doctype\s+html/i.test(data) && !/^\s*<html/i.test(data)
        ? data.trim()
        : ''

    const message = messageFromString || messageFromObject || `Request failed (${res.status})`
    const err = new Error(message)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

export const api = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),

  // Email/OTP disabled
  forgotPassword: (_email) => Promise.reject(new Error('Forgot password is disabled (email/OTP disabled)')),
  resetPassword: (_email, _token, _newPassword) => Promise.reject(new Error('Password reset is disabled (email/OTP disabled)')),

  // Email/OTP disabled
  signupGetKey: (_email) => Promise.reject(new Error('Signup code is disabled (email/OTP disabled)')),
  signupCreateAccount: (user) => request('/create', {
    method: 'POST',
    body: JSON.stringify(user)
  }),

  dashboardStats: () => request('/api/dashboard/stats'),
  dashboardSummary: () => request('/api/dashboard/summary'),

  debtFull: (invoiceNumber) => request(`/debt/case/${encodeURIComponent(invoiceNumber)}/full`),
  debtCase: (invoiceNumber) => request(`/debt/case/${encodeURIComponent(invoiceNumber)}`),

  profileGet: () => request('/user/profile'),
  profileUpdate: (profile) => request('/user/profile', { method: 'PUT', body: JSON.stringify(profile) }),

  changeAgencyId: (agencyID) => request(`/change/agencyID?agencyID=${encodeURIComponent(agencyID)}`, { method: 'POST' }),
  deleteAccount: () => request('/delete/account', { method: 'DELETE' }),

  auditMyActivity: () => request('/api/audit/my-activity'),
  auditUserActivity: (email) => request(`/api/audit/user/${encodeURIComponent(email)}`),
  auditEntityHistory: (type, id) => request(`/api/audit/entity/${encodeURIComponent(type)}/${encodeURIComponent(id)}`),
  auditRange: ({ start, end, page = 0, size = 50 }) => request(`/api/audit/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`),
  auditStats: ({ hours = 24 } = {}) => request(`/api/audit/stats?hours=${encodeURIComponent(hours)}`),
  auditAll: ({ page = 0, size = 100 } = {}) => request(`/api/audit/all?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`),

  reportsSummary: () => request('/api/reports/summary'),
  reportsByStatus: () => request('/api/reports/by-status'),
  reportsByStage: () => request('/api/reports/by-stage'),
  reportsCollectionTrend: () => request('/api/reports/collection-trend'),
  reportsManagerSummary: () => request('/api/reports/manager-summary'),
  reportsTrendAnalysis: () => request('/api/reports/trend-analysis'),
  reportsHighValue: ({ minAmount = 10000, sortBy = 'amount', descending = true } = {}) => request(`/api/reports/high-value?minAmount=${encodeURIComponent(minAmount)}&sortBy=${encodeURIComponent(sortBy)}&descending=${encodeURIComponent(descending)}`),
  reportsOverdue: ({ minDays = 30 } = {}) => request(`/api/reports/overdue?minDays=${encodeURIComponent(minDays)}`),
  reportsCustom: (payload) => request('/api/reports/custom', { method: 'POST', body: JSON.stringify(payload) }),

  exportSummary: () => request('/api/export/summary'),
  exportAll: ({ status, stage, minAmount, maxAmount, minDaysOverdue, sortBy = 'amount', ascending = false, descending } = {}) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (stage) params.set('stage', stage)
    if (minAmount !== undefined && minAmount !== null && minAmount !== '') params.set('minAmount', String(minAmount))
    if (maxAmount !== undefined && maxAmount !== null && maxAmount !== '') params.set('maxAmount', String(maxAmount))
    if (minDaysOverdue !== undefined && minDaysOverdue !== null && minDaysOverdue !== '') params.set('minDaysOverdue', String(minDaysOverdue))
    if (sortBy) params.set('sortBy', sortBy)
    if (ascending !== undefined) params.set('ascending', String(Boolean(ascending)))
    if (descending !== undefined) params.set('descending', String(Boolean(descending)))
    const qs = params.toString()
    return request(`/api/export/all${qs ? `?${qs}` : ''}`)
  },
  exportCount: ({ status, stage, minAmount, maxAmount, minDaysOverdue } = {}) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (stage) params.set('stage', stage)
    if (minAmount !== undefined && minAmount !== null && minAmount !== '') params.set('minAmount', String(minAmount))
    if (maxAmount !== undefined && maxAmount !== null && maxAmount !== '') params.set('maxAmount', String(maxAmount))
    if (minDaysOverdue !== undefined && minDaysOverdue !== null && minDaysOverdue !== '') params.set('minDaysOverdue', String(minDaysOverdue))
    const qs = params.toString()
    return request(`/api/export/count${qs ? `?${qs}` : ''}`)
  },
  exportCsv: ({ status, stage, minAmount, maxAmount, minDaysOverdue, sortBy = 'amount', ascending = false } = {}) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (stage) params.set('stage', stage)
    if (minAmount !== undefined && minAmount !== null && minAmount !== '') params.set('minAmount', String(minAmount))
    if (maxAmount !== undefined && maxAmount !== null && maxAmount !== '') params.set('maxAmount', String(maxAmount))
    if (minDaysOverdue !== undefined && minDaysOverdue !== null && minDaysOverdue !== '') params.set('minDaysOverdue', String(minDaysOverdue))
    if (sortBy) params.set('sortBy', sortBy)
    params.set('ascending', String(Boolean(ascending)))
    const qs = params.toString()
    return request(`/api/export/csv${qs ? `?${qs}` : ''}`)
  },
  exportJson: ({ status, stage, minAmount, maxAmount, minDaysOverdue, sortBy = 'amount', ascending = false, includeInvestData = false } = {}) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (stage) params.set('stage', stage)
    if (minAmount !== undefined && minAmount !== null && minAmount !== '') params.set('minAmount', String(minAmount))
    if (maxAmount !== undefined && maxAmount !== null && maxAmount !== '') params.set('maxAmount', String(maxAmount))
    if (minDaysOverdue !== undefined && minDaysOverdue !== null && minDaysOverdue !== '') params.set('minDaysOverdue', String(minDaysOverdue))
    if (sortBy) params.set('sortBy', sortBy)
    params.set('ascending', String(Boolean(ascending)))
    params.set('includeInvestData', String(Boolean(includeInvestData)))
    const qs = params.toString()
    return request(`/api/export/json${qs ? `?${qs}` : ''}`)
  },

  agentGetDebts: () => request('/get/debts'),
  agentChangeStage: ({ invoiceNumber, stage }) => request(`/put/stage?invoiceNumber=${encodeURIComponent(invoiceNumber)}&stage=${encodeURIComponent(stage)}`, { method: 'PUT' }),
  agentChangeMessage: ({ invoiceNumber, message }) => request(`/put/message?invoiceNumber=${encodeURIComponent(invoiceNumber)}&message=${encodeURIComponent(message)}`, { method: 'PUT' }),

  csvUpload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return request('/put/CSV', { method: 'POST', body: form })
  },
  csvList: () => request('/get/CSV'),
  csvAssignToAgency: ({ agencyID, invoiceNumber }) => request('/put/assignedTo', {
    method: 'PUT',
    body: JSON.stringify({ agencyID, invoiceNumber })
  }),

  // AI
  aiHealth: () => request('/api/ai/health'),
  aiScore: (invoiceNumber) => request(`/api/ai/score/${encodeURIComponent(invoiceNumber)}`),
  aiScoreBatch: (invoiceNumbers) => request('/api/ai/score/batch', { method: 'POST', body: JSON.stringify(invoiceNumbers) }),
  aiScoreAllUnassigned: () => request('/api/ai/score/all-unassigned', { method: 'POST' }),
  aiTopScores: ({ limit = 10 } = {}) => request(`/api/ai/score/top/${encodeURIComponent(limit)}`),
  aiScoreStatistics: () => request('/api/ai/score/statistics'),

  // Analytics
  analyticsCollections: () => request('/admin/stats/collections'),
  analyticsAgentPerformance: () => request('/admin/stats/agent-performance'),

  // Backlog
  backlogAll: ({ page = 0, size = 20 } = {}) => request(`/backlog?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`),
  backlogFailed: ({ page = 0, size = 20 } = {}) => request(`/backlog/failed?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`),
  backlogSummary: ({ hours = 24 } = {}) => request(`/backlog/summary?hours=${encodeURIComponent(hours)}`),
  backlogModuleStats: ({ hours = 24 } = {}) => request(`/backlog/stats/module?hours=${encodeURIComponent(hours)}`),
  backlogActionStats: ({ hours = 24 } = {}) => request(`/backlog/stats/action?hours=${encodeURIComponent(hours)}`),
  backlogByUser: (userEmail) => request(`/backlog/user/${encodeURIComponent(userEmail)}`),
  backlogByModule: (module) => request(`/backlog/module/${encodeURIComponent(module)}`),
  backlogByAction: (action) => request(`/backlog/action/${encodeURIComponent(action)}`),
  backlogByEntity: ({ entityType, entityId }) => request(`/backlog/entity/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`),
  backlogRange: ({ start, end, page = 0, size = 20 }) => request(`/backlog/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`),
  backlogSearch: ({ module, action, userEmail, start, end, page = 0, size = 20 }) => {
    const params = new URLSearchParams()
    if (module) params.set('module', module)
    if (action) params.set('action', action)
    if (userEmail) params.set('userEmail', userEmail)
    params.set('start', start)
    params.set('end', end)
    params.set('page', String(page))
    params.set('size', String(size))
    return request(`/backlog/search?${params.toString()}`)
  },
  backlogById: (id) => request(`/backlog/${encodeURIComponent(id)}`),
  backlogCreate: ({ action, module, description, performedBy, ipAddress, success }) => request('/backlog', {
    method: 'POST',
    body: JSON.stringify({ action, module, description, performedBy, ipAddress, success })
  }),
  backlogUserRecent: ({ userEmail, hours = 24 } = {}) => request(`/backlog/user/${encodeURIComponent(userEmail)}/recent?hours=${encodeURIComponent(hours)}`),

  // Admin users
  adminUsersList: () => request('/api/admin/users/list'),
  adminUsersListByRole: (role) => request(`/api/admin/users/list/${encodeURIComponent(role)}`),
  adminUsersListByAgency: (agencyId) => request(`/api/admin/users/agency/${encodeURIComponent(agencyId)}`),
  adminUsersCount: () => request('/api/admin/users/count'),
  adminUsersSearch: (query) => request(`/api/admin/users/search?query=${encodeURIComponent(query)}`),
  adminUsersUpdateRole: ({ email, role }) => request('/api/admin/users/update-role', { method: 'PUT', body: JSON.stringify({ email, role }) }),
  adminUsersUpdateAgency: ({ email, agencyId }) => request('/api/admin/users/update-agency', { method: 'PUT', body: JSON.stringify({ email, agencyId }) }),
  adminUsersDelete: (email) => request(`/api/admin/users/delete/${encodeURIComponent(email)}`, { method: 'DELETE' }),

  // Manager agent management
  managerAgentsList: () => request('/api/manager/agents/list'),
  managerAgentsPerformance: () => request('/api/manager/agents/performance'),
  managerAgentsWorkload: () => request('/api/manager/agents/workload'),
  managerAgentsDetails: (email) => request(`/api/manager/agents/details/${encodeURIComponent(email)}`),
  managerAgentsDeactivate: (email) => request(`/api/manager/agents/deactivate/${encodeURIComponent(email)}`, { method: 'PUT' }),
  managerAgentsActivate: (email) => request(`/api/manager/agents/activate/${encodeURIComponent(email)}`, { method: 'PUT' }),

  // DCA manager tasks
  managerGetTasks: () => request('/get/tasks'),
  managerAssignDebt: ({ invoiceNumber, agentEmail }) => request('/debt/assign', { method: 'POST', body: JSON.stringify({ invoiceNumber, agentEmail }) }),

  // Debt operations (advanced)
  debtCaseDetails: (invoiceNumber) => request(`/debt/case/${encodeURIComponent(invoiceNumber)}/details`),
  debtSearch: (payload) => request('/debt/search', { method: 'GET', body: JSON.stringify(payload || null) }),
  debtHighValue: ({ minAmount = 10000 } = {}) => request(`/debt/high-value?minAmount=${encodeURIComponent(minAmount)}`),
  debtOverdue: ({ minDays = 30 } = {}) => request(`/debt/overdue?minDays=${encodeURIComponent(minDays)}`),
  debtStats: () => request('/debt/stats'),
  debtDateRange: ({ startDate, endDate }) => request(`/debt/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
  debtStatusHistory: (invoiceNumber) => request(`/debt/status-history/${encodeURIComponent(invoiceNumber)}`),
  debtBulkStatus: ({ invoiceNumbers, newStatus, assignedTo }) => request('/debt/bulk/status', { method: 'POST', body: JSON.stringify({ invoiceNumbers, newStatus, assignedTo }) }),
  debtBulkStage: ({ invoiceNumbers, stage }) => request('/debt/bulk/stage', { method: 'POST', body: JSON.stringify({ invoiceNumbers, stage }) }),
  debtBulkAssign: ({ invoiceNumbers, agentEmail }) => request('/debt/bulk/assign', { method: 'POST', body: JSON.stringify({ invoiceNumbers, agentEmail }) })
}
