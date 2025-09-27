// Типы для интерактивной карты
export interface MapObject {
  id: number;
  type: 'traffic_light' | 'camera' | 'evacuator' | 'accident' | 'road_work';
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  district: string;
  installDate?: string;
  status?: 'active' | 'maintenance' | 'inactive';
  description?: string;
  lastUpdate?: string;
}

export interface MapFilter {
  type: string | null;
  district: string | null;
  status: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
