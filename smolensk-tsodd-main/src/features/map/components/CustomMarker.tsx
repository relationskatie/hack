'use client';

import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { MapObject } from '@/types';
import { objectTypes } from '@/data/mapData';
import { Icon } from 'leaflet';
import { createIcon } from '@/features/map/services/mapUtils';

interface CustomMarkerProps {
  object: MapObject;
}

export const CustomMarker: React.FC<CustomMarkerProps> = ({ object }) => {
  const objectType = objectTypes.find(type => type.value === object.type);
  const color = objectType?.color || '#62a744';

  // Создаем кастомную иконку
  const svgString = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">
        ${getObjectIcon(object.type)}
      </text>
    </svg>
  `;

  const customIcon = createIcon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'maintenance': return '#ff9800';
      case 'inactive': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'maintenance': return 'На обслуживании';
      case 'inactive': return 'Неактивный';
      default: return 'Неизвестно';
    }
  };

  return (
    <Marker position={[object.coordinates.lat, object.coordinates.lng]} icon={customIcon}>
      <Popup maxWidth={240} minWidth={180} maxHeight={300}>
        <div className="p-2 max-h-[280px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <h3 className="font-semibold text-sm text-gray-800 truncate">
              {object.name}
            </h3>
          </div>

          <div className="space-y-1.5 text-xs">
            <div>
              <span className="font-medium text-gray-600">Адрес:</span>
              <p className="text-gray-800 break-words leading-tight">{object.address}</p>
            </div>

            <div>
              <span className="font-medium text-gray-600">Район:</span>
              <p className="text-gray-800">{object.district}</p>
            </div>

            {object.status && (
              <div>
                <span className="font-medium text-gray-600">Статус:</span>
                <p
                  className="text-xs font-medium"
                  style={{ color: getStatusColor(object.status) }}
                >
                  {getStatusText(object.status)}
                </p>
              </div>
            )}

            {object.installDate && (
              <div>
                <span className="font-medium text-gray-600">Установлен:</span>
                <p className="text-gray-800">
                  {new Date(object.installDate).toLocaleDateString('ru-RU')}
                </p>
              </div>
            )}

            {object.description && (
              <div>
                <span className="font-medium text-gray-600">Описание:</span>
                <p className="text-gray-800 break-words leading-tight">{object.description}</p>
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// Функция для получения иконки объекта
function getObjectIcon(type: string): string {
  switch (type) {
    case 'traffic_light': return '🚦';
    case 'camera': return '📹';
    case 'evacuator': return '🚛';
    case 'accident': return '⚠️';
    case 'road_work': return '🚧';
    default: return '📍';
  }
}
