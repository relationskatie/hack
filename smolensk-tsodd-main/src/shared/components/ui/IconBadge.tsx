'use client';

import React from 'react';
import { Box } from '@mui/material';

interface IconBadgeProps {
  size?: number;
  color?: string;
  bgOpacity?: number;
  children: React.ReactNode;
}

export const IconBadge: React.FC<IconBadgeProps> = ({ size = 64, color = 'primary.main', bgOpacity = 0.1, children }) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        bgcolor: color,
        opacity: bgOpacity,
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
      }}
    >
      <Box sx={{ color }}>
        {children}
      </Box>
    </Box>
  );
};

export default IconBadge;


