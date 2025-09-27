'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Alert, CircularProgress } from '@mui/material';
import { VacanciesApi, type BackendVacancyItem } from '@/features/vacancies/services/vacancies.api';
import VacanciesTable from '@/shared/components/pages/VacanciesTable';

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState<BackendVacancyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVacancies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await VacanciesApi.listActive({ limit: 100, offset: 0 });
      setVacancies(response.items || []);
    } catch (e: any) {
      console.error('Ошибка загрузки вакансий:', e);
      setError(e?.message || 'Не удалось загрузить вакансии');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVacancies();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box className="mb-8">
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          Вакансии
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '600px' }}>
          Присоединяйтесь к нашей команде! Мы предлагаем интересные возможности для профессионального роста и развития.
        </Typography>
      </Box>

      <VacanciesTable
        vacancies={vacancies}
        loading={loading}
        error={error}
        onRefresh={loadVacancies}
      />
    </Container>
  );
}
