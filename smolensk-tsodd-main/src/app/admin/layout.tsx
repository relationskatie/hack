'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/features/auth';
import { AdminSidebar } from '@/shared/components/admin/AdminSidebar';
import { AdminHeader } from '@/shared/components/admin/AdminHeader';
import { Box, useMediaQuery, useTheme } from '@mui/material';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'editor']}>
      <Box
        className="flex h-screen bg-gray-100"
        sx={{
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        <AdminSidebar
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
          isMobile={isMobile}
        />
        <Box
          component="main"
          className="flex-grow flex flex-col"
          sx={{
            height: '100vh',
            overflow: 'hidden',
            transition: 'margin-left 0.3s ease'
          }}
        >
          {/* Заголовок с поиском и пользователем */}
          <AdminHeader 
            onMenuToggle={isMobile ? handleDrawerToggle : undefined}
          />

          {/* Прокручиваемый контент */}
          <Box
            className="flex-grow overflow-y-auto"
            sx={{
              padding: isMobile ? 2 : 3,
              height: '100%'
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}