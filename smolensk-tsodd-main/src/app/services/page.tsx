'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { ServicesApi, type ShortServiceInfo } from '@/features/services/services.api';
import { Alert } from '@mui/material';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { HoverCard } from '@/shared/components/ui/HoverCard';
import { UnifiedFilterPanel } from '@/shared/components/ui/UnifiedFilterPanel';
import AppButton from '@/shared/components/ui/AppButton';


export default function ServicesPage() {
  const [items, setItems] = useState<ShortServiceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    ServicesApi.list({ limit: 50, offset: 0 })
      .then((r) => setItems(r.services))
      .catch((e) => setError(e?.message || 'Не удалось загрузить услуги'));
  }, []);

  // Фильтрованный список услуг
  const filteredItems = useMemo(() => {
    if (!searchValue.trim()) return items;

    const searchTerm = searchValue.toLowerCase().trim();
    return items.filter(service =>
      service.tittle.toLowerCase().includes(searchTerm) ||
      service.description.toLowerCase().includes(searchTerm)
    );
  }, [items, searchValue]);
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <SectionHeader
        title="Наши услуги"
        subtitle={(
          <>ЦОДД Смоленской области предоставляет широкий спектр услуг для организаций и частных лиц</>
        )}
        align="center"
        spacingBottom={6}
        maxSubtitleWidth={768}
      />

      {error && (
        <Alert severity="error" className="mb-4">{error}</Alert>
      )}

      {/* Панель поиска */}
      <UnifiedFilterPanel
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Поиск услуг по названию или описанию..."
        showFilters={false}
        showSort={false}
        showClearButton={false}
        sx={{ mb: 4 }}
      />

      {/* Результаты поиска */}
      {searchValue && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Найдено услуг: {filteredItems.length}
        </Typography>
      )}

      <Grid container spacing={3}>
        {filteredItems.map((service) => (
          <Grid size={{ xs: 12 }} key={service.id}>
            <HoverCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: { xs: 'stretch', sm: 'center' }, 
                  justifyContent: 'space-between', 
                  gap: 3,
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  {/* Основная информация */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      {service.tittle}
                    </Typography>

                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
                      {service.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Chip
                        icon={<MoneyIcon />}
                        label={`${service.price.toLocaleString('ru-RU')} ₽`}
                        size="small"
                        sx={{ bgcolor: 'primary.50', color: 'primary.main' }}
                      />
                      <Chip
                        icon={<ScheduleIcon />}
                        label={service.need_schedule ? 'По расписанию' : 'По заявке'}
                        size="small"
                        sx={{ bgcolor: 'grey.100' }}
                      />
                    </Box>
                  </Box>

                  {/* Кнопка действия */}
                  <Box sx={{ 
                    minWidth: { xs: 'auto', sm: '160px' },
                    width: { xs: '100%', sm: 'auto' }
                  }}>
                    <Link href={`/services/${service.id}`} passHref>
                      <AppButton
                        styleType="primary"
                        endIcon={<ArrowForwardIcon />}
                        sx={{ width: '100%' }}
                      >
                        Подробнее
                      </AppButton>
                    </Link>
                  </Box>
                </Box>
              </CardContent>
            </HoverCard>
          </Grid>
        ))}
      </Grid>

      {/* Сообщение об отсутствии результатов */}
      {filteredItems.length === 0 && searchValue && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            Услуги не найдены
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Попробуйте изменить поисковый запрос
          </Typography>
        </Box>
      )}

      {/* Контактная информация */}
      <Box className="mt-16 p-8 bg-gradient-to-r from-primary-main to-primary-dark text-white rounded-2xl">
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Нужна консультация?
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              Наши специалисты готовы ответить на все ваши вопросы
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Звоните с 8:00 до 20:00 по будням, круглосуточно для экстренных случаев
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ 
            textAlign: { xs: 'center', md: 'right' },
            display: 'flex',
            justifyContent: { xs: 'center', md: 'flex-end' },
            alignItems: 'center'
          }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PhoneIcon />}
              sx={{ 
                bgcolor: 'common.white', 
                color: 'primary.main', 
                '&:hover': { bgcolor: 'grey.100' },
                width: { xs: '100%', md: 'auto' }
              }}
            >
              +7 (4812) 12-34-56
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}