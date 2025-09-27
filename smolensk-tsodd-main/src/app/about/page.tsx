'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
} from '@mui/material';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { HoverCard } from '@/shared/components/ui/HoverCard';
import { IconBadge } from '@/shared/components/ui/IconBadge';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  Flag as FlagIcon,
  EmojiObjects as IdeaIcon,
  Favorite as HeartIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Nature as NatureIcon,
} from '@mui/icons-material';

const values = [
  {
    icon: <SecurityIcon />,
    title: 'Безопасность',
    description: 'Приоритет №1 — создание безопасной дорожной среды для всех участников движения',
  },
  {
    icon: <SpeedIcon />,
    title: 'Эффективность',
    description: 'Оптимизация транспортных потоков для экономии времени граждан',
  },
  {
    icon: <IdeaIcon />,
    title: 'Инновации',
    description: 'Внедрение современных технологий умного города',
  },
  {
    icon: <HeartIcon />,
    title: 'Забота',
    description: 'Человеческий подход к решению транспортных проблем',
  },
];

const milestones = [
  {
    year: '2018',
    title: 'Создание ЦОДД',
    description: 'Образование Центра организации дорожного движения Смоленской области',
  },
  {
    year: '2019',
    title: 'Первые умные светофоры',
    description: 'Установка адаптивных светофорных объектов в центре города',
  },
  {
    year: '2020',
    title: 'Запуск ситуационного центра',
    description: 'Создание единого центра мониторинга дорожной обстановки',
  },
  {
    year: '2022',
    title: 'Система фотовидеофиксации',
    description: 'Развертывание сети камер контроля нарушений ПДД',
  },
  {
    year: '2024',
    title: 'Цифровая трансформация',
    description: 'Запуск интеллектуальной транспортной системы региона',
  },
];

const team = [
  {
    name: 'Иванов Петр Сергеевич',
    position: 'Директор',
    photo: 'https://via.placeholder.com/150x150/62a744/ffffff?text=Фото',
  },
  {
    name: 'Смирнова Елена Владимировна',
    position: 'Заместитель директора',
    photo: 'https://via.placeholder.com/150x150/62a744/ffffff?text=Фото',
  },
  {
    name: 'Козлов Андрей Николаевич',
    position: 'Начальник отдела ИТС',
    photo: 'https://via.placeholder.com/150x150/62a744/ffffff?text=Фото',
  },
  {
    name: 'Новикова Мария Александровна',
    position: 'Начальник отдела аналитики',
    photo: 'https://via.placeholder.com/150x150/62a744/ffffff?text=Фото',
  },
];

export default function AboutPage() {
  return (
    <Container maxWidth="lg" className="py-16">
      {/* Заголовок */}
      <SectionHeader
        title="О Центре организации дорожного движения"
        subtitle={(
          <>Мы работаем для того, чтобы дороги Смоленской области стали безопаснее, а передвижение по ним — комфортнее и быстрее</>
        )}
        align="center"
        spacingBottom={6}
        maxSubtitleWidth={768}
      />

      {/* Миссия */}
      <Paper
        sx={{
          p: 4,
          mb: 6,
          color: 'common.white',
          background: (theme) =>
            `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 2 }} className="text-center">
            <FlagIcon sx={{ fontSize: 96, opacity: 0.8 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 10 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Наша миссия
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', lineHeight: 1.75 }}>
              Создание современной, безопасной и эффективной системы управления
              дорожным движением в Смоленской области с использованием передовых
              технологий и лучших мировых практик. Мы стремимся сделать дороги
              региона местом, где каждый участник движения чувствует себя защищенным,
              а время в пути используется максимально эффективно.
            </Typography>
          </Grid>
        </Grid>
      </Paper>


      {/* История развития */}
      <Box className="mb-12">
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
          История развития
        </Typography>
        <Timeline position="alternate">
          {milestones.map((milestone, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot sx={{ bgcolor: 'primary.main', color: 'common.white', aspectRatio: 1 / 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {milestone.year}
                </TimelineDot>
                {index < milestones.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {milestone.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {milestone.description}
                  </Typography>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>

      {/* Команда */}
      <Box className="mb-12">
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
          Наша команда
        </Typography>
        <Grid container spacing={4}>
          {team.map((member, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <HoverCard>
                <CardContent className="p-6">
                  <Avatar src={member.photo} sx={{ width: 128, height: 128, mx: 'auto', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {member.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {member.position}
                  </Typography>
                </CardContent>
              </HoverCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Достижения */}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%', bgcolor: 'success.50' }}>
            <NatureIcon sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
              -23%
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Снижение аварийности
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              За последние 2 года благодаря внедрению интеллектуальных систем
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%', bgcolor: 'info.50' }}>
            <SpeedIcon sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main', mb: 1 }}>
              +15%
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Скорость транспортного потока
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Оптимизация работы светофоров увеличила пропускную способность
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%', bgcolor: 'secondary.50' }}>
            <SecurityIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main', mb: 1 }}>
              98%
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Работоспособность систем
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Высокая надежность всех компонентов дорожной инфраструктуры
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}