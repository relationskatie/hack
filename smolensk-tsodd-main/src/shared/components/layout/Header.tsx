'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  Collapse,
} from '@mui/material';
import AppButton from '@/shared/components/ui/AppButton';
import {
  Menu as MenuIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Assignment as OrdersIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { GlobalSearch } from '@/shared/components/common/GlobalSearch';
import { Comfortaa } from 'next/font/google';
import Image from 'next/image';

const comfortaa = Comfortaa({ weight: ['700'], subsets: ['latin', 'cyrillic'] });

const menuItems = [
  { label: 'Главная', href: '/' },
  {
    label: 'Информация', href: '/about', submenu: [
      { label: 'О ЦОДД', href: '/about' },
      { label: 'Новости', href: '/news' },
      { label: 'Документы', href: '/documents' },
      { label: 'Вакансии', href: '/vacancies' },
    ]
  },
  {
    label: 'Услуги', href: '/services', submenu: [
      { label: 'Услуги', href: '/services' },
      { label: 'Проекты', href: '/projects' },
    ]
  },
  {
    label: 'Аналитика', href: '/analytics', submenu: [
      { label: 'Общая статистика', href: '/analytics' },
      { label: 'Штрафы', href: '/analytics/fines' },
      { label: 'Эвакуации', href: '/analytics/evacuations' },
      { label: 'ДТП', href: '/analytics/accidents' },
    ]
  },
  { label: 'Карта', href: '/infrastructure-map' },
  { label: 'Контакты', href: '/contacts' },
];

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  // Обработчик клика вне выпадающего меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const submenuContainers = document.querySelectorAll('[data-submenu-container]');

      let clickedInsideSubmenu = false;
      submenuContainers.forEach(container => {
        if (container.contains(target)) {
          clickedInsideSubmenu = true;
        }
      });

      if (!clickedInsideSubmenu) {
        setSubmenuOpen(null);
      }
    };

    if (submenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [submenuOpen]);

  // Закрываем меню при изменении роута
  useEffect(() => {
    setSubmenuOpen(null);
  }, [pathname]);

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

  const handleAdminPanel = () => {
    handleUserMenuClose();
    router.push('/admin');
  };

  const handleMyOrders = () => {
    handleUserMenuClose();
    router.push('/orders');
  };

  const isActivePage = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: 'common.white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', borderRadius: 0 }}>
        <Toolbar sx={{ minHeight: 70 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setMobileMenuOpen(true)}
            sx={{ mr: 1, display: { xs: 'block', lg: 'none' } }}
          >
            <MenuIcon className="text-gray-700" />
          </IconButton>

          <Link href="/" className="flex items-center no-underline">
            <Box className="flex items-center gap-3">
              <Image src="/logo.svg" alt="ЦОДД Смоленской области" width={40} height={40} />
              <Typography variant="h6" mt={1} className={comfortaa.className} sx={{ fontFamily: comfortaa.style.fontFamily, fontWeight: 700, color: 'text.primary' }}>
                <Box sx={{ display: { xs: 'block', md: 'none' }, lineHeight: 1.1, mt: '4px' }}>
                  ЦОДД
                  <br />
                  <span className="text-[11px]">Смоленской области</span>
                </Box>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>ЦОДД Смоленской области</Box>
              </Typography>
            </Box>
          </Link>

          <Box className="flex-grow" />

          <Box className="hidden gap-2 mr-4" sx={{ display: { xs: 'none', lg: 'flex' } }}>
            {menuItems.map((item) => {
              const isActive = isActivePage(item.href);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isSubmenuOpen = submenuOpen === item.label;

              if (hasSubmenu) {
                return (
                  <Box key={item.href} sx={{ position: 'relative' }} data-submenu-container>
                    <Button
                      onClick={() => setSubmenuOpen(isSubmenuOpen ? null : item.label)}
                      sx={{
                        color: isActive ? 'white' : 'text.primary',
                        fontWeight: isActive ? 600 : 400,
                        bgcolor: isActive ? 'primary.main' : 'transparent',
                        '&:hover': {
                          bgcolor: isActive ? 'primary.dark' : 'grey.100'
                        },
                        textTransform: 'none',
                        borderRadius: 1,
                        px: 2,
                        py: '4px'
                      }}
                    >
                      {item.label}
                      {isSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </Button>
                    {isSubmenuOpen && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          bgcolor: 'white',
                          boxShadow: 2,
                          borderRadius: 1,
                          minWidth: 200,
                          zIndex: 1000,
                          mt: 1
                        }}
                      >
                        {item.submenu?.map((subItem) => (
                          <Button
                            key={subItem.href}
                            component={Link}
                            href={subItem.href}
                            fullWidth
                            sx={{
                              justifyContent: 'flex-start',
                              textTransform: 'none',
                              px: 2,
                              py: 1,
                              color: isActivePage(subItem.href) ? 'primary.main' : 'text.primary',
                              fontWeight: isActivePage(subItem.href) ? 600 : 400,
                              '&:hover': {
                                bgcolor: 'grey.100'
                              }
                            }}
                          >
                            {subItem.label}
                          </Button>
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              }

              return (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    sx={{
                      color: isActive ? 'white' : 'text.primary',
                      fontWeight: isActive ? 600 : 400,
                      bgcolor: isActive ? 'primary.main' : 'transparent',
                      '&:hover': {
                        bgcolor: isActive ? 'primary.dark' : 'grey.100'
                      },
                      textTransform: 'none',
                      borderRadius: 1,
                      px: 2,
                      py: '4px'
                    }}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </Box>

          <IconButton
            onClick={() => setSearchOpen(true)}
            sx={{ color: 'text.primary' }}
          >
            <SearchIcon />
          </IconButton>

          {isAuthenticated ? (
            <>
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{ color: 'text.primary' }}
              >
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  {user?.name[0]}
                </Avatar>
              </IconButton>
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
                <MenuItem onClick={handleMyOrders}>
                  <OrdersIcon className="mr-2" fontSize="small" />
                  Мои заказы
                </MenuItem>
                {(user?.role === 'admin' || user?.role === 'editor') && (
                  <MenuItem onClick={handleAdminPanel}>
                    <DashboardIcon className="mr-2" fontSize="small" />
                    Панель управления
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon className="mr-2" fontSize="small" />
                  Выйти
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Link href="/login" passHref>
              <AppButton
                styleType="primary"
                startIcon={<LoginIcon />}
                sx={{
                  ml: 1,
                  minWidth: { xs: 40, md: 'auto' },
                  borderRadius: { xs: '50%', md: 1 },
                  '& .MuiButton-startIcon': {
                    margin: { xs: 0, md: '0 8px 0 -4px' }
                  },
                  aspectRatio: { xs: '1/1', md: 'auto' },
                  py: { xs: 0, md: 1 },
                  px: { xs: 0, md: 3 }
                }}
              >
                <Box sx={{ display: { xs: 'none', md: 'inline' } }}>
                  Войти
                </Box>
              </AppButton>
            </Link>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            borderRadius: 0
          }
        }}
      >
        <Box className="w-64 pt-4">
          <List>
            {menuItems.map((item) => {
              const isActive = isActivePage(item.href);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isSubmenuOpen = submenuOpen === item.label;

              if (hasSubmenu) {
                return (
                  <React.Fragment key={item.href}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => setSubmenuOpen(isSubmenuOpen ? null : item.label)}
                        sx={{
                          bgcolor: isActive ? 'primary.main' : 'transparent',
                          color: isActive ? 'white' : 'text.primary',
                          fontWeight: isActive ? 600 : 400,
                          '&:hover': {
                            bgcolor: isActive ? 'primary.dark' : 'grey.100',
                            color: isActive ? 'white' : 'text.primary'
                          },
                          borderLeft: isActive ? 4 : 0,
                          borderColor: isActive ? 'primary.main' : 'transparent',
                          pl: isActive ? 2 : 3
                        }}
                      >
                        <ListItemText primary={item.label} />
                        {isSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>
                    </ListItem>
                    <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.submenu?.map((subItem) => (
                          <ListItem key={subItem.href} disablePadding>
                            <ListItemButton
                              component={Link}
                              href={subItem.href}
                              onClick={() => setMobileMenuOpen(false)}
                              sx={{
                                pl: 4,
                                bgcolor: 'transparent',
                                color: isActivePage(subItem.href) ? 'primary.main' : 'text.primary',
                                fontWeight: isActivePage(subItem.href) ? 600 : 400,
                                '&:hover': {
                                  bgcolor: 'grey.100'
                                }
                              }}
                            >
                              <ListItemText primary={subItem.label} />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </React.Fragment>
                );
              }

              return (
                <ListItem key={item.href} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    sx={{
                      bgcolor: isActive ? 'primary.main' : 'transparent',
                      color: isActive ? 'white' : 'text.primary',
                      fontWeight: isActive ? 600 : 400,
                      '&:hover': {
                        bgcolor: isActive ? 'primary.dark' : 'grey.100',
                        color: isActive ? 'white' : 'text.primary'
                      },
                      borderLeft: isActive ? 4 : 0,
                      borderColor: isActive ? 'primary.main' : 'transparent',
                      pl: isActive ? 2 : 3
                    }}
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;