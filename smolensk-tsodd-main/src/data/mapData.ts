import { MapObject } from '@/types';

// Синтетические данные объектов инфраструктуры Смоленска
export const mapObjects: MapObject[] = [
  // Светофоры
  {
    id: 1,
    type: 'traffic_light',
    name: 'Светофор на пл. Победы',
    address: 'г. Смоленск, пл. Победы',
    coordinates: { lat: 54.7823, lng: 32.0456 },
    district: 'Ленинский',
    installDate: '2023-05-12',
    status: 'active',
    description: 'Светофор с адаптивным управлением',
    lastUpdate: '2024-01-15'
  },
  {
    id: 2,
    type: 'traffic_light',
    name: 'Светофор на ул. Большевистская',
    address: 'г. Смоленск, ул. Большевистская, д. 15',
    coordinates: { lat: 54.7750, lng: 32.0510 },
    district: 'Центральный',
    installDate: '2023-03-20',
    status: 'active',
    description: 'Светофор с камерой фотовидеофиксации',
    lastUpdate: '2024-01-10'
  },
  {
    id: 3,
    type: 'traffic_light',
    name: 'Светофор на пр. Гагарина',
    address: 'г. Смоленск, пр. Гагарина, д. 42',
    coordinates: { lat: 54.7880, lng: 32.0380 },
    district: 'Заднепровский',
    installDate: '2023-07-08',
    status: 'maintenance',
    description: 'Светофор на ремонте',
    lastUpdate: '2024-01-12'
  },
  {
    id: 4,
    type: 'traffic_light',
    name: 'Светофор на ул. Ленина',
    address: 'г. Смоленск, ул. Ленина, д. 8',
    coordinates: { lat: 54.7790, lng: 32.0420 },
    district: 'Центральный',
    installDate: '2022-11-15',
    status: 'active',
    description: 'Светофор с пешеходным переходом',
    lastUpdate: '2024-01-14'
  },

  // Камеры фотовидеофиксации
  {
    id: 5,
    type: 'camera',
    name: 'Камера на ул. Николаева',
    address: 'г. Смоленск, ул. Николаева, д. 25',
    coordinates: { lat: 54.7710, lng: 32.0480 },
    district: 'Центральный',
    installDate: '2023-09-10',
    status: 'active',
    description: 'Камера контроля скорости',
    lastUpdate: '2024-01-13'
  },
  {
    id: 6,
    type: 'camera',
    name: 'Камера на ул. Дзержинского',
    address: 'г. Смоленск, ул. Дзержинского, д. 12',
    coordinates: { lat: 54.7850, lng: 32.0350 },
    district: 'Заднепровский',
    installDate: '2023-06-22',
    status: 'active',
    description: 'Камера контроля проезда на красный',
    lastUpdate: '2024-01-11'
  },
  {
    id: 7,
    type: 'camera',
    name: 'Камера на ул. Кирова',
    address: 'г. Смоленск, ул. Кирова, д. 18',
    coordinates: { lat: 54.7730, lng: 32.0550 },
    district: 'Ленинский',
    installDate: '2023-04-18',
    status: 'inactive',
    description: 'Камера временно отключена',
    lastUpdate: '2024-01-08'
  },

  // Эвакуаторы
  {
    id: 8,
    type: 'evacuator',
    name: 'Эвакуатор №1',
    address: 'г. Смоленск, ул. Промышленная, д. 5',
    coordinates: { lat: 54.7900, lng: 32.0600 },
    district: 'Заднепровский',
    status: 'active',
    description: 'Эвакуатор на дежурстве',
    lastUpdate: '2024-01-15'
  },
  {
    id: 9,
    type: 'evacuator',
    name: 'Эвакуатор №2',
    address: 'г. Смоленск, ул. Строителей, д. 12',
    coordinates: { lat: 54.7680, lng: 32.0300 },
    district: 'Центральный',
    status: 'active',
    description: 'Эвакуатор на дежурстве',
    lastUpdate: '2024-01-15'
  },

  // ДТП
  {
    id: 10,
    type: 'accident',
    name: 'ДТП на ул. Соболева',
    address: 'г. Смоленск, ул. Соболева, д. 30',
    coordinates: { lat: 54.7760, lng: 32.0400 },
    district: 'Центральный',
    status: 'active',
    description: 'Столкновение двух автомобилей',
    lastUpdate: '2024-01-15'
  },
  {
    id: 11,
    type: 'accident',
    name: 'ДТП на пр. Строителей',
    address: 'г. Смоленск, пр. Строителей, д. 45',
    coordinates: { lat: 54.7920, lng: 32.0550 },
    district: 'Заднепровский',
    status: 'active',
    description: 'Наезд на пешехода',
    lastUpdate: '2024-01-14'
  },

  // Дорожные работы
  {
    id: 12,
    type: 'road_work',
    name: 'Ремонт дороги на ул. Революционной',
    address: 'г. Смоленск, ул. Революционная, д. 20-40',
    coordinates: { lat: 54.7740, lng: 32.0450 },
    district: 'Ленинский',
    status: 'active',
    description: 'Асфальтирование проезжей части',
    lastUpdate: '2024-01-15'
  },
  {
    id: 13,
    type: 'road_work',
    name: 'Укладка тротуарной плитки',
    address: 'г. Смоленск, ул. Коммунистическая, д. 15-25',
    coordinates: { lat: 54.7800, lng: 32.0500 },
    district: 'Центральный',
    status: 'active',
    description: 'Благоустройство пешеходной зоны',
    lastUpdate: '2024-01-14'
  }
];

// Районы Смоленска
export const districts = [
  'Центральный',
  'Ленинский', 
  'Заднепровский'
];

// Типы объектов
export const objectTypes = [
  { value: 'traffic_light', label: 'Светофоры', color: '#62a744' },
  { value: 'camera', label: 'Камеры', color: '#1976d2' },
  { value: 'evacuator', label: 'Эвакуаторы', color: '#f57c00' },
  { value: 'accident', label: 'ДТП', color: '#d32f2f' },
  { value: 'road_work', label: 'Дорожные работы', color: '#7b1fa2' }
];

// Статусы объектов
export const objectStatuses = [
  { value: 'active', label: 'Активные', color: '#4caf50' },
  { value: 'maintenance', label: 'На обслуживании', color: '#ff9800' },
  { value: 'inactive', label: 'Неактивные', color: '#f44336' }
];
