'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { AnimatedLogo } from './AnimatedLogo';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Загрузка...'
}) => {
  return (
    <Box className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-[9999]">
      <Box className="text-center">
        <AnimatedLogo size={120} className="mb-4 mx-auto" />
      </Box>
    </Box>
  );
};

export default LoadingScreen;