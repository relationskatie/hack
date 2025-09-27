// Общие типы для всего приложения

export interface Document {
  id?: number;
  name: string;
  size: string;
  type?: string;
  url?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  price: string;
  time: string;
  features: string[];
  href: string;
}

// API Response типы
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Общие утилитарные типы
export type Status = 'active' | 'inactive' | 'maintenance' | 'pending';
export type SortOrder = 'asc' | 'desc';
export type DateRange = {
  from: string;
  to: string;
};
