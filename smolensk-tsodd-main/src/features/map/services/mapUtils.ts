import { Icon } from 'leaflet';

// Создание кастомной иконки для маркеров
export const createIcon = (options: {
  iconUrl: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
  popupAnchor?: [number, number];
}) => {
  return new Icon({
    iconUrl: options.iconUrl,
    iconSize: options.iconSize,
    iconAnchor: options.iconAnchor,
    popupAnchor: options.popupAnchor || [0, 0],
    className: 'custom-marker'
  });
};

// Центр Смоленска
export const SMOLENSK_CENTER = {
  lat: 54.78,
  lng: 32.05
};

// Дефолтный зум карты
export const DEFAULT_ZOOM = 13;

// Минимальный и максимальный зум
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 18;

// Фильтрация объектов по параметрам
export const filterObjects = (
  objects: any[],
  filters: {
    type?: string | null;
    district?: string | null;
    status?: string | null;
    dateFrom?: string | null;
    dateTo?: string | null;
  }
) => {
  return objects.filter(obj => {
    // Фильтр по типу
    if (filters.type && obj.type !== filters.type) {
      return false;
    }

    // Фильтр по району
    if (filters.district && obj.district !== filters.district) {
      return false;
    }

    // Фильтр по статусу
    if (filters.status && obj.status !== filters.status) {
      return false;
    }

    // Фильтр по дате установки
    if (filters.dateFrom && obj.installDate) {
      const installDate = new Date(obj.installDate);
      const fromDate = new Date(filters.dateFrom);
      if (installDate < fromDate) {
        return false;
      }
    }

    if (filters.dateTo && obj.installDate) {
      const installDate = new Date(obj.installDate);
      const toDate = new Date(filters.dateTo);
      if (installDate > toDate) {
        return false;
      }
    }

    return true;
  });
};

// Получение границ для всех объектов
export const getBounds = (objects: any[]) => {
  if (objects.length === 0) {
    return [
      [SMOLENSK_CENTER.lat - 0.01, SMOLENSK_CENTER.lng - 0.01],
      [SMOLENSK_CENTER.lat + 0.01, SMOLENSK_CENTER.lng + 0.01]
    ];
  }

  const lats = objects.map(obj => obj.coordinates.lat);
  const lngs = objects.map(obj => obj.coordinates.lng);

  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)]
  ];
};

// Форматирование даты для отображения
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Получение цвета для типа объекта
export const getObjectTypeColor = (type: string) => {
  const colors: { [key: string]: string } = {
    traffic_light: '#62a744',
    camera: '#1976d2',
    evacuator: '#f57c00',
    accident: '#d32f2f',
    road_work: '#7b1fa2'
  };
  return colors[type] || '#62a744';
};

// Получение цвета для статуса объекта
export const getStatusColor = (status?: string) => {
  const colors: { [key: string]: string } = {
    active: '#4caf50',
    maintenance: '#ff9800',
    inactive: '#f44336'
  };
  return colors[status || ''] || '#9e9e9e';
};
