import { isTokenExpired } from '../utils/tokenUtils';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | Array<string | number | boolean> | undefined>;
  body?: unknown;
  isFormData?: boolean;
  requireAuth?: boolean;
}

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
};

function buildQueryString(query: RequestOptions['query']): string {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => {
        params.append(key, String(v));
      });
    } else {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function getBaseUrl(): string {
  // В продакшене на Vercel используем относительные пути для проксирования
  // В разработке можно использовать переменную окружения
  if (process.env.NODE_ENV === 'production') {
    return ''; // Используем относительные пути для Vercel proxy
  }
  
  // Для локальной разработки используем переменную окружения или дефолтный URL
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  return '';
}

function getAuthToken(): string | null {
  try {
    const stored = localStorage.getItem('auth_token');
    if (stored) return stored;
    // Backward compatibility with mock user: if user exists but no token, skip header
    return null;
  } catch {
    return null;
  }
}

// Функция для очистки токена и перенаправления на страницу входа
function handleTokenExpiry() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  
  // Показываем уведомление пользователю
  if (typeof window !== 'undefined') {
    // Создаем событие для уведомления о истечении токена
    const event = new CustomEvent('tokenExpired', {
      detail: { message: 'Сессия истекла. Пожалуйста, войдите в систему заново.' }
    });
    window.dispatchEvent(event);
  }
  
  // Перенаправляем на страницу входа только если мы не на ней уже
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}

// Функция для проверки валидности токена
function isTokenValid(token: string): boolean {
  try {
    if (!token || typeof token !== 'string') return false;
    
    // JWT токен должен иметь 3 части, разделенные точками
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Проверяем, не истек ли токен
    return !isTokenExpired(token);
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}${buildQueryString(options.query)}`;

  const headers: Record<string, string> = { ...DEFAULT_HEADERS, ...(options.headers || {}) };

  if (options.isFormData) {
    delete headers['Content-Type'];
  }

  if (options.requireAuth) {
    const token = getAuthToken();
    if (token) {
      // Проверяем валидность токена перед отправкой запроса
      if (!isTokenValid(token)) {
        handleTokenExpiry();
        throw new Error('Токен истек. Пожалуйста, войдите в систему заново.');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const init: RequestInit = {
    method: options.method || 'GET',
    headers,
    body: options.body
      ? options.isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body)
      : undefined,
    credentials: 'include',
  };

  const res = await fetch(url, init);
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    
    // Обрабатываем ошибку 401 (Unauthorized) - истекший токен
    if (res.status === 401) {
      handleTokenExpiry();
      throw new Error('Сессия истекла. Пожалуйста, войдите в систему заново.');
    }
    
    throw new Error(`API ${res.status}: ${errorText || res.statusText}`);
  }
  // Some endpoints may return empty
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return (await res.text()) as T;
  }
  return (await res.json()) as T;
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
};


