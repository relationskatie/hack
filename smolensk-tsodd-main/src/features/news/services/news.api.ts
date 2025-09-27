import { http } from '@/shared/api/client';

// Функция для конвертации файла в base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Убираем префикс "data:image/...;base64," и оставляем только base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

export interface BackendNewsItem {
  id: string;
  title: string;
  content: string;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
  file?: string;
  filename?: string;
  file_url?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
}

export const NewsApi = {
  list: (params: { limit?: number; offset?: number } = {}) =>
    http.get<PaginatedResponse<BackendNewsItem>>('/api/news', { query: params }),

  get: (id: string) => http.get<BackendNewsItem>(`/api/news/${id}`),

  count: () => http.get<{ count: number }>(`/api/news/count`),

  create: async (payload: { title: string; content: string; file?: File; filename?: string }) => {
    if (payload.file) {
      // Конвертируем файл в base64 для отправки
      const base64File = await fileToBase64(payload.file);
      const requestData = {
        title: payload.title,
        content: payload.content,
        filename: payload.filename || payload.file.name,
        file: base64File
      };
      return http.post<BackendNewsItem>('/api/news', requestData, { requireAuth: true });
    }
    return http.post<BackendNewsItem>('/api/news', payload, { requireAuth: true });
  },

  update: async (id: string, payload: { title: string; content: string; file?: File; filename?: string }) => {
    if (payload.file) {
      // Конвертируем файл в base64 для отправки
      const base64File = await fileToBase64(payload.file);
      const requestData = {
        title: payload.title,
        content: payload.content,
        filename: payload.filename || payload.file.name,
        file: base64File
      };
      return http.put<BackendNewsItem>(`/api/news/${id}`, requestData, { requireAuth: true });
    }
    return http.put<BackendNewsItem>(`/api/news/${id}`, payload, { requireAuth: true });
  },

  delete: (id: string) => http.delete<{ id: string; message?: string }>(`/api/news/${id}`, { requireAuth: true }),
};


