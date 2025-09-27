'use client';

import React from 'react';
import { Paper, TextField, InputAdornment, PaperProps } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchPanelProps extends Omit<PaperProps, 'onChange'> {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ placeholder = 'Поиск...', value, onChange, sx, ...rest }) => {
  return (
    <Paper sx={{ p: 2, mb: 2, ...sx }} {...rest}>
      <TextField
        fullWidth
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Paper>
  );
};

export default SearchPanel;
