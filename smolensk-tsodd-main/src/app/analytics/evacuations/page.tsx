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
import { AnalyticsApi, DateRangeHelpers, type EvacResponse } from '@/features/analytics/services/analytics.api';
import {
  AreaChart,
  Area,
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
  LocalShipping as TruckIcon,
  DirectionsCar as CarIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

export default function EvacuationsPage() {
  const { isAdmin, user } = useRoleCheck();
  const [evacData, setEvacData] = useState<EvacResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState(DateRangeHelpers.getCurrentYear());
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadEvacData();
  }, [dateRange, groupBy]);

  const loadEvacData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await AnalyticsApi.getEvac({
        range: dateRange,
        group_by: groupBy,
        public: !isAdmin(), // true для гостей, false для админов
      });

      setEvacData(response);
    } catch (err) {
      console.error('Failed to load evacuation data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Не удалось загрузить данные об эвакуациях: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Преобразование данных для графиков
  const transformChartData = () => {
    if (!evacData?.series?.evacuations?.points) return [];

    return evacData.series.evacuations.points.map((point, index) => ({
      period: point.dt || point.period || `Период ${index + 1}`,
      evacuations: point.value,
      trips: evacData.series.trips?.points[index]?.value || 0,
      trucks_on_line: evacData.series.trucks_on_line?.points[index]?.value || 0,
      impound_income: evacData.series.impound_income?.points[index]?.value || 0,
    }));
  };

  const chartData = transformChartData();

  // Расчет статистики
  const getStatistics = () => {
    if (!evacData) return null;

    const evacuations = evacData.aggregates.sum.evacuations || 0;
    const trips = evacData.aggregates.sum.trips || 0;
    const trucksOnLine = evacData.aggregates.avg.trucks_on_line || 0;
    const impoundIncome = evacData.aggregates.sum.impound_income || 0;

    return {
      evacuations,
      trips,
      trucksOnLine,
      impoundIncome,
    };
  };

  const stats = getStatistics();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SectionHeader
        title="Аналитика эвакуаций"
        subtitle="Статистика по эвакуации транспортных средств"
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
              <CarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.evacuations.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Эвакуированных ТС
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <TruckIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.trips.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Выездов эвакуаторов
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.trucksOnLine.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Среднее количество эвакуаторов на линии
              </Typography>
            </Paper>
          </Grid>

          {/* Финансовые данные только для админов */}
          <RoleBasedView allowedRoles="admin">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <MoneyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {(stats.impoundIncome / 1000000).toFixed(1)}М ₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Доходы от штрафстоянки
                </Typography>
              </Paper>
            </Grid>
          </RoleBasedView>
        </Grid>
      )}

      {/* Графики */}
      {chartData.length > 0 && !loading && (
        <Grid container spacing={3}>
          {/* График эвакуаций и выездов */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Динамика эвакуаций и выездов
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="evacuations"
                    stackId="1"
                    stroke="#ff6b6b"
                    fill="#ff6b6b"
                    fillOpacity={0.6}
                    name="Эвакуации"
                  />
                  <Area
                    type="monotone"
                    dataKey="trips"
                    stackId="2"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Выезды эвакуаторов"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* График эвакуаторов на линии */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Эвакуаторы на линии
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
                    dataKey="trucks_on_line"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Эвакуаторы на линии"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Финансовый график для админов */}
          <RoleBasedView allowedRoles="admin">
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Доходы от штрафстоянки
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}М`} />
                    <Tooltip formatter={(value: any) => `${(value / 1000000).toFixed(2)} млн ₽`} />
                    <Legend />
                    <Bar dataKey="impound_income" fill="#10b981" name="Доходы от штрафстоянки" />
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
