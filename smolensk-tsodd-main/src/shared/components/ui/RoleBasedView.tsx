'use client';

import React from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { UserRole } from '@/features/auth/types/auth.types';

interface RoleBasedViewProps {
  children: React.ReactNode;
  allowedRoles: UserRole | UserRole[];
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export const RoleBasedView: React.FC<RoleBasedViewProps> = ({
  children,
  allowedRoles,
  fallback = null,
  requireAuth = true,
}) => {
  const { user, isAuthenticated } = useAuth();

  // Если требуется авторизация, но пользователь не авторизован
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // Если пользователь не авторизован и авторизация не требуется
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Проверяем роли
  const hasAccess = Array.isArray(allowedRoles)
    ? allowedRoles.includes(user!.role)
    : user!.role === allowedRoles;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Хук для проверки ролей
export const useRoleCheck = () => {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!isAuthenticated || !user) return false;
    
    return Array.isArray(role)
      ? role.includes(user.role)
      : user.role === role;
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isEditor = (): boolean => hasRole(['admin', 'editor']);
  const isGuest = (): boolean => hasRole('guest');

  return {
    hasRole,
    isAdmin,
    isEditor,
    isGuest,
    user,
    isAuthenticated,
  };
};
