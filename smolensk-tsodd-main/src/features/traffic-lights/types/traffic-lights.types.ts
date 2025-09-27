export interface TrafficLight {
  id: number;
  address: string;
  type: string;
  status: 'working' | 'maintenance' | 'malfunction';
  installDate: string;
  lastMaintenance: string;
  phases: number;
  mode: 'fixed' | 'adaptive' | 'manual';
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface TrafficLightFilters {
  status?: 'working' | 'maintenance' | 'malfunction';
  type?: string;
  mode?: 'fixed' | 'adaptive' | 'manual';
  district?: string;
  search?: string;
}
