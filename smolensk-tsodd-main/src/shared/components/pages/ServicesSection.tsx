'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { HoverCard } from '@/shared/components/ui/HoverCard';
import AppButton from '@/shared/components/ui/AppButton';
import { ServicesApi, ShortServiceInfo } from '@/features/services/services.api';
import Link from 'next/link';

export const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<ShortServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await ServicesApi.list({ limit: 3 });
        setServices(response.services);
      } catch (err) {
        console.error('Ошибка загрузки услуг:', err);
        setError('Не удалось загрузить услуги');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <Box className="py-16 bg-gray-50">
        <Container maxWidth="lg">
          <SectionHeader
            title="Наши услуги"
            subtitle="Мы предоставляем широкий спектр услуг для обеспечения безопасности и комфорта дорожного движения"
            align="center"
            spacingBottom={6}
            maxSubtitleWidth={672}
          />
          <Grid container spacing={4}>
            {[...Array(3)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <Box className="animate-pulse">
                      <Box className="h-6 bg-gray-200 rounded mb-3"></Box>
                      <Box className="h-4 bg-gray-200 rounded mb-2"></Box>
                      <Box className="h-4 bg-gray-200 rounded mb-4 w-3/4"></Box>
                      <Box className="h-8 bg-gray-200 rounded w-24"></Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="py-16 bg-gray-50">
        <Container maxWidth="lg">
          <SectionHeader
            title="Наши услуги"
            subtitle="Мы предоставляем широкий спектр услуг для обеспечения безопасности и комфорта дорожного движения"
            align="center"
            spacingBottom={6}
            maxSubtitleWidth={672}
          />
          <Box className="text-center py-8">
            <Typography variant="body1" className="text-gray-600">
              {error}
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="py-16 bg-gray-50">
      <Container maxWidth="lg">
        <SectionHeader
          title="Наши услуги"
          subtitle="Мы предоставляем широкий спектр услуг для обеспечения безопасности и комфорта дорожного движения"
          align="center"
          spacingBottom={6}
          maxSubtitleWidth={672}
        />

        <Grid container spacing={4}>
          {services.map((service) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={service.id}>
              <HoverCard>
                <CardContent className="p-6 h-full flex flex-col">
                  <Box className="flex-grow">
                    <Typography variant="h6" className="font-semibold text-gray-900" sx={{ mb: '12px' }}>
                      {service.tittle}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 leading-relaxed" sx={{ mb: '16px' }}>
                      {service.description}
                    </Typography>
                    {service.price > 0 && (
                      <Typography variant="h6" className="font-bold text-primary-main" sx={{ mb: '16px' }}>
                        от {service.price.toLocaleString('ru-RU')} ₽
                      </Typography>
                    )}
                  </Box>
                  <Box className="mt-auto">
                    <Link href={`/services/${service.id}`} passHref>
                      <AppButton styleType="link" className="text-primary-main hover:text-primary-dark">
                        Подробнее →
                      </AppButton>
                    </Link>
                  </Box>
                </CardContent>
              </HoverCard>
            </Grid>
          ))}
        </Grid>

        {services.length > 0 && (
          <Box className="text-center mt-8">
            <Link href="/services" passHref>
              <AppButton styleType="primary" size="large">
                Все услуги
              </AppButton>
            </Link>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ServicesSection;