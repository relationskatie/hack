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
import { AnalyticsApi, DateRangeHelpers, type DtpResponse } from '@/features/analytics/services/analytics.api';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    Warning as WarningIcon,
    LocalHospital as HospitalIcon,
    Person as PersonIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

export default function AccidentsPage() {
    const [dtpData, setDtpData] = useState<DtpResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [dateRange, setDateRange] = useState(DateRangeHelpers.getCurrentYear());

    useEffect(() => {
        loadDtpData();
    }, [dateRange]);

    const loadDtpData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await AnalyticsApi.getDtp({
                range: dateRange,
            });

            setDtpData(response);
        } catch (err) {
            console.error('Failed to load DTP data:', err);
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
            setError(`Не удалось загрузить данные о ДТП: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // Преобразование данных для графиков
    const transformChartData = () => {
        if (!dtpData?.series?.injured_accidents?.points) return [];

        return dtpData.series.injured_accidents.points.map((point, index) => ({
            period: point.period || `Период ${index + 1}`,
            accidents: point.value,
            injuries: dtpData.series.injured_persons?.points[index]?.value || 0,
            fatalities: dtpData.series.fatalities?.points[index]?.value || 0,
        }));
    };

    const chartData = transformChartData();

    // Расчет статистики
    const getStatistics = () => {
        if (!dtpData) return null;

        const accidents = dtpData.aggregates.sum.injured_accidents || 0;
        const injuries = dtpData.aggregates.sum.injured_persons || 0;
        const fatalities = dtpData.aggregates.sum.fatalities || 0;

        return {
            accidents,
            injuries,
            fatalities,
        };
    };

    const stats = getStatistics();

    // Данные для круговой диаграммы
    const pieData = stats ? [
        { name: 'ДТП с пострадавшими', value: stats.accidents, color: '#ff6b6b' },
        { name: 'Пострадавшие', value: stats.injuries, color: '#feca57' },
        { name: 'Погибшие', value: stats.fatalities, color: '#ee5a6f' },
    ] : [];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <SectionHeader
                title="Аналитика дорожно-транспортных происшествий"
                subtitle="Статистика по ДТП с пострадавшими и погибшими"
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
                            Информация
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Данные ДТП всегда группируются по месяцам и предоставляются МВД
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

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
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                {stats.accidents.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                ДТП с пострадавшими
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <HospitalIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                {stats.injuries.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Пострадавших
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                {stats.fatalities.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Погибших
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Графики */}
            {chartData.length > 0 && !loading && (
                <Grid container spacing={3}>
                    {/* Основной график ДТП */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Динамика ДТП по месяцам
                            </Typography>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="accidents" fill="#ff6b6b" name="ДТП с пострадавшими" />
                                    <Bar dataKey="injuries" fill="#feca57" name="Пострадавшие" />
                                    <Bar dataKey="fatalities" fill="#ee5a6f" name="Погибшие" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Круговая диаграмма */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Распределение по типам
                            </Typography>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(Number(percent) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* График трендов */}
                    <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Тренды по месяцам
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
                                        dataKey="accidents"
                                        stroke="#ff6b6b"
                                        strokeWidth={2}
                                        name="ДТП с пострадавшими"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="injuries"
                                        stroke="#feca57"
                                        strokeWidth={2}
                                        name="Пострадавшие"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="fatalities"
                                        stroke="#ee5a6f"
                                        strokeWidth={2}
                                        name="Погибшие"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Пустое состояние */}
            {!loading && chartData.length === 0 && (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        Нет данных для отображения
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Попробуйте изменить период
                    </Typography>
                </Paper>
            )}
        </Container>
    );
}
