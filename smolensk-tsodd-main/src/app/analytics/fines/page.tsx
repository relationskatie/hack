'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { DateRangePicker } from '@/shared/components/ui/DateRangePicker';
import { GroupBySelector } from '@/shared/components/ui/GroupBySelector';
import { RoleBasedView } from '@/shared/components/ui/RoleBasedView';
import { useRoleCheck } from '@/shared/components/ui/RoleBasedView';
import { AnalyticsApi, DateRangeHelpers, type FinesResponse } from '@/features/analytics/services/analytics.api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

export default function FinesPage() {
  const { isAdmin, user } = useRoleCheck();
  const [finesData, setFinesData] = useState<FinesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [dateRange, setDateRange] = useState(DateRangeHelpers.getCurrentYear());
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadFinesData();
  }, [dateRange, groupBy]);

  const loadFinesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await AnalyticsApi.getFines({
        range: dateRange,
        group_by: groupBy,
        public: !isAdmin(), // true для гостей, false для админов
      });
      
      setFinesData(response);
    } catch (err) {
      console.error('Failed to load fines data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Не удалось загрузить данные о штрафах: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Преобразование данных для графиков
  const transformChartData = () => {
    if (!finesData?.series?.violations_delta?.points) return [];

    return finesData.series.violations_delta.points.map((point, index) => ({
      period: point.dt || point.period || `Период ${index + 1}`,
      violations: point.value,
      rulings: finesData.series.rulings_delta?.points[index]?.value || 0,
      imposed: finesData.series.imposed_delta?.points[index]?.value || 0,
      collected: finesData.series.collected_delta?.points[index]?.value || 0,
    }));
  };

  const chartData = transformChartData();

  // Расчет статистики
  const getStatistics = () => {
    if (!finesData) return null;

    const violations = finesData.aggregates.sum.violations_delta || 0;
    const rulings = finesData.aggregates.sum.rulings_delta || 0;
    const imposed = finesData.aggregates.sum.imposed_delta || 0;
    const collected = finesData.aggregates.sum.collected_delta || 0;
    const collectionRate = finesData.kpi?.collection_rate || 0;

    return {
      violations,
      rulings,
      imposed,
      collected,
      collectionRate,
    };
  };

  const stats = getStatistics();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SectionHeader
        title="Аналитика штрафов и нарушений"
        subtitle="Детальная статистика по нарушениям ПДД и штрафам"
        spacingBottom={4}
      />

      {/* Фильтры */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            showGroupBy={false}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Настройки отображения
            </Typography>
            <GroupBySelector
              value={groupBy}
              onChange={setGroupBy}
              label="Группировка данных"
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Предупреждение для гостей */}
      <RoleBasedView allowedRoles="guest">
        <Alert severity="info" sx={{ mb: 3 }}>
          Вы просматриваете публичную версию данных. Финансовая информация доступна только администраторам.
        </Alert>
      </RoleBasedView>

      {/* Ошибка */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Загрузка */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Статистические карточки */}
      {stats && !loading && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.violations.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Нарушений ПДД
              </Typography>
            </Paper>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.rulings.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Выписано постановлений
              </Typography>
            </Paper>
          </Grid>

          {/* Финансовые данные только для админов */}
          <RoleBasedView allowedRoles="admin">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {(stats.imposed / 1000000).toFixed(1)}М ₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Наложено штрафов
                </Typography>
              </Paper>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <TrendingDownIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {(stats.collected / 1000000).toFixed(1)}М ₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Собрано штрафов
                </Typography>
              </Paper>
            </Grid>
          </RoleBasedView>
        </Grid>
      )}

      {/* Графики */}
      {chartData.length > 0 && !loading && (
        <Grid container spacing={3}>
          {/* График нарушений и постановлений */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Динамика нарушений и постановлений
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="violations"
                    stroke="#ff6b6b"
                    strokeWidth={2}
                    name="Нарушения"
                  />
                  <Line
                    type="monotone"
                    dataKey="rulings"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Постановления"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* KPI для админов */}
          <RoleBasedView allowedRoles="admin">
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  KPI показатели
                </Typography>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                    {(stats.collectionRate * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Коэффициент собираемости
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </RoleBasedView>

          {/* Финансовый график для админов */}
          <RoleBasedView allowedRoles="admin">
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Финансовая динамика
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}М`} />
                    <Tooltip formatter={(value: any) => `${(value / 1000000).toFixed(2)} млн ₽`} />
                    <Legend />
                    <Bar dataKey="imposed" fill="#10b981" name="Наложено" />
                    <Bar dataKey="collected" fill="#ef4444" name="Собрано" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </RoleBasedView>
        </Grid>
      )}

      {/* Пустое состояние */}
      {!loading && chartData.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Нет данных для отображения
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Попробуйте изменить период или группировку данных
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
