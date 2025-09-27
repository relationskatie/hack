'use client';

import React from 'react';
import { Container } from '@mui/material';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { InteractiveMap } from '@/features/map';

export default function InfrastructureMapPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SectionHeader
        title="Карта инфраструктуры"
        subtitle="Интерактивная карта объектов дорожной инфраструктуры Смоленской области"
        spacingBottom={4}
      />
      
      <InteractiveMap />
    </Container>
  );
}
