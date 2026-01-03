// Dashboard Types
export interface DashboardSummary {
  totalCases: number;
  totalAgents: number;
  totalManagers: number;
  totalPortfolioValue: number;
  pendingCases: number;
  collectedToday: number;
  collectedTodayAmount: number;
  casesThisWeek: number;
  casesThisWeekAmount: number;
  topAgents: TopAgentDTO[];
  recentCases: RecentCaseDTO[];
}

export interface TopAgentDTO {
  email: string;
  name: string;
  collectedCases: number;
  collectedAmount: number;
}

export interface RecentCaseDTO {
  invoiceNumber: string;
  customerName: string;
  status: string;
  stage: string;
  amount: number;
}

export interface DashboardStats {
  totalCases: number;
  totalAgents: number;
  totalManagers: number;
  totalPortfolioValue: number;
  pendingCases: number;
  collectedToday: number;
}
