'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole, LoginCredentials } from '../types/auth.types';
import { authApi } from '../api/auth.api';
import { isTokenExpired } from '../../../shared/utils/tokenUtils';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  forceLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Маппинг ролей с бэкенда на фронтенд
const mapBackendRoleToFrontend = (backendRole: string): UserRole => {
  switch (backendRole) {
    case 'admin':
      return 'admin';
    case 'editor':
      return 'editor';
    case 'user':
      return 'guest';
    default:
      return 'guest';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Функция для проверки валидности токена
  const isTokenValid = useCallback((token: string): boolean => {
    try {
      if (!token || typeof token !== 'string') return false;
      
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      return !isTokenExpired(token);
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    // Проверяем сохраненную сессию
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('auth_token');
    
    if (savedUser && savedToken) {
      try {
        // Проверяем валидность токена
        if (!isTokenValid(savedToken)) {
          console.log('Token expired, clearing session');
          localStorage.removeItem('user');
          localStorage.removeItem('auth_token');
          setUser(null);
        } else {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        // Очищаем поврежденные данные
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    }
    setIsLoading(false);
  }, [isTokenValid]);

  // Слушаем события истечения токена
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Token expired event received');
      setUser(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tokenExpired', handleTokenExpired);
      return () => {
        window.removeEventListener('tokenExpired', handleTokenExpired);
      };
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    
    try {
      // Выполняем запрос к API
      const response = await authApi.login(credentials);
      
      // Сохраняем токен
      localStorage.setItem('auth_token', response.token);
      
      // Создаем объект пользователя на основе данных из формы
      // В будущем можно получить полную информацию о пользователе через отдельный endpoint
      const getUserInfo = (username: string) => {
        switch (username) {
          case 'admin':
            return {
              id: username,
              role: 'admin' as UserRole,
              name: 'Администратор',
              email: 'admin@tsodd.ru',
            };
          case 'editor':
            return {
              id: username,
              role: 'editor' as UserRole,
              name: 'Редактор',
              email: 'editor@tsodd.ru',
            };
          case 'test_user':
            return {
              id: username,
              role: 'guest' as UserRole,
              name: 'Пользователь',
              email: 'user@tsodd.ru',
            };
          default:
            return {
              id: username,
              role: 'guest' as UserRole,
              name: 'Пользователь',
              email: `${username}@tsodd.ru`,
            };
        }
      };

      const userInfo = getUserInfo(credentials.username);
      const user: User = {
        id: userInfo.id,
        username: credentials.username,
        role: userInfo.role,
        name: userInfo.name,
        email: userInfo.email,
      };
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      throw new Error('Неверный логин или пароль');
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    authApi.logout();
  }, []);

  const forceLogout = useCallback(() => {
    console.log('Force logout due to token expiry');
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Перенаправляем на страницу входа
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }, []);

  const hasRole = useCallback((role: UserRole | UserRole[]) => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }, [user]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    forceLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
