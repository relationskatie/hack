'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  LinearProgress,
  Chip,
  Button,
} from '@mui/material';
import { HoverCard } from '@/shared/components/ui/HoverCard';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import AppButton from '@/shared/components/ui/AppButton';
import { 
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import Link from 'next/link';

const projects = [
  {
    id: 1,
    title: 'Модернизация светофорных объектов на пр. Гагарина',
    description: 'Установка современных светодиодных светофоров с адаптивным управлением',
    progress: 75,
    status: 'in-progress',
    budget: '12.5 млн ₽',
    deadline: 'Март 2025',
  },
  {
    id: 2,
    title: 'Создание «умных» пешеходных переходов',
    description: 'Оборудование переходов системами автоматического освещения и предупреждения',
    progress: 100,
    status: 'completed',
    budget: '8.3 млн ₽',
    deadline: 'Декабрь 2024',
  },
  {
    id: 3,
    title: 'Внедрение системы весогабаритного контроля',
    description: 'Установка автоматических пунктов контроля на въездах в город',
    progress: 30,
    status: 'in-progress',
    budget: '25 млн ₽',
    deadline: 'Июнь 2025',
  },
];

export const ProjectsSection: React.FC = () => {
  return (
    <Box className="py-16 bg-white">
      <Container maxWidth="lg">
        <SectionHeader
          title="Текущие проекты"
          subtitle="Мы постоянно работаем над улучшением дорожной инфраструктуры региона"
          align="center"
          spacingBottom={6}
          maxSubtitleWidth={672}
        />

        <Grid container spacing={4}>
          {projects.map((project) => (
            <Grid size={{ xs: 12, md: 4 }} key={project.id}>
              <HoverCard>
                <CardContent className="p-6">
                  <Box className="flex items-start justify-between" sx={{ mb: '16px' }}>
                    <Chip
                      icon={project.status === 'completed' ? <CheckIcon /> : <ScheduleIcon />}
                      label={project.status === 'completed' ? 'Завершен' : 'В работе'}
                      color={project.status === 'completed' ? 'success' : 'primary'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="h6" className="font-semibold" sx={{ mb: '8px' }}>
                    {project.title}
                  </Typography>
                  
                  <Typography variant="body2" className="text-gray-600" sx={{ mb: '16px' }}>
                    {project.description}
                  </Typography>

                  <Box sx={{ mb: '16px' }}>
                    <Box className="flex justify-between items-center" sx={{ mb: '4px' }}>
                      <Typography variant="caption" className="text-gray-500">
                        Прогресс
                      </Typography>
                      <Typography variant="caption" className="font-semibold">
                        {project.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress} 
                      className="h-2 rounded"
                      color={project.status === 'completed' ? 'success' : 'primary'}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" className="text-gray-500">
                        Бюджет
                      </Typography>
                      <Typography variant="body2" className="font-semibold">
                        {project.budget}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" className="text-gray-500">
                        Срок
                      </Typography>
                      <Typography variant="body2" className="font-semibold">
                        {project.deadline}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </HoverCard>
            </Grid>
          ))}
        </Grid>

        <Box className="text-center mt-8">
          <Link href="/projects" passHref>
            <AppButton styleType="primary" size="large" endIcon={<ArrowForwardIcon />}>Все проекты</AppButton>
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default ProjectsSection;