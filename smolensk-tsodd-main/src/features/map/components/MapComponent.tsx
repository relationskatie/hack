'use client';

import React, { useState, useMemo, useEffect } from 'react';


import 'leaflet/dist/leaflet.css';

// Динамически импортируем CSS только на клиенте
import { CustomMarker } from './CustomMarker';
import { mapObjects, objectTypes, districts, objectStatuses } from '@/data/mapData';
import { MapObject, MapFilter } from '@/types';
import { filterObjects, getBounds, SMOLENSK_CENTER, DEFAULT_ZOOM } from '@/features/map/services/mapUtils';
import { Box, Paper, Typography, Button, Chip, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { FilterList, Clear, LocationOn } from '@mui/icons-material';
import { MapContainer, TileLayer } from 'react-leaflet';

// Компонент для автоматического изменения границ карты
const MapBounds: React.FC<{ objects: MapObject[] }> = ({ objects }) => {
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-leaflet').then(({ useMap }) => {
        // Динамически получаем map instance
        const mapInstance = useMap();
        setMap(mapInstance);
      });
    }
  }, []);

  useEffect(() => {
    if (map && objects.length > 0) {
      const bounds = getBounds(objects) as [[number, number], [number, number]];
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [objects, map]);

  return null;
};

export const MapComponent: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [filters, setFilters] = useState<MapFilter>({
    type: null,
    district: null,
    status: null,
    dateFrom: null,
    dateTo: null
  });

  const [showFilters, setShowFilters] = useState(false);

  // Проверяем, что мы на клиенте
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Фильтрация объектов
  const filteredObjects = useMemo(() => {
    return filterObjects(mapObjects, filters);
  }, [filters]);

  // Статистика по объектам
  const stats = useMemo(() => {
    const total = mapObjects.length;
    const filtered = filteredObjects.length;
    const byType = objectTypes.reduce((acc, type) => {
      acc[type.value] = mapObjects.filter(obj => obj.type === type.value).length;
      return acc;
    }, {} as Record<string, number>);

    return { total, filtered, byType };
  }, [filteredObjects]);

  const handleFilterChange = (key: keyof MapFilter, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: null,
      district: null,
      status: null,
      dateFrom: null,
      dateTo: null
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== null);

  return (
    <div className="w-full">
      {/* Заголовок и статистика */}
      <Box className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <Typography variant="h5" className="font-bold text-gray-800 text-lg sm:text-xl" sx={{ mb: '8px' }}>
              Интерактивная карта инфраструктуры
            </Typography>
            <Typography variant="body2" className="text-gray-600 text-sm sm:text-base">
              Отображено {stats.filtered} из {stats.total} объектов
            </Typography>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs sm:text-sm"
              size="small"
            >
              Фильтры
            </Button>

            {hasActiveFilters && (
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={clearFilters}
                className="text-xs sm:text-sm"
                size="small"
              >
                Очистить
              </Button>
            )}
          </div>
        </div>

        {/* Статистика по типам объектов */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
          {objectTypes.map(type => (
            <Chip
              key={type.value}
              label={`${type.label}: ${stats.byType[type.value]}`}
              size="small"
              className="text-xs"
              style={{
                backgroundColor: type.color + '20',
                color: type.color,
                border: `1px solid ${type.color}40`,
                fontSize: '0.75rem'
              }}
            />
          ))}
        </div>
      </Box>

      {/* Панель фильтров */}
      {showFilters && (
        <Paper className="p-3 sm:p-4 mb-4">
          <Typography variant="h6" className="font-semibold text-sm sm:text-base" sx={{ mb: { xs: '12px', sm: '16px' } }}>
            Фильтры
          </Typography>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <FormControl size="small">
              <InputLabel>Тип объекта</InputLabel>
              <Select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || null)}
                label="Тип объекта"
              >
                <MenuItem value="">Все типы</MenuItem>
                {objectTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Район</InputLabel>
              <Select
                value={filters.district || ''}
                onChange={(e) => handleFilterChange('district', e.target.value || null)}
                label="Район"
              >
                <MenuItem value="">Все районы</MenuItem>
                {districts.map(district => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || null)}
                label="Статус"
              >
                <MenuItem value="">Все статусы</MenuItem>
                {objectStatuses.map(status => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className="flex flex-col sm:flex-row gap-2">
              <TextField
                size="small"
                type="date"
                label="От даты"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value || null)}
                InputLabelProps={{ shrink: true }}
                className="flex-1"
                sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
              />
              <TextField
                size="small"
                type="date"
                label="До даты"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value || null)}
                InputLabelProps={{ shrink: true }}
                className="flex-1"
                sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
              />
            </div>
          </div>
        </Paper>
      )}

      {/* Карта */}
      <Paper className="overflow-hidden">
        <div className="h-[400px] sm:h-[500px] w-full">
          {isClient ? (
            <MapContainer
              center={[SMOLENSK_CENTER.lat, SMOLENSK_CENTER.lng]}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom={true}
              className="h-full w-full"
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution=""
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Автоматическое изменение границ */}
              <MapBounds objects={filteredObjects} />

              {/* Маркеры объектов */}
              {filteredObjects.map(object => (
                <CustomMarker key={object.id} object={object} />
              ))}
            </MapContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <Typography variant="body1" color="text.secondary">
                Загрузка карты...
              </Typography>
            </div>
          )}
        </div>
      </Paper>

      {/* Легенда */}
      <Paper className="p-3 sm:p-4 mt-4">
        <Typography variant="h6" className="font-semibold text-sm sm:text-base" sx={{ mb: '12px' }}>
          Легенда
        </Typography>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {objectTypes.map(type => (
            <div key={type.value} className="flex items-center gap-2">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-xs sm:text-sm text-gray-700 truncate">{type.label}</span>
            </div>
          ))}
        </div>
      </Paper>
    </div>
  );
};
