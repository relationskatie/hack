'use client';

import React from 'react';
import { Card, CardContent, Box, Chip, Typography } from '@mui/material';

interface StatSummaryCardProps {
  icon: React.ReactNode;
  value: string;
  title: string;
  change: string;
  trend: 'up' | 'down';
  color: 'blue' | 'red' | 'green' | 'orange';
}

const colorMap = {
  blue: { icon: 'blue.600', bg: 'blue.50' },
  red: { icon: 'red.600', bg: 'red.50' },
  green: { icon: 'green.600', bg: 'green.50' },
  orange: { icon: 'orange.600', bg: 'orange.50' },
} as const;

export const StatSummaryCard: React.FC<StatSummaryCardProps> = ({ icon, value, title, change, trend, color }) => {
  const palette = colorMap[color];
  return (
    <Card sx={{ height: '100%', transition: 'box-shadow .2s', '&:hover': { boxShadow: 6 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: palette.bg }}>
            <Box sx={{ color: palette.icon }}>
              {icon}
            </Box>
          </Box>
          <Chip
            size="small"
            label={change}
            sx={{ bgcolor: trend === 'up' ? 'green.100' : 'red.100', color: trend === 'up' ? 'green.700' : 'red.700' }}
          />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatSummaryCard;


