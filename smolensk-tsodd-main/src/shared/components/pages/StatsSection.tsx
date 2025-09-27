'use client';

import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const stats = [
  {
    label: 'Снижение аварийности',
    value: '23%',
    trend: 'down',
    period: 'за 2024 год',
    description: 'благодаря умному управлению светофорами',
  },
  {
    label: 'Средняя скорость потока',
    value: '+15%',
    trend: 'up',
    period: 'в час пик',
    description: 'оптимизация фаз светофоров',
  },
  {
    label: 'Время реагирования',
    value: '12 мин',
    trend: 'down',
    period: 'на инциденты',
    description: 'благодаря системе мониторинга',
  },
  {
    label: 'Обработано нарушений',
    value: '45,678',
    trend: 'up',
    period: 'за месяц',
    description: 'системой фотовидеофиксации',
  },
];

export const StatsSection: React.FC = () => {
  return (
    <Box className="py-16 bg-gradient-to-r from-primary-main to-primary-dark text-white">
      <Container maxWidth="lg">
        <SectionHeader
          title="Результаты нашей работы"
          subtitle="Цифры, которые говорят сами за себя"
          align="center"
          spacingBottom={6}
        />

        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Paper 
                elevation={0}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(12px)',
                  p: 3,
                  height: '100%',
                  border: '1px solid rgba(255,255,255,0.20)',
                  transition: 'background-color .2s ease',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
                }}
              >
                <Box className="flex items-start justify-between mb-2">
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                  {stat.trend === 'up' ? (
                    <TrendingUp sx={{ color: 'success.light' }} />
                  ) : (
                    <TrendingDown sx={{ color: 'error.light' }} />
                  )}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {stat.label}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 1 }}>
                  {stat.period}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {stat.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default StatsSection;