'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Article as ArticleIcon,
  DirectionsCar as CarIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon,
  Construction as ConstructionIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  ContactPhone as ContactIcon,
  Description as DocumentIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  icon?: React.ReactElement;
}

export interface SearchConfig {
  placeholder: string;
  emptyMessage: string;
  emptySubMessage: string;
  results: SearchResult[];
  getIcon: (type: string) => React.ReactElement;
  getTypeLabel: (type: string) => string;
}

interface BaseSearchProps {
  open: boolean;
  onClose: () => void;
  config: SearchConfig;
  onSearch?: (query: string) => Promise<SearchResult[]>;
}

export const BaseSearch: React.FC<BaseSearchProps> = ({
  open,
  onClose,
  config,
  onSearch
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (query.trim()) {
      setLoading(true);

      if (onSearch) {
        // Используем внешнюю функцию поиска
        onSearch(query.trim()).then(searchResults => {
          setResults(searchResults);
          setLoading(false);
          setSelectedIndex(0);
        }).catch(() => {
          setResults([]);
          setLoading(false);
        });
      } else {
        // Используем локальный поиск по предустановленным данным
        setTimeout(() => {
          const filtered = config.results.filter(
            item =>
              item.title.toLowerCase().includes(query.toLowerCase()) ||
              item.description.toLowerCase().includes(query.toLowerCase())
          );
          setResults(filtered);
          setLoading(false);
          setSelectedIndex(0);
        }, 300);
      }
    } else {
      setResults([]);
    }
  }, [query, config.results, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleNavigate(results[selectedIndex].url);
    }
  };

  const handleNavigate = (url: string) => {
    router.push(url);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          marginTop: '10vh',
          maxHeight: '70vh',
        },
      }}
    >
      <DialogContent className="p-0">
        <TextField
          ref={inputRef}
          fullWidth
          placeholder={config.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border-b"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-gray-500" />
              </InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
            style: { fontSize: '1.125rem', padding: '16px' },
          }}
          variant="standard"
        />

        {/* Стабильная область результатов, чтобы не было скачков при загрузке */}
        <Box className="max-h-96 overflow-auto" sx={{ minHeight: '12rem' }}>
          {loading && results.length === 0 && (
            <Box className="p-8 flex items-center justify-center">
              <CircularProgress size={24} />
            </Box>
          )}

          {!loading && results.length === 0 && query && (
            <Box className="p-8 text-center">
              <Typography variant="body1" className="text-gray-500">
                {config.emptyMessage.replace('{query}', query)}
              </Typography>
              <Typography variant="body2" className="text-gray-400" sx={{ mt: '8px' }}>
                {config.emptySubMessage}
              </Typography>
            </Box>
          )}

          {!loading && results.length === 0 && !query && (
            <Box className="p-8 text-center">
              <Typography variant="body2" className="text-gray-400">
                Начните вводить запрос для поиска
              </Typography>
            </Box>
          )}

          {results.length > 0 && (
            <List className="py-2">
              {results.map((result, index) => (
                <ListItem
                  key={result.id}
                  onClick={() => handleNavigate(result.url)}
                  className={`py-3 cursor-pointer ${index === selectedIndex ? 'bg-gray-100' : ''}`}
                >
                  <ListItemIcon>
                    {result.icon || config.getIcon(result.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.title}
                    secondary={result.description}
                  />
                  <Chip
                    label={config.getTypeLabel(result.type)}
                    size="small"
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Paper elevation={0} className="p-3 border-t bg-gray-50">
          <Box className="flex items-center justify-between">
            <Typography variant="caption" className="text-gray-500">
              Используйте стрелки ↑ ↓ для навигации, Enter для выбора
            </Typography>
            <Typography variant="caption" className="text-gray-500">
              ESC для закрытия
            </Typography>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

// Хелперы для иконок
export const getDefaultIcon = (type: string): React.ReactElement => {
  switch (type) {
    case 'news':
      return <ArticleIcon />;
    case 'service':
      return <CarIcon />;
    case 'statistics':
      return <AssessmentIcon />;
    case 'project':
      return <ConstructionIcon />;
    case 'contact':
      return <ContactIcon />;
    case 'document':
      return <DocumentIcon />;
    case 'vacancy':
      return <PeopleIcon />;
    case 'order':
      return <WorkIcon />;
    case 'dashboard':
      return <DashboardIcon />;
    default:
      return <InfoIcon />;
  }
};

export const getDefaultTypeLabel = (type: string): string => {
  switch (type) {
    case 'page':
      return 'Страница';
    case 'news':
      return 'Новость';
    case 'service':
      return 'Услуга';
    case 'statistics':
      return 'Статистика';
    case 'project':
      return 'Проект';
    case 'contact':
      return 'Контакт';
    case 'document':
      return 'Документ';
    case 'vacancy':
      return 'Вакансия';
    case 'order':
      return 'Заказ';
    case 'dashboard':
      return 'Панель';
    default:
      return type;
  }
};
