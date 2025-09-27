import { http } from '@/shared/api/client';
import { LoginCredentials } from '../types/auth.types';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserInfo {
  id: string;
  username: string;
  role: string;
  name: string;
  email?: string;
}

export const authApi = {
  /**
   * Вход в систему
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const request: LoginRequest = {
      login: credentials.username,
      password: credentials.password,
    };
    
    return http.post<LoginResponse>('/api/login', request);
  },

  /**
   * Получение информации о пользователе из токена
   * (в будущем можно добавить отдельный endpoint для этого)
   */
  getCurrentUser: async (): Promise<UserInfo | null> => {
    // Пока возвращаем null, так как отдельного endpoint для получения пользователя нет
    // В будущем можно добавить /api/me endpoint
    return null;
  },

  /**
   * Выход из системы (очистка токена на клиенте)
   */
  logout: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
};
