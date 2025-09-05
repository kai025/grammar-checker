// Common types shared across all domains

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserContext {
  userId: string;
  organizationId: string;
  email: string;
  role: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface PeriodFilter {
  year?: number;
  month?: number;
  quarter?: number;
  periodType?: 'ANNUAL' | 'QUARTERLY' | 'MONTHLY';
}
