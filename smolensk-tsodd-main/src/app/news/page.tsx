'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Box, Grid, Alert, CircularProgress } from '@mui/material';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { NewsCard } from '@/features/news/components/NewsCard';
import UnifiedFilterPanel from '@/shared/components/ui/UnifiedFilterPanel';
import useUnifiedFilters, { createSortFunctions, useSorting } from '@/shared/hooks/useUnifiedFilters';
import { NewsApi, type BackendNewsItem } from '@/features/news/services/news.api';
import { News } from '@/features/news/types/news.types';

const sortOptions = [
  { value: 'date_desc', label: 'Сначала новые' },
  { value: 'date_asc', label: 'Сначала старые' },
  { value: 'title_asc', label: 'По названию (А-Я)' },
  { value: 'title_desc', label: 'По названию (Я-А)' },
];

const filterFields: any[] = [];

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
    views: Math.floor(Math.random() * 500) + 50,
    readTime: `${Math.ceil(item.content.length / 500)} мин`,
    status: 'published'
  };
};

// Функции сортировки
const sortFunctions = {
  date_desc: createSortFunctions.date<News>(item => item.date, 'desc'),
  date_asc: createSortFunctions.date<News>(item => item.date, 'asc'),
  title_asc: createSortFunctions.string<News>(item => item.title, 'asc'),
  title_desc: createSortFunctions.string<News>(item => item.title, 'desc'),
};

export default function NewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Используем универсальные фильтры
  const {
    searchValue,
    sortValue,
    filterValues,
    setSearchValue,
    setSortValue,
    setFilterValue,
    clearAllFilters,
    hasActiveFilters,
    filterData
  } = useUnifiedFilters({
    defaultSort: 'date_desc',
    defaultFilters: {},
    fields: filterFields
  });

  // Загрузка данных
  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const limit = 12;
        const offset = (page - 1) * limit;
        const [{ items }, countRes] = await Promise.all([
          NewsApi.list({ limit, offset }),
          NewsApi.count().catch(() => ({ count: 0 })),
        ]);

        const transformedNews = (items || []).map(transformNewsItem);
        setNews(transformedNews);
        const total = countRes?.count ?? transformedNews.length;
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
      } catch (err: any) {
        console.error('Ошибка загрузки новостей:', err);
        setError('Не удалось загрузить новости');
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [page]);

  // Функция фильтрации новостей
  const filterNews = (item: News, filters: any) => {
    // Поиск по заголовку и содержимому
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.content.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    return true;
  };

  // Применяем фильтрацию и сортировку
  const filteredNews = filterData(news, filterNews);
  const sortedNews = useSorting(filteredNews, sortValue, sortFunctions);

  const handleNewsClick = (newsItem: News) => {
    console.log('News item ID:', newsItem.id, 'Type:', typeof newsItem.id);
    router.push(`/news/${newsItem.id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <SectionHeader
        title="Новости"
        subtitle="Следите за актуальными событиями в сфере дорожного движения"
        spacingBottom={4}
      />

      {/* Универсальная панель фильтров */}
      <UnifiedFilterPanel
        // Поиск
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Поиск по новостям..."

        // Фильтры
        filterFields={filterFields}
        filterValues={filterValues}
        onFilterChange={setFilterValue}

        // Сортировка
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={setSortValue}

        // Управление
        onClear={clearAllFilters}
        showClearButton={hasActiveFilters}

        // Стилизация
        variant="standard"
        collapsible={false}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Список новостей */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {sortedNews.length === 0 ? (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Alert severity="info">
                    {hasActiveFilters ? 'Новости по заданным критериям не найдены' : 'Новости не найдены'}
                  </Alert>
                </Box>
              </Grid>
            ) : (
              sortedNews.map((item) => (
                <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <NewsCard
                    news={item}
                    onClick={() => handleNewsClick(item)}
                  />
                </Grid>
              ))
            )}
          </Grid>

          {/* Пагинация */}
          {!hasActiveFilters && totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <div>Пагинация: страница {page} из {totalPages}</div>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}