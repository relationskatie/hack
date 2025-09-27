'use client';

import React from 'react';
import { Box, Container, Typography, Button, Grid } from '@mui/material';
import AppButton from '@/shared/components/ui/AppButton';
import KPIGrid from '@/shared/components/ui/KPIGrid';
import { PlayArrow as PlayIcon, ArrowForward as ArrowForwardIcon, TrendingUp } from '@mui/icons-material';
import Link from 'next/link';

export const HeroSection: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        color: 'common.white',
        py: { xs: 10, md: 20 },
        overflow: 'hidden',
        minHeight: 'calc(95vh - 100px)',
        backgroundImage: "linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0.2)), url('/desktop_hero_bg2.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Декоративные элементы */}
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 80%)',
          top: '20%',
          left: '100px',
          zIndex: 10,
          pointerEvents: 'none',
          display: { xs: 'none', md: 'block' },
        }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: 'text.primary',
                fontSize: { xs: '2.25rem', md: '3rem', lg: '3.75rem' },
                lineHeight: 1.1,
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              Умные дороги для безопасного будущего
            </Typography>
            <Typography
              variant="h5"
              sx={{ mb: 4, opacity: 0.9, fontWeight: 300, color: 'text.primary', textAlign: { xs: 'center', md: 'left' } }}
            >
              Центр организации дорожного движения Смоленской области использует
              передовые технологии для создания комфортной городской среды
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Link href="/services" passHref>
                <AppButton styleType='primary' size="large" endIcon={<ArrowForwardIcon />}>Наши услуги</AppButton>
              </Link>
              <Link href="/analytics" passHref>
                <AppButton styleType='whiteOnPrimary' size="large" startIcon={<TrendingUp />}>Статистика</AppButton>
              </Link>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: 'relative', color: 'text.primary' }}>
              <Box sx={{
                backgroundColor: 'rgba(255,255,255,0.10)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                p: 3,
                border: '1px solid rgba(255,255,255,0.20)'
              }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Ключевые показатели
                </Typography>
                <KPIGrid
                  items={[
                    { value: '24/7', label: 'Круглосуточный мониторинг' },
                    { value: '156', label: 'Камер видеофиксации' },
                    { value: '98%', label: 'Исправных светофоров' },
                    { value: '15', label: 'Минут - время реакции' },
                  ]}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;