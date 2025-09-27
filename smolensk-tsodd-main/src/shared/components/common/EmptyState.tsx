'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AppButton from '@/shared/components/ui/AppButton';
import { SvgIconComponent } from '@mui/icons-material';

interface EmptyStateProps {
  icon: React.ReactElement<SvgIconComponent>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <Box className="text-center py-12 px-4">
      <Box className="text-6xl text-gray-300 mb-4 flex justify-center">
        <Box sx={{ fontSize: 'inherit' }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h6" className="font-semibold text-gray-700" sx={{ mb: '8px' }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" className="text-gray-500 max-w-md mx-auto" sx={{ mb: '24px' }}>
          {description}
        </Typography>
      )}
      {action && (
        <AppButton styleType="primary" onClick={action.onClick}>
          {action.label}
        </AppButton>
      )}
    </Box>
  );
};