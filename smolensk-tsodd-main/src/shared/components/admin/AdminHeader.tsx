'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Assignment as OrdersIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { AdminSearch } from '@/shared/components/common/AdminSearch';
import { Comfortaa } from 'next/font/google';

const comfortaa = Comfortaa({ weight: ['700'], subsets: ['latin', 'cyrillic'] });

interface AdminHeaderProps {
  title?: string;
  onMenuToggle?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  title = 'Админ панель',
  onMenuToggle 
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    router.push('/');
  };

  const handleMyOrders = () => {
    handleUserMenuClose();
    router.push('/orders');
  };

  const handleGoHome = () => {
    handleUserMenuClose();
    router.push('/');
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{ 
          bgcolor: 'common.white', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
          borderColor: 'divider',
          zIndex: 1200,
          borderRadius: 0
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          {/* Кнопка меню для мобильных */}
          {isMobile && onMenuToggle && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="открыть меню"
              onClick={onMenuToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon className="text-gray-700" />
            </IconButton>
          )}

          <Box className="flex-grow flex items-center gap-4">
            <Typography 
              variant="h6" 
              className={comfortaa.className}
              sx={{ 
                fontFamily: comfortaa.style.fontFamily, 
                fontWeight: 700, 
                color: 'text.primary',
                fontSize: '18px'
              }}
            >
              {title}
            </Typography>
          </Box>

          <Box className="flex items-center gap-2">
            <IconButton
              onClick={() => setSearchOpen(true)}
              sx={{ color: 'text.primary' }}
              aria-label="поиск"
            >
              <SearchIcon />
            </IconButton>

            <IconButton
              onClick={handleUserMenuOpen}
              sx={{ color: 'text.primary' }}
              aria-label="меню пользователя"
            >
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                {user?.name?.[0] || 'A'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleUserMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem disabled>
            <Typography variant="body2" className="font-medium">
              {user?.name} ({user?.role === 'admin' ? 'Администратор' : 'Редактор'})
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleGoHome}>
            <HomeIcon className="mr-2" fontSize="small" />
            Вернуться на главную
          </MenuItem>
          <MenuItem onClick={handleMyOrders}>
            <OrdersIcon className="mr-2" fontSize="small" />
            Мои заказы
          </MenuItem>
          <MenuItem onClick={() => { handleUserMenuClose(); router.push('/admin'); }}>
            <DashboardIcon className="mr-2" fontSize="small" />
            Главная панель
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon className="mr-2" fontSize="small" />
            Выйти
          </MenuItem>
        </Menu>
      </AppBar>

      <AdminSearch 
        open={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />
    </>
  );
};
