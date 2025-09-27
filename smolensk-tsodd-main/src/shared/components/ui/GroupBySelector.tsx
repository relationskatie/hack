'use client';

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';

interface GroupBySelectorProps {
  value: 'day' | 'week' | 'month';
  onChange: (groupBy: 'day' | 'week' | 'month') => void;
  label?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  disabled?: boolean;
}

const GROUP_BY_OPTIONS = [
  { value: 'day', label: 'По дням', description: 'Ежедневная группировка' },
  { value: 'week', label: 'По неделям', description: 'Еженедельная группировка (понедельник)' },
  { value: 'month', label: 'По месяцам', description: 'Ежемесячная группировка (1 число)' },
];

export const GroupBySelector: React.FC<GroupBySelectorProps> = ({
  value,
  onChange,
  label = 'Группировка',
  size = 'small',
  fullWidth = true,
  disabled = false,
}) => {
  return (
    <FormControl fullWidth={fullWidth} size={size} disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as 'day' | 'week' | 'month')}
        label={label}
      >
        {GROUP_BY_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Box>
              <Typography variant="body2">{option.label}</Typography>
              <Typography variant="caption" color="text.secondary">
                {option.description}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
