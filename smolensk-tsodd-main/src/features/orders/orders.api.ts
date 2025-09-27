import { http } from '@/shared/api/client';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELED';

export interface CreateOrderRequestBody {
  service_id: string;
  description: string;
  location: string;
  start_time: string; // "YYYY-MM-DDTHH:mm:ssZ" or backend parses RFC3339
  end_time: string;   // see handlers: gateway expects date + HH:mm (combined server-side)
  date: string;       // YYYY-MM-DD
}

export interface CreateOrderResponse {
  order_id: string;
  service: {
    id: string;
    tittle: string;
    price: number;
    description: string;
    need_schedule: boolean;
  };
  status: OrderStatus;
  created_at: string;
}

export interface OrderItem {
  order_id: string;
  customer_id: string;
  service_id: string;
  description: string;
  location: string;
  start_time: string; // formatted "15.04" by gateway client
  end_time: string;   // formatted "15.04"
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface ListOrdersResponse {
  orders: OrderItem[];
  total_count: number;
  limit: number;
  offset: number;
}

export const OrdersApi = {
  create: (payload: CreateOrderRequestBody) =>
    http.post<CreateOrderResponse>('/api/orders', payload, { requireAuth: true }),

  getMine: (params: { limit?: number; offset?: number } = {}) =>
    http.get<ListOrdersResponse>('/api/orders/my', { query: params, requireAuth: true }),

  getByIdForAdmin: (id: string) =>
    http.get<OrderItem>(`/api/orders/${id}`, { requireAuth: true }),

  getForUser: (id: string) =>
    http.get<OrderItem>(`/api/orders/user/${id}`, { requireAuth: true }),

  cancel: (id: string) =>
    http.put<{ success: boolean; message: string }>(`/api/orders/${id}`, undefined, { requireAuth: true }),

  updateStatus: (order_id: string, status: OrderStatus) =>
    http.put<{ success: boolean; message: string }>(`/api/orders`, { order_id, status }, { requireAuth: true }),

  listAll: (params: { limit?: number; offset?: number } = {}) =>
    http.get<ListOrdersResponse>('/api/orders', { query: params, requireAuth: true }),
};


