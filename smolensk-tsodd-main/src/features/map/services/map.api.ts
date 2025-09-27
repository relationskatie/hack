import { http } from '@/shared/api/client';
import { MapObject } from '@/types';

export interface MapObjectsResponse {
  objects: MapObject[];
  total: number;
}

export const MapApi = {
  getObjects: (params: { 
    type?: string; 
    district?: string; 
    status?: string;
    limit?: number;
    offset?: number;
  } = {}) =>
    http.get<MapObjectsResponse>('/api/map/objects', { query: params }),

  getTrafficLights: (params: { 
    district?: string; 
    status?: string;
    limit?: number;
    offset?: number;
  } = {}) =>
    http.get<MapObjectsResponse>('/api/map/traffic-lights', { query: params }),

  getCameras: (params: { 
    district?: string; 
    status?: string;
    limit?: number;
    offset?: number;
  } = {}) =>
    http.get<MapObjectsResponse>('/api/map/cameras', { query: params }),

  getObject: (id: string) =>
    http.get<MapObject>(`/api/map/objects/${id}`),

  updateObject: (id: string, payload: Partial<MapObject>) =>
    http.put<MapObject>(`/api/map/objects/${id}`, payload, { requireAuth: true }),

  getDistricts: () =>
    http.get<string[]>('/api/map/districts'),

  getStats: () =>
    http.get<{
      total_objects: number;
      traffic_lights: number;
      cameras: number;
      by_district: Record<string, number>;
      by_status: Record<string, number>;
    }>('/api/map/stats'),
};
