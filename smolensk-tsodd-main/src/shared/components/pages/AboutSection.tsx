import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import Link from 'next/link';
import AppButton from '@/shared/components/ui/AppButton';
import StatsCards from './StatsCards';

export default function AboutSection() {
    return (
        <Box className="py-16 bg-white">
            <Container maxWidth="lg">
                <Grid container spacing={6} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }} className="flex flex-col gap-2">
                        <Typography variant="h3" className="font-bold">
                            Делаем дороги безопаснее
                        </Typography>
                        <Typography variant="body1" className="text-gray-600">
                            Центр организации дорожного движения Смоленской области — это современная
                            организация, которая использует передовые технологии для создания
                            безопасной и комфортной дорожной среды.
                        </Typography>
                        <Typography variant="body1" className="text-gray-600">
                            Мы работаем для того, чтобы каждый житель региона мог безопасно
                            и быстро добраться до места назначения, а наши дороги соответствовали
                            самым высоким стандартам качества.
                        </Typography>
                        <Link href="/about" passHref>
                            <AppButton styleType="primary" size="large" endIcon={<ArrowForwardIcon />}>
                                Подробнее о ЦОДД
                            </AppButton>
                        </Link>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <StatsCards />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}