import { http } from '@/shared/api/client';

export interface StatisticsData {
  news_count: number;
  active_projects: number;
  working_traffic_lights_percentage: number;
  evacuations_today: number;
  news_change_percent: number;
  projects_change: number;
  traffic_lights_change_percent: number;
  evacuations_change_percent: number;
}

export interface SystemStatus {
  api_server: 'active' | 'inactive';
  database: 'active' | 'inactive';
  cameras: {
    total: number;
    working: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'news' | 'project' | 'alert';
  title: string;
  description: string;
  time: string;
  created_at: string;
}

export const StatisticsApi = {
  getDashboardStats: () => 
    http.get<StatisticsData>('/api/statistics/dashboard', { requireAuth: true }),

  getSystemStatus: () => 
    http.get<SystemStatus>('/api/statistics/system-status', { requireAuth: true }),

  getRecentActivity: (params: { limit?: number } = {}) => 
    http.get<RecentActivity[]>('/api/statistics/recent-activity', { 
      query: params, 
      requireAuth: true 
    }),

  getTrafficLightsStats: () => 
    http.get<{ total: number; working: number; maintenance: number; malfunction: number }>('/api/statistics/traffic-lights', { requireAuth: true }),

  getNewsStats: (params: { period?: 'day' | 'week' | 'month' | 'year' } = {}) => 
    http.get<{ count: number; change_percent: number }>('/api/statistics/news', { 
      query: params, 
      requireAuth: true 
    }),

  getProjectsStats: () => 
    http.get<{ active: number; total: number; change: number }>('/api/statistics/projects', { requireAuth: true }),

  getEvacuationsStats: (params: { period?: 'day' | 'week' | 'month' } = {}) => 
    http.get<{ count: number; change_percent: number }>('/api/statistics/evacuations', { 
      query: params, 
      requireAuth: true 
    }),
};
