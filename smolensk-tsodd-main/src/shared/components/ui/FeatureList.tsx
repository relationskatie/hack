'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface FeatureListProps {
  items: React.ReactNode[];
  columns?: { xs?: number; md?: number };
}

export const FeatureList: React.FC<FeatureListProps> = ({ items, columns = { xs: 1, md: 2 } }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Box className="grid" sx={{ gridTemplateColumns: { xs: `repeat(${columns.xs ?? 1}, minmax(0, 1fr))`, md: `repeat(${columns.md ?? 2}, minmax(0, 1fr))` }, gap: 1 }}>
        {items.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18, mt: '2px' }} />
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {item}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default FeatureList;


