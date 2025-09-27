import { http } from '@/shared/api/client';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'page' | 'news' | 'project' | 'service' | 'statistics' | 'contact' | 'vacancy';
  url: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  took: number; // время выполнения поиска в мс
}

export const SearchApi = {
  search: (query: string, params: { 
    limit?: number; 
    offset?: number; 
    types?: string[];
  } = {}) =>
    http.get<SearchResponse>('/api/search', { 
      query: { 
        q: query, 
        ...params 
      } 
    }),

  searchByType: (query: string, type: string, params: { 
    limit?: number; 
    offset?: number; 
  } = {}) =>
    http.get<SearchResponse>(`/api/search/${type}`, { 
      query: { 
        q: query, 
        ...params 
      } 
    }),

  getSuggestions: (query: string, limit: number = 5) =>
    http.get<string[]>('/api/search/suggestions', { 
      query: { 
        q: query, 
        limit 
      } 
    }),

  getPopularSearches: (limit: number = 10) =>
    http.get<string[]>('/api/search/popular', { 
      query: { limit } 
    }),
};
