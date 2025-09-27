export interface Statistics {
  violations: number;
  accidents: number;
  avgSpeed: number;
  trafficFlow: number;
}

export interface StatisticsFilters {
  dateFrom?: string;
  dateTo?: string;
  district?: string;
  type?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}
