'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  TableSortLabel,
  Collapse,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { BackendVacancyItem } from '@/features/vacancies/services/vacancies.api';
import { UnifiedFilterPanel, FilterField, FilterValues, SortOption } from '@/shared/components/ui/UnifiedFilterPanel';

interface VacanciesTableProps {
  vacancies: BackendVacancyItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

type SortField = 'position' | 'salary' | 'published_at' | 'is_active';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  search: string;
  status: '' | 'active' | 'inactive';
  salaryRange: '' | 'low' | 'medium' | 'high';
}

const salaryRanges = {
  low: { min: 0, max: 50000 },
  medium: { min: 50000, max: 100000 },
  high: { min: 100000, max: Infinity },
};

// Конфигурация полей фильтров для UnifiedFilterPanel
const filterFields: FilterField[] = [
  {
    key: 'status',
    type: 'select',
    label: 'Статус',
    options: [
      { value: 'active', label: 'Активные' },
      { value: 'inactive', label: 'Закрытые' },
    ],
  },
  {
    key: 'salaryRange',
    type: 'select',
    label: 'Зарплата',
    options: [
      { value: 'low', label: 'До 50 000 ₽' },
      { value: 'medium', label: '50 000 - 100 000 ₽' },
      { value: 'high', label: 'Свыше 100 000 ₽' },
    ],
  },
];

// Конфигурация опций сортировки
const sortOptions: SortOption[] = [
  { value: 'published_at_desc', label: 'Дата публикации (новые)' },
  { value: 'published_at_asc', label: 'Дата публикации (старые)' },
  { value: 'position_asc', label: 'Должность (А-Я)' },
  { value: 'position_desc', label: 'Должность (Я-А)' },
  { value: 'salary_desc', label: 'Зарплата (высокая)' },
  { value: 'salary_asc', label: 'Зарплата (низкая)' },
  { value: 'is_active_desc', label: 'Статус (активные)' },
  { value: 'is_active_asc', label: 'Статус (закрытые)' },
];

export default function VacanciesTable({ vacancies, loading, error, onRefresh }: VacanciesTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('published_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    salaryRange: '',
  });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (salary: string) => {
    // Извлекаем числа из строки зарплаты
    const numbers = salary.match(/\d+/g);
    if (!numbers) return salary;

    const num = parseInt(numbers[0]);
    if (isNaN(num)) return salary;

    return new Intl.NumberFormat('ru-RU').format(num) + ' ₽';
  };

  const getSalaryRange = (salary: string): 'low' | 'medium' | 'high' => {
    const numbers = salary.match(/\d+/g);
    if (!numbers) return 'low';

    const num = parseInt(numbers[0]);
    if (isNaN(num)) return 'low';

    if (num < salaryRanges.medium.min) return 'low';
    if (num < salaryRanges.high.min) return 'medium';
    return 'high';
  };

  const filteredAndSortedVacancies = useMemo(() => {
    let filtered = vacancies.filter((vacancy) => {
      // Поиск по названию и описанию
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          vacancy.position.toLowerCase().includes(searchLower) ||
          vacancy.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Фильтр по статусу
      if (filters.status) {
        const isActive = filters.status === 'active';
        if (vacancy.is_active !== isActive) return false;
      }

      // Фильтр по зарплате
      if (filters.salaryRange) {
        const vacancySalaryRange = getSalaryRange(vacancy.salary);
        if (vacancySalaryRange !== filters.salaryRange) return false;
      }

      return true;
    });

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'position':
          aValue = a.position.toLowerCase();
          bValue = b.position.toLowerCase();
          break;
        case 'salary': {
          const aSalary = a.salary.match(/\d+/g)?.[0] || '0';
          const bSalary = b.salary.match(/\d+/g)?.[0] || '0';
          aValue = parseInt(aSalary);
          bValue = parseInt(bSalary);
          break;
        }
        case 'published_at':
          aValue = new Date(a.published_at || 0).getTime();
          bValue = new Date(b.published_at || 0).getTime();
          break;
        case 'is_active':
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [vacancies, filters, sortField, sortDirection]);

  const paginatedVacancies = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAndSortedVacancies.slice(start, start + rowsPerPage);
  }, [filteredAndSortedVacancies, page, rowsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Обработчики для UnifiedFilterPanel
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPage(0);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleSortChange = (value: string) => {
    if (value) {
      const [field, direction] = value.split('_');
      setSortField(field as SortField);
      setSortDirection(direction as SortDirection);
    }
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: '', salaryRange: '' });
    setSortField('published_at');
    setSortDirection('desc');
    setPage(0);
  };

  // Преобразование фильтров для UnifiedFilterPanel
  const filterValues: FilterValues = {
    status: filters.status,
    salaryRange: filters.salaryRange,
  };

  const currentSortValue = `${sortField}_${sortDirection}`;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleRowExpansion = (vacancyId: string) => {
    setExpandedRow(expandedRow === vacancyId ? null : vacancyId);
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-8">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Заголовок */}
      <Box className="flex items-center justify-between" sx={{ mb: '16px' }}>
        <Typography variant="h5" className="font-semibold">
          Вакансии ({filteredAndSortedVacancies.length})
        </Typography>
      </Box>

      {/* Унифицированная панель фильтров */}
      <UnifiedFilterPanel
        searchValue={filters.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Поиск по названию или описанию..."
        filterFields={filterFields}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        sortOptions={sortOptions}
        sortValue={currentSortValue}
        onSortChange={handleSortChange}
        onClear={handleClearFilters}
        collapsible={true}
        defaultExpanded={false}
        variant="standard"
      />

      {error && (
        <Alert severity="error" sx={{ mb: '16px' }}>
          {error}
        </Alert>
      )}

      {/* Таблица */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'position'}
                  direction={sortField === 'position' ? sortDirection : 'asc'}
                  onClick={() => handleSort('position')}
                >
                  Должность
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'salary'}
                  direction={sortField === 'salary' ? sortDirection : 'asc'}
                  onClick={() => handleSort('salary')}
                >
                  Зарплата
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'is_active'}
                  direction={sortField === 'is_active' ? sortDirection : 'asc'}
                  onClick={() => handleSort('is_active')}
                >
                  Статус
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'published_at'}
                  direction={sortField === 'published_at' ? sortDirection : 'asc'}
                  onClick={() => handleSort('published_at')}
                >
                  Дата публикации
                </TableSortLabel>
              </TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedVacancies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center" sx={{ py: '32px' }}>
                  <Box className="flex flex-col items-center">
                    <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: '4px' }}>
                      {filters.search || filters.status || filters.salaryRange
                        ? 'Нет вакансий, соответствующих фильтрам'
                        : 'Нет доступных вакансий'
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {filters.search || filters.status || filters.salaryRange
                        ? 'Попробуйте изменить параметры поиска'
                        : 'Следите за обновлениями, новые вакансии появляются регулярно'
                      }
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedVacancies.map((vacancy) => (
                <React.Fragment key={vacancy.id}>
                  <TableRow hover>
                    <TableCell>
                      <Typography variant="subtitle2" className="font-medium">
                        {vacancy.position}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box className="flex items-center gap-1">
                        <MoneyIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="body2">
                          {formatSalary(vacancy.salary)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={vacancy.is_active ? 'Активна' : 'Закрыта'}
                        color={vacancy.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box className="flex items-center gap-1">
                        <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(vacancy.published_at)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={expandedRow === vacancy.id ? 'Свернуть' : 'Подробнее'}>
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpansion(vacancy.id)}
                        >
                          {expandedRow === vacancy.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 0, borderBottom: 'none' }}>
                      <Collapse in={expandedRow === vacancy.id} timeout="auto" unmountOnExit>
                        <Box sx={{
                          p: 2,
                          mb: 1
                        }}>
                          <Typography variant="body2" color="text.secondary" className="whitespace-pre-wrap">
                            {vacancy.description}
                          </Typography>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Пагинация */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredAndSortedVacancies.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} из ${count !== -1 ? count : `более ${to}`}`
        }
      />

      {/* Контактная информация */}
      {filteredAndSortedVacancies.length > 0 && (
        <Box className="mt-6 text-center">
          <Typography variant="body2" color="text.secondary">
            Заинтересованы в работе с нами? Отправьте резюме на{' '}
            <a href="mailto:hr@codd.ru" className="text-primary hover:underline">
              hr@codd.ru
            </a>
          </Typography>
        </Box>
      )}
    </Box>
  );
}