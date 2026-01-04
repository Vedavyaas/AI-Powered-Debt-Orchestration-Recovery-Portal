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
  profileUpdate: (profile) => request('/user/profile', { method: 'PUT', body: JSON.stringify(profile) })
}
