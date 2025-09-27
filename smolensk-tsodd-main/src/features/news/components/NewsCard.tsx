'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Button,
} from '@mui/material';
import { CalendarToday as CalendarIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { News } from '../types/news.types';

interface NewsCardProps {
  news: News;
  onClick?: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onClick }) => {
  // Функция для получения URL изображения
  const getImageUrl = (image: string): string => {
    // Если это base64 данные
    if (image.startsWith('data:image/')) {
      return image;
    }
    // Если это base64 строка без префикса
    if (image && !image.startsWith('http') && !image.startsWith('/')) {
      return `data:image/jpeg;base64,${image}`;
    }
    // Если это URL
    return image;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Предотвращаем клик по карточке, если кликнули по кнопке
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.();
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <Card
      className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={handleCardClick}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardMedia
        component="img"
        height="200"
        image={news.image ? getImageUrl(news.image) : '/placeholder.svg'}
        alt={news.title}
        className="object-cover aspect-square"
        onError={(e) => {
          // Заменяем на placeholder при ошибке загрузки
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder.svg';
        }}
      />
      <CardContent 
        className="flex flex-col p-4"
        sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Box className="flex items-center gap-2 mb-2">
          <Box className="flex items-center text-gray-500 text-sm">
            <CalendarIcon className="mr-1" fontSize="small" />
            {news.date}
          </Box>
        </Box>

        <Typography
          variant="h6"
          component="h3"
          sx={{ fontWeight: 600 }}
          className="line-clamp-2"
        >
          {news.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ 
            fontWeight: 400, 
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          mb={2}
        >
          {news.description}
        </Typography>

        <Box className="flex items-center justify-between mt-auto">
          <Box className="flex flex-col">
            <Typography variant="caption" color="text.secondary">
              ЦОДД Смоленской области
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {news.readTime}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={handleButtonClick}
            className="bg-primary-main hover:bg-primary-dark text-white"
            sx={{ minWidth: 'auto' }}
          >
            Подробнее
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
