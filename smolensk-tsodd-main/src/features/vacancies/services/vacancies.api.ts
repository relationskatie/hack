import { http } from '@/shared/api/client';

export interface BackendVacancyItem {
  id: string;
  position: string;
  description: string;
  salary: string;
  is_active: boolean;
  published_at?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
}

export const VacanciesApi = {
  list: (params: { limit?: number; offset?: number } = {}) =>
    http.get<PaginatedResponse<BackendVacancyItem>>('/api/vacancies', { query: params }),

  listActive: (params: { limit?: number; offset?: number } = {}) =>
    http.get<PaginatedResponse<BackendVacancyItem>>('/api/vacancies/active', { query: params }),

  get: (id: string) => http.get<BackendVacancyItem>(`/api/vacancies/${id}`),

  create: (payload: { position: string; description: string; salary: string; is_active: boolean }) =>
    http.post<BackendVacancyItem>('/api/vacancies', payload, { requireAuth: true }),

  update: (id: string, payload: { position: string; description: string; salary: string; is_active: boolean }) =>
    http.put<BackendVacancyItem>(`/api/vacancies/${id}`, payload, { requireAuth: true }),

  delete: (id: string) => http.delete<{ id: string; message?: string }>(`/api/vacancies/${id}`, { requireAuth: true }),
};


