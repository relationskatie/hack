'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Typography,
} from '@mui/material';
import { DateRangeHelpers, type DateRange } from '@/features/analytics/services/analytics.api';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  groupBy?: 'day' | 'week' | 'month';
  onGroupByChange?: (groupBy: 'day' | 'week' | 'month') => void;
  showGroupBy?: boolean;
  className?: string;
}

const PRESET_RANGES = [
  { label: 'Текущий год', value: 'current_year' },
  { label: 'Прошлый год', value: 'last_year' },
  { label: 'Текущий месяц', value: 'current_month' },
  { label: 'Прошлый месяц', value: 'last_month' },
  { label: 'Текущая неделя', value: 'current_week' },
  { label: 'Прошлая неделя', value: 'last_week' },
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  groupBy = 'week',
  onGroupByChange,
  showGroupBy = true,
  className,
}) => {
  const [preset, setPreset] = useState<string>('');

  const handlePresetChange = (presetValue: string) => {
    setPreset(presetValue);

    let range: DateRange;
    switch (presetValue) {
      case 'current_year':
        range = DateRangeHelpers.getCurrentYear();
        break;
      case 'last_year':
        range = DateRangeHelpers.getLastYear();
        break;
      case 'current_month':
        range = DateRangeHelpers.getCurrentMonth();
        break;
      case 'last_month':
        range = DateRangeHelpers.getLastMonth();
        break;
      case 'current_week':
        range = DateRangeHelpers.getCurrentWeek();
        break;
      case 'last_week':
        range = DateRangeHelpers.getLastWeek();
        break;
      default:
        return;
    }

    onChange(range);
  };

  const handleDateChange = (field: 'from_date' | 'to_date', date: string) => {
    onChange({
      ...value,
      [field]: date,
    });
    setPreset(''); // Сброс пресета при ручном изменении
  };

  const getGroupByOptions = () => {
    const options = [
      { value: 'day', label: 'По дням' },
      { value: 'week', label: 'По неделям' },
      { value: 'month', label: 'По месяцам' },
    ];
    return options;
  };

  return (
    <Paper className={`p-4 ${className || ''}`}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Фильтры по датам
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Пресеты */}
        <FormControl fullWidth size="small">
          <InputLabel>Быстрый выбор периода</InputLabel>
          <Select
            value={preset}
            onChange={(e) => handlePresetChange(e.target.value)}
            label="Быстрый выбор периода"
          >
            <MenuItem value="">
              <em>Выберите период</em>
            </MenuItem>
            {PRESET_RANGES.map((range) => (
              <MenuItem key={range.value} value={range.value}>
                {range.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Ручной выбор дат */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <TextField
            label="Дата начала"
            type="date"
            value={value.from_date}
            onChange={(e) => handleDateChange('from_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'inline' } }}
          >
            —
          </Typography>
          <TextField
            label="Дата окончания"
            type="date"
            value={value.to_date}
            onChange={(e) => handleDateChange('to_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />
        </Box>

        {/* Группировка */}
        {showGroupBy && onGroupByChange && (
          <FormControl fullWidth size="small">
            <InputLabel>Группировка</InputLabel>
            <Select
              value={groupBy}
              onChange={(e) => onGroupByChange(e.target.value as 'day' | 'week' | 'month')}
              label="Группировка"
            >
              {getGroupByOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
    </Paper>
  );
};
