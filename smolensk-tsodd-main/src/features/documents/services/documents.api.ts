import { http } from '@/shared/api/client';

// Функция для конвертации файла в base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Убираем префикс "data:...;base64," и оставляем только base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

export interface BackendDocumentItem {
  id: string;
  title: string;
  description?: string;
  uploaded_by?: string;
  created_at?: string;
  filename?: string;
  file_url?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
}

export const DocumentsApi = {
  list: (params: { limit?: number; offset?: number } = {}) =>
    http.get<PaginatedResponse<BackendDocumentItem>>('/api/documents', { query: params }),

  get: (id: string) => http.get<BackendDocumentItem>(`/api/documents/${id}`),

  download: async (id: string) => {
    const response = await http.get<{ document: BackendDocumentItem & { file: string } }>(`/api/documents/${id}`);
    return response.document;
  },

  create: async (payload: { title: string; description?: string; file: File; filename?: string }) => {
    // Конвертируем файл в base64 для отправки
    const base64File = await fileToBase64(payload.file);
    const requestData = {
      title: payload.title,
      description: payload.description || '',
      filename: payload.filename || payload.file.name,
      file: base64File
    };
    return http.post<BackendDocumentItem>('/api/documents', requestData, { requireAuth: true });
  },

  delete: (id: string) => http.delete<{ id: string; message?: string }>(`/api/documents/${id}`, { requireAuth: true }),
};


