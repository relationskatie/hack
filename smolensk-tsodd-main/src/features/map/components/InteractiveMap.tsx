'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';

// Динамический импорт карты без SSR
const MapComponent = dynamic(() => import('./MapComponent').then(mod => ({ default: mod.MapComponent })), {
  ssr: false,
  loading: () => (
    <Box className="h-[500px] flex items-center justify-center">
      <div className="text-center">
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: '8px' }} className="text-gray-600">
          Загрузка карты...
        </Typography>
      </div>
    </Box>
  )
});

interface InteractiveMapProps {
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ address, coordinates }) => {
  // Если переданы координаты для простой карты (например, для контактов)
  if (address && coordinates) {
    return (
      <Paper sx={{ overflow: 'hidden' }}>
        <Box className="h-96 relative bg-gray-100 flex items-center justify-center">
          {/* Простая карта с маркером для контактов */}
          <div className="text-center">
            <Typography variant="h6" className="font-semibold" sx={{ mb: '8px' }}>
              ЦОДД Смоленской области
            </Typography>
            <Typography variant="body2" className="text-gray-600" sx={{ mb: '16px' }}>
              {address}
            </Typography>
            <div className="w-12 h-12 bg-primary-main rounded-full flex items-center justify-center text-white shadow-lg mx-auto">
              <Typography variant="h6" className="font-bold">
                Ц
              </Typography>
            </div>
          </div>
        </Box>
      </Paper>
    );
  }

  // Полноценная интерактивная карта
  return <MapComponent />;
};