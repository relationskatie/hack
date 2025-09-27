'use client';

import React from 'react';
import { BaseSearch, SearchConfig, SearchResult } from './BaseSearch';
import { getDefaultIcon, getDefaultTypeLabel } from './BaseSearch';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

// Моковые данные для поиска по сайту (обновлено под актуальные маршруты)
const searchData: SearchResult[] = [
  {
    id: 'home',
    title: 'Главная',
    description: 'Начальная страница портала',
    type: 'page',
    url: '/',
  },
  {
    id: 'about',
    title: 'О ЦОДД',
    description: 'Информация о Центре организации дорожного движения',
    type: 'page',
    url: '/about',
  },
  {
    id: 'analytics',
    title: 'Аналитика',
    description: 'Общая статистика дорожного движения',
    type: 'statistics',
    url: '/analytics',
  },
  {
    id: 'analytics-fines',
    title: 'Аналитика — Штрафы',
    description: 'Статистика по нарушениям ПДД и штрафам',
    type: 'statistics',
    url: '/analytics/fines',
  },
  {
    id: 'analytics-evacuations',
    title: 'Аналитика — Эвакуации',
    description: 'Статистика эвакуации транспортных средств',
    type: 'statistics',
    url: '/analytics/evacuations',
  },
  {
    id: 'analytics-accidents',
    title: 'Аналитика — ДТП',
    description: 'Статистика ДТП с пострадавшими и погибшими',
    type: 'statistics',
    url: '/analytics/accidents',
  },
  {
    id: 'infrastructure-map',
    title: 'Карта инфраструктуры',
    description: 'Интерактивная карта объектов',
    type: 'page',
    url: '/infrastructure-map',
  },
  {
    id: 'services',
    title: 'Услуги',
    description: 'Список услуг и сервисов',
    type: 'service',
    url: '/services',
  },
  {
    id: 'projects',
    title: 'Проекты',
    description: 'Инициативы и проекты ЦОДД',
    type: 'project',
    url: '/projects',
  },
  {
    id: 'news',
    title: 'Новости',
    description: 'Последние новости и обновления',
    type: 'news',
    url: '/news',
  },
  {
    id: 'documents',
    title: 'Документы',
    description: 'Официальные документы и нормативы',
    type: 'document',
    url: '/documents',
  },
  {
    id: 'contacts',
    title: 'Контакты',
    description: 'Контактная информация и адреса',
    type: 'contact',
    url: '/contacts',
  },
  {
    id: 'vacancies',
    title: 'Вакансии',
    description: 'Актуальные вакансии',
    type: 'vacancy',
    url: '/vacancies',
  },
  {
    id: 'orders',
    title: 'Заявки',
    description: 'Список заявок и обращений',
    type: 'order',
    url: '/orders',
  },
  {
    id: 'brandbook',
    title: 'Брендбук',
    description: 'Руководство по использованию бренда',
    type: 'document',
    url: '/brandbook',
  },
  {
    id: 'login',
    title: 'Вход',
    description: 'Авторизация пользователей',
    type: 'page',
    url: '/login',
  },
];

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
  // Конфигурация для пользовательского поиска
  const globalSearchConfig: SearchConfig = {
    placeholder: 'Поиск по сайту...',
    emptyMessage: 'Ничего не найдено по запросу "{query}"',
    emptySubMessage: 'Попробуйте изменить поисковый запрос',
    results: searchData,
    getIcon: getDefaultIcon,
    getTypeLabel: getDefaultTypeLabel,
  };

  return (
    <BaseSearch
      open={open}
      onClose={onClose}
      config={globalSearchConfig}
    />
  );
};