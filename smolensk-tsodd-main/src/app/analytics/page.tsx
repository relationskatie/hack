'use client';

import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Paper,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
    CardActionArea,
} from '@mui/material';
import Link from 'next/link';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import StatSummaryCard from '@/shared/components/ui/StatSummaryCard';
import { NewsApi } from '@/features/news/services/news.api';
import { ProjectsApi } from '@/features/projects/services/projects.api';
import { InteractiveMap } from '@/features/map';
import { AnalyticsApi, DateRangeHelpers, type FinesResponse, type DtpResponse, type EvacResponse } from '@/features/analytics/services/analytics.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';
import {
    DirectionsCar as CarIcon,
    Warning as WarningIcon,
    Traffic as TrafficIcon,
    Speed as SpeedIcon,
    LocalShipping as TruckIcon,
} from '@mui/icons-material';

const analyticsPages = [
    {
        title: 'Штрафы и нарушения',
        description: 'Детальная аналитика по нарушениям ПДД, штрафам и постановлениям',
        href: '/analytics/fines',
        icon: <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
        color: 'warning.light',
    },
    {
        title: 'Эвакуации',
        description: 'Подробная статистика по эвакуации транспортных средств',
        href: '/analytics/evacuations',
        icon: <TruckIcon sx={{ fontSize: 40, color: 'info.main' }} />,
        color: 'info.light',
    },
    {
        title: 'Дорожно-транспортные происшествия',
        description: 'Аналитика по ДТП с пострадавшими и погибшими',
        href: '/analytics/accidents',
        icon: <CarIcon sx={{ fontSize: 40, color: 'error.main' }} />,
        color: 'error.light',
    },
];

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [newsCount, setNewsCount] = useState<number>(0);
    const [projectsCount, setProjectsCount] = useState<number>(0);
    const [finesData, setFinesData] = useState<FinesResponse | null>(null);
    const [dtpData, setDtpData] = useState<DtpResponse | null>(null);
    const [evacData, setEvacData] = useState<EvacResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const getDateRange = (period: string) => {
        switch (period) {
            case 'year':
                return DateRangeHelpers.getCurrentYear();
            case 'month':
                return DateRangeHelpers.getCurrentMonth();
            case 'week':
                return DateRangeHelpers.getCurrentWeek();
            default:
                return DateRangeHelpers.getCurrentYear();
        }
    };

    const getGroupBy = (period: string) => {
        switch (period) {
            case 'year':
                return 'month' as const;
            case 'month':
                return 'day' as const;
            case 'week':
                return 'week' as const;
            default:
                return 'month' as const;
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                const [newsRes, projectsRes] = await Promise.allSettled([
                    NewsApi.count(),
                    ProjectsApi.list({ limit: 100, offset: 0 }),
                ]);
                if (newsRes.status === 'fulfilled') setNewsCount(newsRes.value?.count ?? 0);
                if (projectsRes.status === 'fulfilled') setProjectsCount(projectsRes.value?.length || 0);
            } catch {
                // ignore
            }
        };
        load();
    }, []);

    useEffect(() => {
        const loadAnalyticsData = async () => {
            setLoading(true);
            try {
                const dateRange = getDateRange(selectedPeriod);
                const groupBy = getGroupBy(selectedPeriod);

                // Определяем роль пользователя для API запросов
                const isPublic = !user || user.role !== 'admin';

                console.log('Loading analytics data:', { dateRange, groupBy, isPublic });

                const [finesRes, dtpRes, evacRes] = await Promise.allSettled([
                    AnalyticsApi.getFines({ range: dateRange, group_by: groupBy, public: isPublic }),
                    AnalyticsApi.getDtp({ range: dateRange }),
                    AnalyticsApi.getEvac({ range: dateRange, group_by: groupBy, public: isPublic }),
                ]);

                console.log('Analytics API responses:', { finesRes, dtpRes, evacRes });

                if (finesRes.status === 'fulfilled') {
                    console.log('Fines data:', finesRes.value);
                    setFinesData(finesRes.value);
                } else {
                    console.error('Fines API error:', finesRes.reason);
                    setFinesData(null);
                }

                if (dtpRes.status === 'fulfilled') {
                    console.log('DTP data:', dtpRes.value);
                    setDtpData(dtpRes.value);
                } else {
                    console.error('DTP API error:', dtpRes.reason);
                    setDtpData(null);
                }

                if (evacRes.status === 'fulfilled') {
                    console.log('Evac data:', evacRes.value);
                    setEvacData(evacRes.value);
                } else {
                    console.error('Evac API error:', evacRes.reason);
                    setEvacData(null);
                }
            } catch (error) {
                console.error('Failed to load analytics data:', error);
                // Сбрасываем данные при ошибке
                setFinesData(null);
                setDtpData(null);
                setEvacData(null);
            } finally {
                setLoading(false);
            }
        };

        loadAnalyticsData();
    }, [selectedPeriod]);

    // Transform API data for charts
    const transformFinesData = (data: FinesResponse | null) => {
        if (!data?.series?.violations_delta?.points) return [];

        return data.series.violations_delta.points.map((point, index) => ({
            month: point.dt ? new Date(point.dt).toLocaleDateString('ru-RU', { month: 'short' }) : `Период ${index + 1}`,
            violations: point.value,
            fines: data.series.rulings_delta?.points[index]?.value || 0,
            // Финансовые данные только для админов
            imposed: user?.role === 'admin' ? (data.series.imposed_delta?.points[index]?.value || 0) : 0,
            collected: user?.role === 'admin' ? (data.series.collected_delta?.points[index]?.value || 0) : 0,
        }));
    };

    const transformDtpData = (data: DtpResponse | null) => {
        if (!data?.series?.injured_accidents?.points) return [];

        return data.series.injured_accidents.points.map((point, index) => ({
            month: point.period ? new Date(point.period).toLocaleDateString('ru-RU', { month: 'short' }) : `Период ${index + 1}`,
            accidents: point.value,
            injuries: data.series.injured_persons?.points[index]?.value || 0,
            fatalities: data.series.fatalities?.points[index]?.value || 0,
        }));
    };

    const transformEvacData = (data: EvacResponse | null) => {
        if (!data?.series?.evacuations?.points) return [];

        return data.series.evacuations.points.map((point, index) => ({
            month: point.dt ? new Date(point.dt).toLocaleDateString('ru-RU', { month: 'short' }) : `Период ${index + 1}`,
            evacuations: point.value,
            trips: data.series.trips?.points[index]?.value || 0,
            // Финансовые данные только для админов
            impound_income: user?.role === 'admin' ? (data.series.impound_income?.points[index]?.value || 0) : 0,
        }));
    };

    const chartFinesData = transformFinesData(finesData);
    const chartDtpData = transformDtpData(dtpData);
    const chartEvacData = transformEvacData(evacData);

    // Calculate stats from API data
    const totalViolations = finesData?.aggregates?.sum?.violations_delta || 0;
    const totalEvacuations = evacData?.aggregates?.sum?.evacuations || 0;
    const totalAccidents = dtpData?.aggregates?.sum?.injured_accidents || 0;
    const collectionRate = finesData?.kpi?.collection_rate || 0;

    const statsCards = [
        {
            title: 'Новостей',
            value: newsCount.toString(),
            change: '-12%',
            trend: 'down',
            icon: <WarningIcon />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Активные проекты',
            value: projectsCount.toString(),
            change: '-23%',
            trend: 'down',
            icon: <CarIcon />,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: 'Нарушений ПДД',
            value: totalViolations.toLocaleString(),
            change: '+5%',
            trend: 'up',
            icon: <WarningIcon />,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
        {
            title: 'Эвакуаций',
            value: totalEvacuations.toLocaleString(),
            change: '-8%',
            trend: 'down',
            icon: <TrafficIcon />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <SectionHeader
                title="Аналитика дорожного движения"
                subtitle="Комплексная аналитика и статистика по безопасности дорожного движения в Смоленской области"
                spacingBottom={4}
            />

            {/* Карточки со статистикой */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statsCards.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <StatSummaryCard
                            icon={stat.icon}
                            value={stat.value}
                            title={stat.title}
                            change={stat.change}
                            trend={stat.trend as 'up' | 'down'}
                            color={stat.color.includes('blue') ? 'blue' : stat.color.includes('red') ? 'red' : stat.color.includes('green') ? 'green' : 'orange'}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* Навигация по разделам аналитики */}
            <Box sx={{ mb: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                    Детальная аналитика
                </Typography>
                <Grid container spacing={4}>
                    {analyticsPages.map((page) => (
                        <Grid size={{ xs: 12, md: 4 }} key={page.href}>
                            <Card
                                sx={{
                                    height: '100%',
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4,
                                    },
                                }}
                            >
                                <CardActionArea
                                    component={Link}
                                    href={page.href}
                                    sx={{ height: '100%', p: 3 }}
                                >
                                    <CardContent sx={{ textAlign: 'center', height: '100%' }}>
                                        <Box sx={{ mb: 2 }}>
                                            {page.icon}
                                        </Box>
                                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                                            {page.title}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            {page.description}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Фильтр периода */}
            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    justifyContent: { xs: 'flex-start', sm: 'space-between' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(e, v) => setActiveTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                >
                    <Tab label="Нарушения ПДД" />
                    <Tab label="Дорожные происшествия" />
                    <Tab label="Эвакуации" />
                    <Tab label="Карта объектов" />
                </Tabs>

                {activeTab !== 3 && (
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                        <InputLabel>Период</InputLabel>
                        <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} label="Период">
                            <MenuItem value="year">За год</MenuItem>
                            <MenuItem value="month">За месяц</MenuItem>
                            <MenuItem value="week">За неделю</MenuItem>
                        </Select>
                    </FormControl>
                )}
            </Box>

            {/* Графики */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Динамика нарушений ПДД
                                {loading && <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>(загрузка...)</span>}
                            </Typography>
                            {chartFinesData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartFinesData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="violations"
                                            stroke="#62a744"
                                            strokeWidth={2}
                                            name="Нарушения"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="fines"
                                            stroke="#ff6b6b"
                                            strokeWidth={2}
                                            name="Постановления"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {loading ? 'Загрузка данных...' : 'Данные о нарушениях недоступны'}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Сводка по нарушениям
                            </Typography>
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                                    {totalViolations.toLocaleString()}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                    Всего нарушений
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}>
                                    {(finesData?.aggregates?.sum?.rulings_delta || 0).toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Выписано постановлений
                                </Typography>
                                {user?.role === 'admin' && collectionRate > 0 && (
                                    <>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main', mb: 1, mt: 2 }}>
                                            {(collectionRate * 100).toFixed(1)}%
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Коэффициент собираемости
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {activeTab === 1 && (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Статистика ДТП
                                {loading && <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>(загрузка...)</span>}
                            </Typography>
                            {chartDtpData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={chartDtpData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="accidents" fill="#ff6b6b" name="ДТП с пострадавшими" />
                                        <Bar dataKey="injuries" fill="#feca57" name="Пострадавшие" />
                                        <Bar dataKey="fatalities" fill="#ee5a6f" name="Погибшие" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {loading ? 'Загрузка данных...' : 'Данные о ДТП недоступны'}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {activeTab === 2 && (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Статистика эвакуаций
                                {loading && <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>(загрузка...)</span>}
                            </Typography>
                            {chartEvacData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={350}>
                                    <AreaChart data={chartEvacData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="evacuations"
                                            stroke="#62a744"
                                            fill="#62a744"
                                            fillOpacity={0.3}
                                            name="Эвакуации"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="trips"
                                            stroke="#ff6b6b"
                                            fill="#ff6b6b"
                                            fillOpacity={0.3}
                                            name="Выезды эвакуаторов"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {loading ? 'Загрузка данных...' : 'Данные об эвакуациях недоступны'}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {activeTab === 3 && (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <InteractiveMap />
                    </Grid>
                </Grid>
            )}

            {/* Дополнительная информация */}
            <Box className="mt-8 p-6 bg-blue-50 rounded-lg">
                <Typography variant="body1" sx={{ color: 'primary.dark' }}>
                    <strong>Примечание:</strong> Данная статистика является публичной и не содержит
                    персональных данных или финансовой информации. Для доступа к полной аналитике
                    необходима авторизация.
                </Typography>
            </Box>
        </Container>
    );
}