// Общие типы для проекта

export interface News {
  id: number;
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

export interface Document {
  id?: number;
  name: string;
  size: string;
  type?: string;
  url?: string;
}

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

export interface Statistics {
  violations: number;
  accidents: number;
  avgSpeed: number;
  trafficFlow: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  price: string;
  time: string;
  features: string[];
  href: string;
}

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