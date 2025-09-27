import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { DirectionsCar as CarIcon } from '@mui/icons-material';
import Link from 'next/link';
import AppButton from '@/shared/components/ui/AppButton';

export default function CTASection() {
  return (
    <Box className="py-16 bg-primary-main text-white">
      <Container maxWidth="lg">
        <Box className="text-center flex flex-col gap-2">
          <Typography variant="h3" className="font-bold">
            Нужна помощь на дороге?
          </Typography>
          <Typography variant="h6" className="opacity-90">
            Мы работаем круглосуточно для вашей безопасности
          </Typography>
          <Box className="flex gap-4 justify-center flex-wrap mt-4">
            <Link href="/services/evacuation" passHref>
              <AppButton styleType="whiteOnPrimary" size="large" startIcon={<CarIcon />}>
                Вызвать эвакуатор
              </AppButton>
            </Link>
            <Link href="/contacts" passHref>
              <AppButton styleType="outlinedWhite" size="large">
                Связаться с нами
              </AppButton>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
