'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NewsList } from './NewsList';
import { News } from '../types/news.types';
import { NewsApi, BackendNewsItem } from '../services/news.api';

// Функция для преобразования данных с бэкенда в формат фронтенда
const transformNewsItem = (item: BackendNewsItem): News => {
  // Функция для получения URL изображения
  const getImageUrl = (): string => {
    if (item.file_url) {
      return item.file_url;
    }
    if (item.file) {
      // Если это base64 данные без префикса
      if (!item.file.startsWith('data:image/')) {
        return `data:image/jpeg;base64,${item.file}`;
      }
      return item.file;
    }
    return ''; // Пустая строка, placeholder будет показан в компоненте
  };

  return {
    id: item.id,
    title: item.title,
    description: item.content.length > 150 ? item.content.substring(0, 150) + '...' : item.content,
    content: item.content,
    date: item.created_at ? new Date(item.created_at).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Дата не указана',
    author: 'ЦОДД Смоленской области',
    image: getImageUrl(),
    views: Math.floor(Math.random() * 500) + 50, // Временное решение, пока нет API для просмотров
    readTime: `${Math.ceil(item.content.length / 500)} мин`,
    status: 'published'
  };
};

export const NewsSection: React.FC = () => {
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await NewsApi.list({ limit: 3 });
        const transformedNews = response.items.map(transformNewsItem);
        setNews(transformedNews);
      } catch (err) {
        console.error('Ошибка загрузки новостей:', err);
        setError('Не удалось загрузить новости');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleNewsClick = (news: News) => {
    router.push(`/news/${news.id}`);
  };

  const handleShowMore = () => {
    router.push('/news');
  };

  if (loading) {
    return <div>Загрузка новостей...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <NewsList
      news={news}
      onNewsClick={handleNewsClick}
      onShowMore={handleShowMore}
    />
  );
};
