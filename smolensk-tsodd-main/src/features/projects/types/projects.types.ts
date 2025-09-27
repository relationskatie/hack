import { Document } from '@/shared/types/common.types';

export interface Project {
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  status: 'completed' | 'in-progress' | 'planned';
  progress: number;
  budget: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  team: string[];
  benefits: string[];
  documents: Document[];
}

export interface ProjectFilters {
  status?: 'completed' | 'in-progress' | 'planned';
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
