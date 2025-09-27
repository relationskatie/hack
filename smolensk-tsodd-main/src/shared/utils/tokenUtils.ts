/**
 * Утилиты для работы с JWT токенами
 */

export interface TokenPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: any;
}

/**
 * Декодирует JWT токен и возвращает payload
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}

/**
 * Проверяет, истек ли токен
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Получает время истечения токена в читаемом формате
 */
export function getTokenExpiryTime(token: string): Date | null {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return null;
  
  return new Date(payload.exp * 1000);
}

/**
 * Получает оставшееся время жизни токена в секундах
 */
export function getTokenTimeLeft(token: string): number {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return 0;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const timeLeft = payload.exp - currentTime;
  
  return Math.max(0, timeLeft);
}

/**
 * Создает тестовый токен с заданным временем истечения (для тестирования)
 */
export function createTestToken(expiryMinutes: number = 1): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'test_user',
    exp: Math.floor(Date.now() / 1000) + (expiryMinutes * 60),
    iat: Math.floor(Date.now() / 1000)
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = 'test_signature';
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
