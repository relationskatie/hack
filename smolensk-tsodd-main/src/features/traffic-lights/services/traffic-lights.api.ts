import { http } from '@/shared/api/client';

export interface BackendTrafficLight {
  id: string;
  address: string;
  type: 'Транспортный' | 'Пешеходный' | 'Комбинированный';
  status: 'working' | 'maintenance' | 'malfunction';
  install_date: string;
  last_maintenance: string;
  phases: number;
  mode: 'fixed' | 'adaptive' | 'manual';
  coordinates: {
    lat: number;
    lng: number;
  };
  district?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export const TrafficLightsApi = {
  list: (params: { 
    limit?: number; 
    offset?: number; 
    status?: string; 
    type?: string; 
    district?: string;
  } = {}) =>
    http.get<PaginatedResponse<BackendTrafficLight>>('/api/traffic-lights', { query: params, requireAuth: true }),

  get: (id: string) => 
    http.get<BackendTrafficLight>(`/api/traffic-lights/${id}`, { requireAuth: true }),

  create: (payload: {
    address: string;
    type: string;
    phases: number;
    mode: string;
    coordinates: { lat: number; lng: number };
    district?: string;
    description?: string;
  }) =>
    http.post<BackendTrafficLight>('/api/traffic-lights', payload, { requireAuth: true }),

  update: (id: string, payload: {
    address?: string;
    type?: string;
    status?: string;
    phases?: number;
    mode?: string;
    coordinates?: { lat: number; lng: number };
    district?: string;
    description?: string;
  }) =>
    http.put<BackendTrafficLight>(`/api/traffic-lights/${id}`, payload, { requireAuth: true }),

  delete: (id: string) => 
    http.delete<{ id: string; message?: string }>(`/api/traffic-lights/${id}`, { requireAuth: true }),

  updateStatus: (id: string, status: string) =>
    http.put<BackendTrafficLight>(`/api/traffic-lights/${id}/status`, { status }, { requireAuth: true }),

  getByDistrict: (district: string) =>
    http.get<BackendTrafficLight[]>(`/api/traffic-lights/district/${district}`, { requireAuth: true }),

  getStats: () =>
    http.get<{
      total: number;
      working: number;
      maintenance: number;
      malfunction: number;
      by_type: Record<string, number>;
      by_district: Record<string, number>;
    }>('/api/traffic-lights/stats', { requireAuth: true }),
};
