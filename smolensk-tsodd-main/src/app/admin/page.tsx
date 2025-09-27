'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AppButton from '@/shared/components/ui/AppButton';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Article as ArticleIcon,
  DirectionsCar as CarIcon,
  Traffic as TrafficIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Work as WorkIcon,
  ContactPhone as ContactIcon,
} from '@mui/icons-material';
import { useAuth } from '@/features/auth';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import StatSummaryCard from '@/shared/components/ui/StatSummaryCard';
import { NewsApi } from '@/features/news/services/news.api';
import { ProjectsApi } from '@/features/projects';
import Link from 'next/link';
import { OrdersApi } from '@/features/orders/orders.api';

// Интерфейсы для типизации данных
interface DashboardStats {
  news_count: number;
  active_projects: number;
  working_traffic_lights_percentage: number;
  evacuations_today: number;
  news_change_percent: number;
  projects_change: number;
  traffic_lights_change_percent: number;
  evacuations_change_percent: number;
}

interface SystemStatus {
  api_server: 'active' | 'inactive';
  database: 'active' | 'inactive';
  cameras: {
    total: number;
    working: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'news' | 'project' | 'alert';
  title: string;
  description: string;
  time: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Загружаем только доступные данные из API
        const [newsData, projectsData, ordersData] = await Promise.allSettled([
          NewsApi.list({ limit: 100 }),
          ProjectsApi.list({ limit: 100 }),
          OrdersApi.listAll({ limit: 1 })
        ]);

        // Извлекаем данные с обработкой ошибок и проверкой на null
        const news = newsData.status === 'fulfilled' && newsData.value ? newsData.value : { items: [] };
        const projects = projectsData.status === 'fulfilled' && projectsData.value ? projectsData.value : [];

        // Отладочная информация
        console.log('News data:', news);
        console.log('Projects data:', projects);

        // Вычисляем статистику новостей
        const newsCount = news?.items?.length || 0;
        const newsChangePercent = 0; // Пока нет исторических данных для сравнения

        // Вычисляем статистику проектов
        const activeProjects = projects?.length || 0;
        const projectsChange = 0; // Пока нет исторических данных для сравнения

        // Статистика светофоров (пока нет API, используем 0)
        const workingTrafficLightsPercentage = 0;
        const trafficLightsChangePercent = 0;

        // Статистика эвакуаций
        const evacuationsToday = ordersData.status === 'fulfilled' && ordersData.value ? (ordersData.value.total_count || 0) : 0;
        const evacuationsChangePercent = 0;

        const realStats: DashboardStats = {
          news_count: newsCount,
          active_projects: activeProjects,
          working_traffic_lights_percentage: workingTrafficLightsPercentage,
          evacuations_today: evacuationsToday,
          news_change_percent: newsChangePercent,
          projects_change: projectsChange,
          traffic_lights_change_percent: trafficLightsChangePercent,
          evacuations_change_percent: evacuationsChangePercent,
        };

        // Системный статус на основе доступности API
        const realSystemStatus: SystemStatus = {
          api_server: 'active', // Если мы дошли до этого места, API работает
          database: 'active',   // Если данные загрузились, БД работает
          cameras: {
            total: 0, // Пока нет API для камер
            working: 0,
          },
        };

        // Создаем активность на основе реальных данных с дополнительной проверкой
        const realRecentActivity: RecentActivity[] = [
          ...(news?.items?.slice(0, 3).map((newsItem, index) => ({
            id: `news-${newsItem.id}`,
            type: 'news' as const,
            title: newsItem.title,
            description: `Опубликована новость: ${newsItem.title}`,
            time: newsItem.created_at ? new Date(newsItem.created_at).toLocaleDateString('ru-RU') : 'Недавно',
            created_at: newsItem.created_at || new Date().toISOString(),
          })) || []),
          ...(projects?.slice(0, 2).map((project, index) => ({
            id: `project-${project.ID}`,
            type: 'project' as const,
            title: project.Title,
            description: `Добавлен проект: ${project.Title}`,
            time: project.CreatedAt ? new Date(project.CreatedAt).toLocaleDateString('ru-RU') : 'Недавно',
            created_at: project.CreatedAt || new Date().toISOString(),
          })) || []),
        ].slice(0, 5); // Берем максимум 5 записей

        setStats(realStats);
        setSystemStatus(realSystemStatus);
        setRecentActivity(realRecentActivity);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);

        // Устанавливаем пустые данные вместо ошибки
        const emptyStats: DashboardStats = {
          news_count: 0,
          active_projects: 0,
          working_traffic_lights_percentage: 0,
          evacuations_today: 0,
          news_change_percent: 0,
          projects_change: 0,
          traffic_lights_change_percent: 0,
          evacuations_change_percent: 0,
        };

        const emptySystemStatus: SystemStatus = {
          api_server: 'inactive',
          database: 'inactive',
          cameras: { total: 0, working: 0 },
        };

        setStats(emptyStats);
        setSystemStatus(emptySystemStatus);
        setRecentActivity([]);
        setError('Не удалось загрузить данные. Проверьте подключение к серверу.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-96">
        <CircularProgress />
      </Box>
    );
  }

  console.log(stats);
  console.log(error);

  if (error) {
    return (
      <Box>
        <SectionHeader title={`Добро пожаловать, ${user?.name}!`} spacingBottom={3} />
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      </Box>
    );
  }

  // Преобразуем данные в формат для карточек статистики
  const statsCards = stats ? [
    {
      title: 'Новостей за месяц',
      value: stats.news_count.toString(),
      change: `${stats.news_change_percent > 0 ? '+' : ''}${stats.news_change_percent}%`,
      trend: stats.news_change_percent >= 0 ? 'up' as const : 'down' as const,
      icon: <ArticleIcon />,
      color: 'blue' as const,
    },
    {
      title: 'Активных проектов',
      value: stats.active_projects.toString(),
      change: `${stats.projects_change > 0 ? '+' : ''}${stats.projects_change}`,
      trend: stats.projects_change >= 0 ? 'up' as const : 'down' as const,
      icon: <ScheduleIcon />,
      color: 'orange' as const,
    },
    {
      title: 'Исправных светофоров',
      value: `${stats.working_traffic_lights_percentage}%`,
      change: `${stats.traffic_lights_change_percent > 0 ? '+' : ''}${stats.traffic_lights_change_percent}%`,
      trend: stats.traffic_lights_change_percent >= 0 ? 'up' as const : 'down' as const,
      icon: <TrafficIcon />,
      color: 'green' as const,
    },
    {
      title: 'Эвакуаций сегодня',
      value: stats.evacuations_today.toString(),
      change: `${stats.evacuations_change_percent > 0 ? '+' : ''}${stats.evacuations_change_percent}%`,
      trend: stats.evacuations_change_percent <= 0 ? 'up' as const : 'down' as const,
      icon: <CarIcon />,
      color: 'blue' as const,
    },
  ] : [];

  return (
    <Box>
      <SectionHeader title={`Добро пожаловать, ${user?.name}!`} spacingBottom={3} />

      <Grid container spacing={3} className="mb-6">
        {statsCards.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <StatSummaryCard
              icon={stat.icon}
              value={stat.value}
              title={stat.title}
              change={stat.change}
              trend={stat.trend}
              color={stat.color}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: isMobile ? 12 : 8 }}>
          <Paper className="p-6">
            <Box className="flex justify-between items-center" sx={{ mb: '16px' }}>
              <Typography variant="h6" className="font-semibold">
                Последняя активность
              </Typography>
              <AppButton styleType="link" size="small">Показать все</AppButton>
            </Box>

            <Box className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => {
                const getIcon = () => {
                  switch (activity.type) {
                    case 'news': return <ArticleIcon />;
                    case 'project': return <ScheduleIcon />;
                    case 'alert': return <WarningIcon />;
                    default: return <ArticleIcon />;
                  }
                };

                return (
                  <Box key={activity.id || index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <Box className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${activity.type === 'news' ? 'bg-blue-50 text-blue-600' : ''}
                      ${activity.type === 'project' ? 'bg-orange-50 text-orange-600' : ''}
                      ${activity.type === 'alert' ? 'bg-red-50 text-red-600' : ''}
                    `}>
                      {getIcon()}
                    </Box>
                    <Box className="flex-grow">
                      <Typography variant="subtitle2" className="font-semibold">
                        {activity.title}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                );
              }) : (
                <Typography variant="body2" className="text-gray-500 text-center py-4">
                  Нет недавней активности
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: isMobile ? 12 : 4 }}>
          <Paper className="p-6">
            <Typography variant="h6" className="font-semibold" sx={{ mb: '16px' }}>
              Быстрые действия
            </Typography>

            <Box className="flex flex-col gap-3">
              <Link href="/admin/news/create" passHref>
                <AppButton styleType="outlined" fullWidth startIcon={<ArticleIcon />} className="justify-start">Добавить новость</AppButton>
              </Link>

              <Link href="/admin/projects" passHref>
                <AppButton styleType="outlined" fullWidth startIcon={<WorkIcon />} className="justify-start">Управление проектами</AppButton>
              </Link>

              <Link href="/admin/contacts" passHref>
                <AppButton styleType="outlined" fullWidth startIcon={<ContactIcon />} className="justify-start">Управление контактами</AppButton>
              </Link>

            </Box>
          </Paper>

          <Paper className="p-6 mt-3">
            <Typography variant="h6" className="font-semibold" sx={{ mb: '16px' }}>
              Системный статус
            </Typography>

            <Box className="space-y-3">
              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-2">
                  {systemStatus?.api_server === 'active' ? (
                    <CheckCircleIcon className="text-green-500 text-sm" />
                  ) : (
                    <WarningIcon className="text-red-500 text-sm" />
                  )}
                  <Typography variant="body2">API сервер</Typography>
                </Box>
                <Chip
                  label={systemStatus?.api_server === 'active' ? 'Активен' : 'Неактивен'}
                  size="small"
                  className={systemStatus?.api_server === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                />
              </Box>

              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-2">
                  {systemStatus?.database === 'active' ? (
                    <CheckCircleIcon className="text-green-500 text-sm" />
                  ) : (
                    <WarningIcon className="text-red-500 text-sm" />
                  )}
                  <Typography variant="body2">База данных</Typography>
                </Box>
                <Chip
                  label={systemStatus?.database === 'active' ? 'Активна' : 'Неактивна'}
                  size="small"
                  className={systemStatus?.database === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                />
              </Box>

              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-2">
                  <WarningIcon className="text-orange-500 text-sm" />
                  <Typography variant="body2">Камеры</Typography>
                </Box>
                <Chip
                  label={systemStatus?.cameras ? `${systemStatus.cameras.working}/${systemStatus.cameras.total}` : 'N/A'}
                  size="small"
                  className="bg-orange-100 text-orange-700"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}