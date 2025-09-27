'use client';

import React from 'react';
import {
  Paper,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Button,
  Collapse,
  IconButton,
  PaperProps
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

// Типы фильтров
export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'text';
  label: string;
  options?: FilterOption[];
  placeholder?: string;
  width?: { xs?: number; sm?: number; md?: number; lg?: number };
}

export interface SortOption {
  value: string;
  label: string;
}

export interface FilterValues {
  [key: string]: any;
}

export interface UnifiedFilterPanelProps extends Omit<PaperProps, 'onChange' | 'variant'> {
  // Поиск
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;

  // Фильтры
  filterFields?: FilterField[];
  filterValues?: FilterValues;
  onFilterChange?: (key: string, value: any) => void;
  showFilters?: boolean;

  // Сортировка
  sortOptions?: SortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  showSort?: boolean;

  // Управление
  onClear?: () => void;
  showClearButton?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;

  // Стилизация
  spacing?: number;
  variant?: 'standard' | 'compact';
}

export const UnifiedFilterPanel: React.FC<UnifiedFilterPanelProps> = ({
  // Поиск
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Поиск...',
  showSearch = true,

  // Фильтры
  filterFields = [],
  filterValues = {},
  onFilterChange,
  showFilters = true,

  // Сортировка
  sortOptions = [],
  sortValue = '',
  onSortChange,
  showSort = true,

  // Управление
  onClear,
  showClearButton = true,
  collapsible = false,
  defaultExpanded = true,

  // Стилизация
  spacing = 2,
  variant = 'standard',
  sx,
  ...paperProps
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters = React.useMemo(() => {
    if (searchValue) return true;
    if (sortValue) return true;
    return Object.values(filterValues).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '';
    });
  }, [searchValue, sortValue, filterValues]);

  // Подсчитываем количество активных фильтров
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (searchValue) count++;
    if (sortValue) count++;

    Object.values(filterValues).forEach(value => {
      if (Array.isArray(value) && value.length > 0) count++;
      else if (value !== undefined && value !== null && value !== '') count++;
    });

    return count;
  }, [searchValue, sortValue, filterValues]);

  const handleClear = () => {
    if (onSearchChange) onSearchChange('');
    if (onSortChange) onSortChange('');

    filterFields.forEach(field => {
      if (onFilterChange) {
        onFilterChange(field.key, field.type === 'multiselect' ? [] : '');
      }
    });

    if (onClear) onClear();
  };


  const content = (
    <Box>
      {/* Основная строка с поиском, сортировкой и кнопкой очистки */}
      <Box sx={{
        display: 'flex',
        gap: spacing,
        alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' },
        mb: showFilters && filterFields.length > 0 ? spacing : 0
      }}>
        {/* Поиск */}
        {showSearch && (
          <Box sx={{
            flex: 1,
            minWidth: { xs: '100%', sm: '200px' },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <TextField
              fullWidth
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              size={variant === 'compact' ? 'small' : 'medium'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}

        {/* Сортировка */}
        {showSort && sortOptions.length > 0 && (
          <Box sx={{
            minWidth: { xs: '100%', sm: '200px' },
            maxWidth: { xs: '100%', sm: '250px' },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <FormControl fullWidth size={variant === 'compact' ? 'small' : 'medium'}>
              <InputLabel>Сортировка</InputLabel>
              <Select
                value={sortValue}
                onChange={(e) => onSortChange?.(e.target.value)}
                label="Сортировка"
                startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Кнопка очистки */}
        {showClearButton && hasActiveFilters && (
          <Box sx={{
            minWidth: { xs: '100%', sm: '150px' },
            maxWidth: { xs: '100%', sm: '200px' },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              fullWidth
              size={variant === 'compact' ? 'small' : 'medium'}
            >
              Очистить ({activeFiltersCount})
            </Button>
          </Box>
        )}
      </Box>

      {/* Дополнительные фильтры */}
      {showFilters && filterFields.length > 0 && (
        <Box sx={{
          display: 'flex',
          gap: spacing,
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: { xs: 'nowrap', sm: 'wrap' }
        }}>
          {filterFields.map((field) => {
            const value = filterValues[field.key];
            const fieldWidth = field.width || { xs: 12, sm: 6, md: 4 };

            switch (field.type) {
              case 'select':
                return (
                  <Box key={field.key} sx={{
                    minWidth: { xs: '100%', sm: '200px' },
                    width: { xs: '100%', sm: 'auto' },
                    flex: { xs: 'none', sm: 1 }
                  }}>
                    <FormControl fullWidth size={variant === 'compact' ? 'small' : 'medium'}>
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        value={value || ''}
                        onChange={(e) => onFilterChange?.(field.key, e.target.value)}
                        label={field.label}
                      >
                        <MenuItem value="">
                          <em>Все</em>
                        </MenuItem>
                        {field.options?.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                );

              case 'multiselect':
                return (
                  <Box key={field.key} sx={{
                    minWidth: { xs: '100%', sm: '200px' },
                    width: { xs: '100%', sm: 'auto' },
                    flex: { xs: 'none', sm: 1 }
                  }}>
                    <FormControl fullWidth size={variant === 'compact' ? 'small' : 'medium'}>
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        multiple
                        value={value || []}
                        onChange={(e) => onFilterChange?.(field.key, e.target.value)}
                        label={field.label}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((val) => {
                              const option = field.options?.find(opt => opt.value === val);
                              return (
                                <Chip
                                  key={val}
                                  label={option?.label || val}
                                  size="small"
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {field.options?.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                );

              case 'date':
                return (
                  <Box key={field.key} sx={{
                    minWidth: { xs: '100%', sm: '200px' },
                    width: { xs: '100%', sm: 'auto' },
                    flex: { xs: 'none', sm: 1 }
                  }}>
                    <TextField
                      fullWidth
                      label={field.label}
                      type="date"
                      value={value || ''}
                      onChange={(e) => onFilterChange?.(field.key, e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      size={variant === 'compact' ? 'small' : 'medium'}
                    />
                  </Box>
                );

              case 'daterange':
                return (
                  <React.Fragment key={field.key}>
                    <Box sx={{
                      minWidth: { xs: '100%', sm: '200px' },
                      width: { xs: '100%', sm: 'auto' },
                      flex: { xs: 'none', sm: 1 }
                    }}>
                      <TextField
                        fullWidth
                        label={`${field.label} (от)`}
                        type="date"
                        value={value?.from || ''}
                        onChange={(e) => onFilterChange?.(field.key, { ...value, from: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        size={variant === 'compact' ? 'small' : 'medium'}
                      />
                    </Box>
                    <Box sx={{
                      minWidth: { xs: '100%', sm: '200px' },
                      width: { xs: '100%', sm: 'auto' },
                      flex: { xs: 'none', sm: 1 }
                    }}>
                      <TextField
                        fullWidth
                        label={`${field.label} (до)`}
                        type="date"
                        value={value?.to || ''}
                        onChange={(e) => onFilterChange?.(field.key, { ...value, to: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        size={variant === 'compact' ? 'small' : 'medium'}
                      />
                    </Box>
                  </React.Fragment>
                );

              case 'number':
                return (
                  <Box key={field.key} sx={{
                    minWidth: { xs: '100%', sm: '200px' },
                    width: { xs: '100%', sm: 'auto' },
                    flex: { xs: 'none', sm: 1 }
                  }}>
                    <TextField
                      fullWidth
                      label={field.label}
                      type="number"
                      placeholder={field.placeholder}
                      value={value || ''}
                      onChange={(e) => onFilterChange?.(field.key, e.target.value)}
                      size={variant === 'compact' ? 'small' : 'medium'}
                    />
                  </Box>
                );

              case 'text':
                return (
                  <Box key={field.key} sx={{
                    minWidth: { xs: '100%', sm: '200px' },
                    width: { xs: '100%', sm: 'auto' },
                    flex: { xs: 'none', sm: 1 }
                  }}>
                    <TextField
                      fullWidth
                      label={field.label}
                      placeholder={field.placeholder}
                      value={value || ''}
                      onChange={(e) => onFilterChange?.(field.key, e.target.value)}
                      size={variant === 'compact' ? 'small' : 'medium'}
                    />
                  </Box>
                );

              default:
                return null;
            }
          })}
        </Box>
      )}
    </Box>
  );

  if (collapsible) {
    return (
      <Paper sx={{ p: 2, mb: 2, ...sx }} {...paperProps}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: expanded ? 2 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Фильтры
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size="small"
                color="primary"
                variant="filled"
              />
            )}
          </Box>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expanded}>
          {content}
        </Collapse>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 2, ...sx }} {...paperProps}>
      {content}
    </Paper>
  );
};

export default UnifiedFilterPanel;
