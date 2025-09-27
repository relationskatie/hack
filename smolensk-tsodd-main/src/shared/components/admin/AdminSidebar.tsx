'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  DirectionsCar as CarIcon,
  CameraAlt as CameraIcon,
  Traffic as TrafficIcon,
  Description as DocumentIcon,
  Work as WorkIcon,
  ContactPhone as ContactIcon,
  BusinessCenter as ServicesIcon,
  ShoppingCart as OrdersIcon,
  Folder as ProjectsIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, type UserRole } from '@/features/auth';
import Image from 'next/image';
import { Comfortaa } from 'next/font/google';

const comfortaa = Comfortaa({ weight: ['700'], subsets: ['latin', 'cyrillic'] });

const menuItems: Array<{
  title: string;
  icon: React.ReactElement;
  href: string;
  roles: UserRole[];
}> = [
    {
      title: 'Главная',
      icon: <DashboardIcon />,
      href: '/admin',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Новости',
      icon: <ArticleIcon />,
      href: '/admin/news',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Проекты',
      icon: <ProjectsIcon />,
      href: '/admin/projects',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Документы',
      icon: <DocumentIcon />,
      href: '/admin/documents',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Вакансии',
      icon: <PeopleIcon />,
      href: '/admin/vacancies',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Контакты',
      icon: <ContactIcon />,
      href: '/admin/contacts',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Услуги',
      icon: <ServicesIcon />,
      href: '/admin/services',
      roles: ['admin'],
    },
    {
      title: 'Заказы',
      icon: <OrdersIcon />,
      href: '/admin/orders',
      roles: ['admin'],
    },
  ];

const drawerWidth = 280;

interface AdminSidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  isMobile: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen,
  onDrawerToggle,
  isMobile
}) => {
  const pathname = usePathname();
  const { user, hasRole } = useAuth();
  const theme = useTheme();

  const filteredMenuItems = menuItems.filter(item =>
    hasRole(item.roles)
  );

  const handleDrawerToggle = () => {
    if (isMobile) {
      onDrawerToggle();
    }
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? mobileOpen : true}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: isMobile ? 'fixed' : 'fixed',
          height: '100vh',
          zIndex: isMobile ? theme.zIndex.drawer : theme.zIndex.appBar - 1,
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        className="flex flex-col h-full"
        sx={{ height: '100vh' }}
      >
        {/* Логотип - фиксированный */}
        <Box className="p-4 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 no-underline mb-4">
            <Image src="/logo.svg" alt="ЦОДД Смоленской области" width={32} height={32} />
            <Typography
              variant="h6"
              className={comfortaa.className}
              sx={{
                fontFamily: comfortaa.style.fontFamily,
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '14px',
                lineHeight: 1.2,
                mt: 1
              }}
            >
              ЦОДД
            </Typography>
          </Link>
          <Divider />
        </Box>

        {/* Меню - прокручиваемое */}
        <Box className="flex-grow overflow-y-auto">
          <List>
            {filteredMenuItems.map((item) => (
              <ListItem key={item.href} disablePadding>
                <Link href={item.href} passHref className="w-full no-underline">
                  <ListItemButton
                    selected={pathname === item.href}
                    className={pathname === item.href ? 'bg-primary-main/10' : ''}
                    onClick={isMobile ? handleDrawerToggle : undefined}
                  >
                    <ListItemIcon
                      className={pathname === item.href ? 'text-primary-main' : 'text-gray-600'}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      className={pathname === item.href ? 'text-primary-main' : ''}
                    />
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;

