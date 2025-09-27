'use client';

import React from 'react';
import { Box, Grid, Typography } from '@mui/material';

interface KPIItem {
  value: React.ReactNode;
  label: React.ReactNode;
}

interface KPIGridProps {
  items: KPIItem[];
}

export const KPIGrid: React.FC<KPIGridProps> = ({ items }) => {
  return (
    <Box>
      <Grid container spacing={3}>
        {items.map((item, index) => (
          <Grid key={index} size={{ xs: 6 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {item.value}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {item.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default KPIGrid;


