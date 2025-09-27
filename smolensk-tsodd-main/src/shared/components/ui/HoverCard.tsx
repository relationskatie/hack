'use client';

import React from 'react';
import { Card, CardProps } from '@mui/material';

export const HoverCard: React.FC<CardProps> = ({ children, sx, ...rest }) => {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'box-shadow .2s ease, transform .2s ease',
        '&:hover': { boxShadow: 8, transform: 'translateY(-2px)' },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Card>
  );
};

export default HoverCard;


