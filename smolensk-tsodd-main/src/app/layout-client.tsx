'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Fade from '@mui/material/Fade';
import { AuthProvider } from '@/features/auth';
import { NotificationProvider, useNotification } from '@/shared/contexts';
import { Header, Footer } from '@/shared/components/layout';
import { usePathname, useSearchParams } from 'next/navigation';
import { LoadingScreen } from '@/shared/components/common';
import { theme } from '@/shared/utils/theme';

function TokenExpiryHandler() {
  const { showNotification } = useNotification();

  useEffect(() => {
    const handleTokenExpired = (event: CustomEvent) => {
      showNotification(event.detail.message, 'warning', 8000);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tokenExpired', handleTokenExpired as EventListener);
      return () => {
        window.removeEventListener('tokenExpired', handleTokenExpired as EventListener);
      };
    }
  }, [showNotification]);

  return null;
}

function LoadingLogic({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, searchParams.toString()]);

  // Дополнительная защита от застревания в состоянии загрузки
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Максимум 3 секунды загрузки

    return () => clearTimeout(safetyTimer);
  }, [isLoading]);

  // Показываем лоадер при начале навигации
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsLoading(true);
    };

    const handlePopState = () => {
      setIsLoading(true);
    };

    // Отслеживаем клики по ссылкам
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      if (link && !link.hasAttribute('target')) {
        const href = link.getAttribute('href');
        if (href) {
          try {
            // Создаем URL объекты для корректного сравнения
            const currentUrl = new URL(window.location.href);
            const linkUrl = new URL(href, window.location.origin);

            // Сравниваем только pathname, игнорируя query параметры и hash
            const currentPath = currentUrl.pathname;
            const linkPath = linkUrl.pathname;

            // Если ссылка ведет на ту же страницу, не показываем лоадер
            if (linkPath === currentPath) {
              return;
            }

            setIsLoading(true);
          } catch (error) {
            // Если не удалось создать URL (например, относительная ссылка), 
            // используем простую проверку
            const currentPath = pathname;
            const linkPath = href.startsWith('/') ? href : `/${href}`;

            if (linkPath === currentPath) {
              return;
            }

            setIsLoading(true);
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleLinkClick);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleLinkClick);
    };
  }, [pathname]);

  // Проверяем, находимся ли мы на админ странице
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <Box className={`min-h-screen flex flex-col ${isAdminPage ? '' : 'mt-[60px]'}`}>
      <Fade in={isLoading} timeout={300} unmountOnExit appear={false}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
          }}
        >
          <LoadingScreen />
        </Box>
      </Fade>
      {!isAdminPage && <Header />}
      <Box component="main" className="flex-grow">
        {children}
      </Box>
      {!isAdminPage && <Footer />}
    </Box>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <TokenExpiryHandler />
          <Suspense fallback={<LoadingScreen />}>
            <LoadingLogic>{children}</LoadingLogic>
          </Suspense>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}