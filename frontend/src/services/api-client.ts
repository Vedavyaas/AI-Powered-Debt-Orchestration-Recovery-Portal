import { api } from './api'
import type {
  LoginRequest, AuthResponse, RefreshTokenRequest,
  ChangePasswordRequest, UserInfo, ValidationResponse, HealthResponse
} from '@/types/auth'
import type { DashboardSummary, DashboardStats } from '@/types/dashboard'
import type {
  DebtCaseEntity, CaseSearchRequest, BulkStatusUpdate,
  BulkAssignmentDTO, DebtStats, DebtCaseDetailDTO
} from '@/types/debt'

// Auth API
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/api/auth/login', data),

  logout: () =>
    api.post<{ message: string }>('/api/auth/logout'),

  refresh: (data: RefreshTokenRequest) =>
    api.post<AuthResponse>('/api/auth/refresh', data),

  validate: () =>
    api.post<ValidationResponse>('/api/auth/validate'),

  changePassword: (data: ChangePasswordRequest) =>
    api.post<{ message: string }>('/api/auth/change-password', data),

  passwordResetConfirm: (email: string, newPassword: string) =>
    api.post<{ message: string }>('/api/auth/password-reset-confirm', null, {
      params: { email, newPassword }
    }),

  getCurrentUser: () =>
    api.get<UserInfo>('/api/auth/me'),

  health: () =>
    api.get<HealthResponse>('/api/auth/health')
}

// Dashboard API
export const dashboardApi = {
  getSummary: () =>
    api.get<DashboardSummary>('/api/dashboard/summary'),

  getStats: () =>
    api.get<DashboardStats>('/api/dashboard/stats')
}

// Debt API
export const debtApi = {
  getCaseByInvoice: (invoiceNumber: string) =>
    api.get<DebtCaseEntity>(`/debt/case/${invoiceNumber}`),

  searchCases: (request?: CaseSearchRequest) =>
    api.get<DebtCaseEntity[]>('/debt/search', { data: request }),

  getCaseDetails: (invoiceNumber: string) =>
    api.get<DebtCaseDetailDTO>(`/debt/case/${invoiceNumber}/details`),

  bulkUpdateStatus: (data: BulkStatusUpdate) =>
    api.post<{ message: string }>('/debt/bulk/status', data),

  bulkUpdateStage: (invoiceNumbers: string[], stage: string) =>
    api.post<{ message: string }>('/debt/bulk/stage', { invoiceNumbers, stage }),

  bulkAssign: (data: BulkAssignmentDTO) =>
    api.post<{ message: string }>('/debt/bulk/assign', data),

  getHighValueCases: () =>
    api.get<DebtCaseEntity[]>('/debt/high-value'),

  getOverdueCases: () =>
    api.get<DebtCaseEntity[]>('/debt/overdue'),

  getStats: () =>
    api.get<DebtStats>('/debt/stats'),

  getDateRange: (startDate: string, endDate: string) =>
    api.get<DebtCaseEntity[]>(`/debt/date-range?startDate=${startDate}&endDate=${endDate}`),

  getStatusHistory: (invoiceNumber: string) =>
    api.get<any[]>(`/debt/status-history/${invoiceNumber}`),

  getFullCase: (invoiceNumber: string) =>
    api.get<DebtCaseDetailDTO>(`/debt/case/${invoiceNumber}/full`)
}

// Forgot Password API
export const forgotPasswordApi = {
  forgotPassword: (_email: string) =>
    Promise.reject(new Error('Forgot password is disabled (email/OTP disabled)')),

  resetPassword: (_email: string, _otp: string, _newPassword: string) =>
    Promise.reject(new Error('Password reset is disabled (email/OTP disabled)')),

  resetPasswordConfirm: (token: string, newPassword: string) =>
    api.post<{ message: string }>('/api/auth/reset-password-confirm', { token, newPassword }),

  validateResetToken: (token: string) =>
    api.post<{ valid: boolean }>('/api/auth/validate-reset-token', { token })
}

// AI API
export const aiApi = {
  health: () =>
    api.get<{ status: string }>('/api/ai/health'),

  scoreCase: (invoiceNumber: string) =>
    api.get<{ propensityScore: number }>(`/api/ai/score/${invoiceNumber}`),

  batchScore: (invoiceNumbers: string[]) =>
    api.post<{ scores: Record<string, number> }>('/api/ai/score/batch', { invoiceNumbers }),

  scoreAllUnassigned: () =>
    api.post<{ message: string }>('/api/ai/score/all-unassigned'),

  getTopScoredCases: (limit: number = 10) =>
    api.get<DebtCaseEntity[]>(`/api/ai/score/top/${limit}`),

  getScoringStatistics: () =>
    api.get<{
      totalCases: number;
      scoredCases: number;
      averageScore: number;
      scoreDistribution: Record<string, number>
    }>('/api/ai/score/statistics')
}

// Reporting API
export const reportingApi = {
  getSummary: (hours: number = 24) =>
    api.get<any>(`/api/reports/summary?hours=${hours}`),

  getByStatus: () =>
    api.get<any>('/api/reports/by-status'),

  getByStage: () =>
    api.get<any>('/api/reports/by-stage'),

  getHighValue: () =>
    api.get<any>('/api/reports/high-value'),

  getOverdue: () =>
    api.get<any>('/api/reports/overdue'),

  getCollectionTrend: (days: number = 30) =>
    api.get<any>(`/api/reports/collection-trend?days=${days}`),

  getManagerSummary: (managerEmail: string) =>
    api.get<any>(`/api/reports/manager-summary?managerEmail=${managerEmail}`),

  getTrendAnalysis: (period: string = 'monthly') =>
    api.get<any>(`/api/reports/trend-analysis?period=${period}`),

  customReport: (config: any) =>
    api.post<any>('/api/reports/custom', config)
}

// Agent Management API
export const agentManagementApi = {
  getAgentList: () =>
    api.get<any[]>('/api/manager/agents/list'),

  getAgentPerformance: () =>
    api.get<any[]>('/api/manager/agents/performance'),

  getAgentWorkload: () =>
    api.get<any>('/api/manager/agents/workload'),

  deactivateAgent: (email: string) =>
    api.put<{ message: string }>(`/api/manager/agents/deactivate/${email}`),

  activateAgent: (email: string) =>
    api.put<{ message: string }>(`/api/manager/agents/activate/${email}`),

  getAgentDetails: (email: string) =>
    api.get<any>(`/api/manager/agents/details/${email}`)
}

// Admin User API
export const adminUserApi = {
  getUserList: () =>
    api.get<any[]>('/api/admin/users/list'),

  getUsersByRole: (role: string) =>
    api.get<any[]>(`/api/admin/users/list/${role}`),

  getUsersByAgency: (agencyId: string) =>
    api.get<any[]>(`/api/admin/users/agency/${agencyId}`),

  updateUserRole: (email: string, role: string) =>
    api.put<{ message: string }>('/api/admin/users/update-role', { email, role }),

  updateUserAgency: (email: string, agencyId: string) =>
    api.put<{ message: string }>('/api/admin/users/update-agency', { email, agencyId }),

  deleteUser: (email: string) =>
    api.delete<{ message: string }>(`/api/admin/users/delete/${email}`),

  getUserCount: () =>
    api.get<{ total: number; byRole: Record<string, number> }>('/api/admin/users/count'),

  searchUsers: (query: string) =>
    api.get<any[]>(`/api/admin/users/search?q=${query}`)
}

// Export API
export const exportApi = {
  exportToCsv: (filters?: any) =>
    api.get('/api/export/csv', {
      params: filters,
      responseType: 'blob'
    }),

  exportToJson: (filters?: any) =>
    api.get('/api/export/json', {
      params: filters,
      responseType: 'blob'
    }),

  getSummary: () =>
    api.get<any>('/api/export/summary'),

  getAllData: () =>
    api.get<any>('/api/export/all'),

  getExportCount: () =>
    api.get<{ totalRecords: number; filteredRecords: number }>('/api/export/count')
}

// Audit API
export const auditApi = {
  getMyActivity: () =>
    api.get<any[]>('/api/audit/my-activity'),

  getUserActivity: (email: string) =>
    api.get<any[]>(`/api/audit/user/${email}`),

  getEntityActivity: (type: string, id: string) =>
    api.get<any[]>(`/api/audit/entity/${type}/${id}`),

  getActivityByRange: (startDate: string, endDate: string) =>
    api.get<any[]>(`/api/audit/range?startDate=${startDate}&endDate=${endDate}`),

  getActivityStats: () =>
    api.get<any>('/api/audit/stats'),

  getAllActivity: () =>
    api.get<any[]>('/api/audit/all')
}

// Backlog API
export const backlogApi = {
  getAllLogs: (page: number = 0, size: number = 20) =>
    api.get<any>(`/backlog?page=${page}&size=${size}`),

  getLogsByUser: (userEmail: string) =>
    api.get<any[]>(`/backlog/user/${userEmail}`),

  getLogsByModule: (module: string) =>
    api.get<any[]>(`/backlog/module/${module}`),

  getLogsByAction: (action: string) =>
    api.get<any[]>(`/backlog/action/${action}`),

  getLogsByEntity: (entityType: string, entityId: string) =>
    api.get<any[]>(`/backlog/entity/${entityType}/${entityId}`),

  getLogsByRange: (start: string, end: string, page: number = 0, size: number = 20) =>
    api.get<any>(`/backlog/range?start=${start}&end=${end}&page=${page}&size=${size}`),

  getFailedLogs: (page: number = 0, size: number = 20) =>
    api.get<any>(`/backlog/failed?page=${page}&size=${size}`),

  getRecentLogs: (userEmail: string, hours: number = 24) =>
    api.get<any[]>(`/backlog/user/${userEmail}/recent?hours=${hours}`),

  getModuleStats: (hours: number = 24) =>
    api.get<Record<string, number>>(`/backlog/stats/module?hours=${hours}`),

  getActionStats: (hours: number = 24) =>
    api.get<Record<string, number>>(`/backlog/stats/action?hours=${hours}`),

  searchLogs: (module?: string, action?: string, userEmail?: string, start?: string, end?: string, page: number = 0, size: number = 20) => {
    const params = new URLSearchParams();
    if (module) params.append('module', module);
    if (action) params.append('action', action);
    if (userEmail) params.append('userEmail', userEmail);
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    params.append('page', page.toString());
    params.append('size', size.toString());

    return api.get<any>(`/backlog/search?${params.toString()}`);
  },

  getLogById: (id: number) =>
    api.get<any>(`/backlog/${id}`)
}

// Analytics API
export const analyticsApi = {
  getCollectionsStats: () =>
    api.get<any>('/admin/stats/collections'),

  getAgentPerformanceStats: () =>
    api.get<any>('/admin/stats/agent-performance')
}

// User API
export const userApi = {
  getProfile: () =>
    api.get<any>('/user/profile'),

  updateProfile: (profile: any) =>
    api.put<{ message: string }>('/user/profile', profile)
}

// DCA Agent API
export const dcaAgentApi = {
  getMyDebts: () =>
    api.get<DebtCaseEntity[]>('/get/debts'),

  updateStage: (invoiceNumber: string, stage: string, notes?: string) =>
    api.put<{ message: string }>('/put/stage', { invoiceNumber, stage, notes }),

  updateMessage: (invoiceNumber: string, message: string) =>
    api.put<{ message: string }>('/put/message', { invoiceNumber, message })
}

// DCA Manager API
export const dcaManagerApi = {
  getMyTasks: () =>
    api.get<any[]>('/get/tasks'),

  assignDebt: (invoiceNumber: string, agentEmail: string) =>
    api.post<{ message: string }>('/debt/assign', { invoiceNumber, agentEmail })
}

// CSV API
export const csvApi = {
  uploadCSV: (file: File, formData?: any) => {
    const data = new FormData();
    data.append('file', file);
    if (formData) {
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
    }
    return api.post<{ message: string; imported: number }>('/put/CSV', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateAssignedTo: (invoiceNumbers: string[], assignedTo: string) =>
    api.put<{ message: string }>('/put/assignedTo', { invoiceNumbers, assignedTo }),

  getCSVData: () =>
    api.get<any[]>('/get/CSV')
}

// JWT Login Details API
export const jwtLoginApi = {
  changeAgencyId: (email: string, newAgencyId: string) =>
    api.post<{ message: string }>('/change/agencyID', { email, newAgencyId }),

  deleteAccount: (email: string) =>
    api.delete<{ message: string }>('/delete/account', { data: { email } })
}

// Create Account API
export const createAccountApi = {
  getOTP: (_email: string) =>
    Promise.reject(new Error('Signup OTP is disabled (email/OTP disabled)')),

  createAccount: (account: { email: string; password: string; agencyId: string; role: string }) =>
    api.post<{ message: string }>('/create', account)
}
