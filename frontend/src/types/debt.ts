// Debt Case Types
export const Status = {
  UN_ASSIGNED: 'UN_ASSIGNED',
  ASSIGNED: 'ASSIGNED',
  ASSIGNED_AND_WAITING: 'ASSIGNED_AND_WAITING'
} as const

export type StatusType = typeof Status[keyof typeof Status]

export const Service = {
  EXPRESS: 'EXPRESS',
  GROUND: 'GROUND',
  FREIGHT: 'FREIGHT'
} as const

export type ServiceType = typeof Service[keyof typeof Service]

export interface DebtCaseEntity {
  id?: number;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  daysOverdue: number;
  serviceType: ServiceType;
  pastDefaults: number;
  status?: StatusType;
  assignedTo?: string;
  propensityScore?: number;
}

export interface CaseSearchRequest {
  customerName?: string;
  invoiceNumber?: string;
  status?: StatusType;
  minAmount?: number;
  maxAmount?: number;
  minDaysOverdue?: number;
  serviceTypes?: string[];
}

export interface BulkStatusUpdate {
  invoiceNumbers: string[];
  status: StatusType;
}

export interface BulkAssignmentDTO {
  invoiceNumbers: string[];
  agentEmail: string;
}

export interface DebtStats {
  totalCases: number;
  totalAmount: number;
  overdueCases: number;
  overdueAmount: number;
  assignedCases: number;
  unassignedCases: number;
}

export interface DebtCaseDetailDTO {
  invoiceNumber: string;
  customerName: string;
  amount: number;
  daysOverdue: number;
  serviceType: ServiceType;
  pastDefaults: number;
  status: StatusType;
  assignedTo?: string;
  propensityScore?: number;
  collectionHistory: CollectionHistory[];
}

export interface CollectionHistory {
  date: string;
  action: string;
  notes: string;
  amount?: number;
}
