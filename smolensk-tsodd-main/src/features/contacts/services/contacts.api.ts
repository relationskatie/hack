import { http } from '@/shared/api/client';

// Интерфейс для ответа от API Gateway (с полем ID)
interface ApiGatewayContactResponse {
  ID: string;  // UUID строка от API Gateway
  title: string;
  phones: string[];
  emails: string[];
  addresses: string[];
}

export interface BackendContactItem {
  id: string;
  title: string;
  phones: string[];
  emails: string[];
  addresses: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
}

// Функция для преобразования ответа от API Gateway в формат frontend
function transformApiResponse(apiResponse: ApiGatewayContactResponse): BackendContactItem {
  return {
    id: apiResponse.ID,
    title: apiResponse.title,
    phones: apiResponse.phones,
    emails: apiResponse.emails,
    addresses: apiResponse.addresses,
  };
}

export const ContactsApi = {
  list: async (params: { limit?: number; offset?: number } = {}) => {
    const response = await http.get<ApiGatewayContactResponse[]>('/api/contacts', { query: params });
    return {
      items: response.map(transformApiResponse)
    };
  },
  
  get: async (id: string) => {
    const response = await http.get<ApiGatewayContactResponse>(`/api/contacts/${id}`);
    return transformApiResponse(response);
  },
  
  create: async (payload: { title: string; phones: string[]; emails: string[]; addresses: string[] }) => {
    const response = await http.post<ApiGatewayContactResponse>('/api/contacts', payload, { requireAuth: true });
    return transformApiResponse(response);
  },
  
  update: async (id: string, payload: { title: string; phones: string[]; emails: string[]; addresses: string[] }) => {
    const response = await http.put<ApiGatewayContactResponse>(`/api/contacts/${id}`, payload, { requireAuth: true });
    return transformApiResponse(response);
  },
  
  delete: (id: string) => http.delete<{ id: string; message?: string }>(`/api/contacts/${id}`, { requireAuth: true }),
};


