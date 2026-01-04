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
  const isJson = contentType.includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '')

  if (!res.ok) {
    const message =
      (typeof data === 'string' && data.trim()) ||
      (data && typeof data === 'object' && (data.message || data.error)) ||
      `Request failed (${res.status})`
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

  forgotPassword: (email) => request(`/api/auth/forgot-password?email=${encodeURIComponent(email)}`, { method: 'POST' }),
  resetPassword: (email, token, newPassword) => request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, token, newPassword })
  }),

  signupGetKey: (email) => request(`/get/OTP?email=${encodeURIComponent(email)}`),
  signupCreateAccount: (user, key) => request(`/create?key=${encodeURIComponent(key)}`, {
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
  agentChangeMessage: ({ invoiceNumber, message }) => request(`/put/message?invoiceNumber=${encodeURIComponent(invoiceNumber)}&message=${encodeURIComponent(message)}`, { method: 'PUT' })
}
