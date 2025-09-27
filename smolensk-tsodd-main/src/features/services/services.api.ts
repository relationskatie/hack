import { http } from '@/shared/api/client';

export interface ServiceTimeSlot {
  start_time: string;
  end_time: string;
  is_booked: boolean;
  date: string; // YYYY-MM-DD
}

export interface ShortServiceInfo {
  id: string;
  tittle: string;
  price: number;
  description: string;
  need_schedule: boolean;
}

export interface ServiceInfo extends ShortServiceInfo {
  schedule: ServiceTimeSlot[];
}

export interface ListServicesResponse {
  services: ShortServiceInfo[];
  total_count: number;
  limit: number;
  offset: number;
}

export interface GetServiceByIdResponse {
  service_info: ServiceInfo;
}

export interface CreateServiceRequest {
  tittle: string;
  price: number;
  description: string;
  need_schedule: boolean;
  schedule?: ServiceTimeSlot[];
}

export interface UpdateServiceRequest {
  tittle: string;
  price: number;
  description: string;
  need_schedule?: boolean;
  schedule?: ServiceTimeSlot[];
}

export interface CreateServiceResponse {
  service: ServiceInfo;
}

export interface UpdateServiceResponse {
  message: string;
  updated_at: string;
}

export interface DeleteServiceResponse {
  success: boolean;
  message: string;
}

export const ServicesApi = {
  list: (params: { limit?: number; offset?: number } = {}) =>
    http.get<ListServicesResponse>('/api/services', { query: params }),

  getById: (id: string) =>
    http.get<GetServiceByIdResponse>(`/api/services/${id}`),

  create: (payload: CreateServiceRequest) =>
    http.post<CreateServiceResponse>('/api/services', payload, { requireAuth: true }),

  update: (id: string, payload: UpdateServiceRequest) =>
    http.put<UpdateServiceResponse>(`/api/services/${id}`, payload, { requireAuth: true }),

  delete: (id: string) =>
    http.delete<DeleteServiceResponse>(`/api/services/${id}`, { requireAuth: true }),
};


