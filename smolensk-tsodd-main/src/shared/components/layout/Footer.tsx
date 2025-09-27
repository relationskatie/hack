'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Link as MuiLink, Grid, IconButton } from '@mui/material';
import LinkColumn from '@/shared/components/ui/LinkColumn';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Telegram as TelegramIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { ContactsApi, type BackendContactItem } from '@/features/contacts/services/contacts.api';

export const Footer: React.FC = () => {
  const [contacts, setContacts] = useState<BackendContactItem[]>([]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const { items } = await ContactsApi.list({ limit: 10, offset: 0 });
        if (ignore) return;
        setContacts(items || []);
      } catch {
        setContacts([]);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  // Get first contact for main display, or use fallback
  const mainContact = contacts[0];
  const mainPhone = mainContact?.phones?.[0] || '+7 (4812) 12-34-56';
  const mainEmail = mainContact?.emails?.[0] || 'info@tsodd-smolensk.ru';
  const mainAddress = mainContact?.addresses?.[0] || '214000, г. Смоленск,\nул. Дзержинского, д. 23';

  return (
    <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'common.white', mt: 'auto' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              ЦОДД Смоленской области
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.300', mb: 2 }}>
              Центр организации дорожного движения работает для повышения безопасности
              и комфорта на дорогах региона.
            </Typography>
            <Box className="flex gap-2">
              <IconButton sx={{ color: 'common.white', '&:hover': { color: 'primary.main' } }} size="small">
                <TelegramIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <LinkColumn
              title="Разделы"
              links={[
                { href: '/about', label: 'О ЦОДД' },
                { href: '/projects', label: 'Проекты' },
                { href: '/news', label: 'Новости' },
                { href: '/documents', label: 'Документы' },
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <LinkColumn
              title="Услуги"
              links={[
                { href: '/services/evacuation', label: 'Эвакуация' },
                { href: '/services/rent', label: 'Аренда автовышки' },
                { href: '/services/projects', label: 'Проектирование' },
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <LinkColumn
              title="Информация"
              links={[
                { href: '/analytics', label: 'Аналитика' },
                { href: '/infrastructure-map', label: 'Карта объектов' },
                { href: '/brandbook', label: 'Брендбук' },
                { href: '/contacts', label: 'Контакты' },
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
              Контакты
            </Typography>
            <Box className="flex flex-col gap-3">
              <Box className="flex items-center gap-2">
                <PhoneIcon fontSize="small" />
                <Typography variant="body2" sx={{ color: 'grey.300' }}>
                  {mainPhone}
                </Typography>
              </Box>
              <Box className="flex items-center gap-2">
                <EmailIcon fontSize="small" />
                <Typography variant="body2" sx={{ color: 'grey.300' }}>
                  {mainEmail}
                </Typography>
              </Box>
              <Box className="flex items-start gap-2">
                <LocationIcon fontSize="small" sx={{ mt: 0.5 }} />
                <Typography variant="body2" sx={{ color: 'grey.300' }}>
                  {mainAddress.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < mainAddress.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ borderTop: '1px solid', borderColor: 'grey.800', mt: 4, pt: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" sx={{ color: 'grey.400', textAlign: { xs: 'center', md: 'left' } }}>
                © 2024 ЦОДД Смоленской области. Все права защищены.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="flex gap-4 justify-center md:justify-end">
                <MuiLink
                  component={Link}
                  href="/privacy"
                  sx={{ color: 'grey.400', '&:hover': { color: 'common.white' }, textDecoration: 'none', fontSize: '0.875rem' }}
                >
                  Политика конфиденциальности
                </MuiLink>
                <MuiLink
                  component={Link}
                  href="/sitemap"
                  sx={{ color: 'grey.400', '&:hover': { color: 'common.white' }, textDecoration: 'none', fontSize: '0.875rem' }}
                >
                  Карта сайта
                </MuiLink>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;