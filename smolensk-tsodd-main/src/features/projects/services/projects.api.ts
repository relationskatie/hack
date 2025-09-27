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

export interface BackendProjectItem {
  ID: string;
  Title: string;
  Description: string;
  UploadedBy: string; // UUID as string
  CreatedAt: string;
  UpdatedAt: string;
  Filename: string;
  File: string; // base64 string
  FileURL: string;
}

export interface PaginatedResponse<T> {
  items: T[];
}

// Фактический ответ от API Gateway
export type ProjectsListResponse = BackendProjectItem[];

export const ProjectsApi = {
  list: (params: { limit?: number; offset?: number } = {}) =>
    http.get<ProjectsListResponse>('/api/projects', { query: params }),

  get: (id: string) => http.get<BackendProjectItem>(`/api/projects/${id}`),

  create: async (payload: { title: string; description: string; file?: File; filename?: string }) => {
    if (payload.file) {
      const base64File = await fileToBase64(payload.file);
      const requestData = {
        title: payload.title,
        description: payload.description,
        filename: payload.filename || payload.file.name,
        file: base64File
      };
      return http.post<BackendProjectItem>('/api/projects', requestData, { requireAuth: true });
    }
    // Если файл не загружен, отправляем пустые строки для обязательных полей
    const requestData = {
      title: payload.title,
      description: payload.description,
      filename: "",
      file: ""
    };
    return http.post<BackendProjectItem>('/api/projects', requestData, { requireAuth: true });
  },

  update: (id: string, payload: { title: string; description: string }) =>
    http.put<BackendProjectItem>(`/api/projects/${id}`, payload, { requireAuth: true }),

  delete: (id: string) => http.delete<{ id: string; message?: string }>(`/api/projects/${id}`, { requireAuth: true }),

  download: async (id: string) => {
    try {
      const response = await http.get<BackendProjectItem>(`/api/projects/${id}`);
      console.log('API ответ для скачивания:', response);
      return response;
    } catch (error) {
      console.error('Ошибка API при скачивании:', error);
      throw error;
    }
  },
};
