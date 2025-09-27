export interface News {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: string;
  image: string;
  views: number;
  readTime: string;
  status?: 'published' | 'draft';
}

export interface NewsFilters {
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: 'published' | 'draft';
  search?: string;
}
