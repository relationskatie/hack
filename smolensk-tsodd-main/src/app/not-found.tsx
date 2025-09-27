'use client';

import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import AppButton from '@/shared/components/ui/AppButton';
import { Home as HomeIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function NotFound() {

  return (
    <Container maxWidth="sm" className="py-16">
      <Box className="text-center">
        <Typography
          variant="h1"
          className="font-bold text-9xl text-gray-200"
          sx={{ mb: '16px' }}
        >
          404
        </Typography>

        <Typography variant="h4" className="font-bold" sx={{ mb: '16px' }}>
          Страница не найдена
        </Typography>

        <Typography variant="body1" className="text-gray-600" sx={{ mb: '32px' }}>
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </Typography>

        <Box className="flex gap-3 justify-center">
          <Link href="/" passHref>
            <AppButton styleType="primary" startIcon={<HomeIcon />}>На главную</AppButton>
          </Link>
        </Box>

        <Box className="mt-12 p-6 bg-gray-50 rounded-lg">
          <Typography variant="subtitle1" className="font-semibold" sx={{ mb: '12px' }}>
            Возможно, вы искали:
          </Typography>
          <Box className="flex flex-col gap-2">
            <Link href="/services" className="text-primary-main hover:underline">
              Услуги ЦОДД
            </Link>
            <Link href="/analytics" className="text-primary-main hover:underline">
              Статистика дорожного движения
            </Link>
            <Link href="/contacts" className="text-primary-main hover:underline">
              Контактная информация
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}