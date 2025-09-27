'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Button,
} from '@mui/material';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { NewsCard } from './NewsCard';
import { News } from '../types/news.types';

interface NewsListProps {
  news: News[];
  title?: string;
  showMoreButton?: boolean;
  onNewsClick?: (news: News) => void;
  onShowMore?: () => void;
}

export const NewsList: React.FC<NewsListProps> = ({ 
  news, 
  title = "Последние новости",
  showMoreButton = true,
  onNewsClick,
  onShowMore
}) => {
  return (
    <Box className="py-16 bg-white">
      <Container maxWidth="lg">
        <SectionHeader 
          title={title}
          subtitle="Следите за актуальными событиями в сфере дорожного движения"
        />
        
        <Grid container spacing={4} className="mt-8">
          {news.map((item) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item.id}>
              <NewsCard 
                news={item} 
                onClick={() => onNewsClick?.(item)}
              />
            </Grid>
          ))}
        </Grid>
        
        {showMoreButton && (
          <Box className="text-center mt-12">
            <Button 
              variant="outlined" 
              size="large"
              onClick={onShowMore}
            >
              Показать все новости
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};
