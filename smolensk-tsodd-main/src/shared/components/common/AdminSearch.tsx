'use client';

import React, { useState } from 'react';
import { BaseSearch, SearchConfig, SearchResult } from './BaseSearch';
import { getDefaultIcon, getDefaultTypeLabel } from './BaseSearch';
import { NewsApi } from '@/features/news/services/news.api';
import { ProjectsApi } from '@/features/projects';
import { OrdersApi } from '@/features/orders/orders.api';
import { VacanciesApi } from '@/features/vacancies/services/vacancies.api';

interface AdminSearchProps {
  open: boolean;
  onClose: () => void;
}

export const AdminSearch: React.FC<AdminSearchProps> = ({ open, onClose }) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Конфигурация для админского поиска
  const adminSearchConfig: SearchConfig = {
    placeholder: 'Поиск по админ панели...',
    emptyMessage: 'Ничего не найдено по запросу "{query}"',
    emptySubMessage: 'Попробуйте изменить поисковый запрос или проверьте правописание',
    results: searchResults,
    getIcon: getDefaultIcon,
    getTypeLabel: getDefaultTypeLabel,
  };

  // Функция поиска для админ панели
  const handleAdminSearch = async (query: string): Promise<SearchResult[]> => {
    try {
      const results: SearchResult[] = [];
      const searchTerm = query.toLowerCase();

      // Поиск по новостям
      try {
        const newsResponse = await NewsApi.list({ limit: 50 });
        if (newsResponse?.items) {
          const matchingNews = newsResponse.items
            .filter(news =>
              news.title.toLowerCase().includes(searchTerm) ||
              news.content?.toLowerCase().includes(searchTerm)
            )
            .slice(0, 5)
            .map(news => ({
              id: `news-${news.id}`,
              title: news.title,
              description: news.content?.substring(0, 100) + '...' || 'Новость без описания',
              type: 'news',
              url: `/admin/news/edit/${news.id}`,
              icon: getDefaultIcon('news'),
            }));
          results.push(...matchingNews);
        }
      } catch (error) {
        console.warn('Ошибка поиска новостей:', error);
      }

      // Поиск по проектам
      try {
        const projectsResponse = await ProjectsApi.list({ limit: 50 });
        if (projectsResponse && Array.isArray(projectsResponse)) {
          const matchingProjects = projectsResponse
            .filter(project =>
              project.Title.toLowerCase().includes(searchTerm) ||
              project.Description?.toLowerCase().includes(searchTerm)
            )
            .slice(0, 5)
            .map(project => ({
              id: `project-${project.ID}`,
              title: project.Title,
              description: project.Description?.substring(0, 100) + '...' || 'Проект без описания',
              type: 'project',
              url: `/admin/projects`,
              icon: getDefaultIcon('project'),
            }));
          results.push(...matchingProjects);
        }
      } catch (error) {
        console.warn('Ошибка поиска проектов:', error);
      }

      // Поиск по заказам
      try {
        const ordersResponse = await OrdersApi.listAll({ limit: 50 });
        if (ordersResponse?.orders) {
          const matchingOrders = ordersResponse.orders
            .filter(order =>
              order.order_id.toString().includes(searchTerm) ||
              order.description?.toLowerCase().includes(searchTerm) ||
              order.customer_id?.toLowerCase().includes(searchTerm)
            )
            .slice(0, 5)
            .map(order => ({
              id: `order-${order.order_id}`,
              title: `Заказ #${order.order_id}`,
              description: order.description || 'Заказ без описания',
              type: 'order',
              url: `/admin/orders`,
              icon: getDefaultIcon('order'),
            }));
          results.push(...matchingOrders);
        }
      } catch (error) {
        console.warn('Ошибка поиска заказов:', error);
      }

      // Поиск по вакансиям
      try {
        const vacanciesResponse = await VacanciesApi.list({ limit: 50 });
        if (vacanciesResponse?.items) {
          const matchingVacancies = vacanciesResponse.items
            .filter(vacancy =>
              vacancy.position.toLowerCase().includes(searchTerm) ||
              vacancy.description?.toLowerCase().includes(searchTerm)
            )
            .slice(0, 5)
            .map(vacancy => ({
              id: `vacancy-${vacancy.id}`,
              title: vacancy.position,
              description: vacancy.description?.substring(0, 100) + '...' || 'Вакансия без описания',
              type: 'vacancy',
              url: `/admin/vacancies`,
              icon: getDefaultIcon('vacancy'),
            }));
          results.push(...matchingVacancies);
        }
      } catch (error) {
        console.warn('Ошибка поиска вакансий:', error);
      }

      // Добавляем статические ссылки на основные разделы
      const staticResults: SearchResult[] = [
        {
          id: 'admin-dashboard',
          title: 'Главная панель',
          description: 'Перейти на главную страницу админ панели',
          type: 'dashboard',
          url: '/admin',
          icon: getDefaultIcon('dashboard'),
        },
        {
          id: 'admin-analytics',
          title: 'Аналитика',
          description: 'Просмотр аналитики',
          type: 'statistics',
          url: '/analytics',
          icon: getDefaultIcon('statistics'),
        },
        {
          id: 'admin-contacts',
          title: 'Контакты',
          description: 'Управление контактной информацией',
          type: 'contact',
          url: '/admin/contacts',
          icon: getDefaultIcon('contact'),
        },
        {
          id: 'admin-documents',
          title: 'Документы',
          description: 'Управление документами и файлами',
          type: 'document',
          url: '/admin/documents',
          icon: getDefaultIcon('document'),
        },
      ].filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );

      results.push(...staticResults);

      return results.slice(0, 20); // Ограничиваем количество результатов
    } catch (error) {
      console.error('Ошибка поиска:', error);
      return [];
    }
  };

  return (
    <BaseSearch
      open={open}
      onClose={onClose}
      config={adminSearchConfig}
      onSearch={handleAdminSearch}
    />
  );
};
