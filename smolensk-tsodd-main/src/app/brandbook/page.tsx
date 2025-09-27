"use client";

import React from 'react';
import { Box, Container, Grid, Paper, Typography, Chip, Divider } from '@mui/material';
import { theme } from '@/shared/utils/theme';
import SectionHeader from '@/shared/components/ui/SectionHeader';

const ColorSwatch: React.FC<{ name: string; value: string; note?: string }> = ({ name, value, note }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
    <Box sx={{ height: 72, borderRadius: 1, bgcolor: value, mb: 1 }} />
    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{name}</Typography>
    <Typography variant="body2" color="text.secondary">{value}</Typography>
    {note && (
      <Typography variant="caption" color="text.secondary">{note}</Typography>
    )}
  </Paper>
);

const TypeSpec: React.FC<{ label: string; variant: any; sample?: string }> = ({ label, variant, sample }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>{label}</Typography>
    <Typography variant={label.toLowerCase() as any} sx={{ mb: 1 }}>
      {sample || 'Смоленский ЦОДД — системность, ясность, доступность.'}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {`size: ${(theme.typography[label.toLowerCase() as keyof typeof theme.typography] as any)?.fontSize}, `}
      {`weight: ${(theme.typography[label.toLowerCase() as keyof typeof theme.typography] as any)?.fontWeight ?? 400}, `}
      {`line-height: ${(theme.typography[label.toLowerCase() as keyof typeof theme.typography] as any)?.lineHeight}`}
    </Typography>
  </Paper>
);

export default function BrandbookPage() {
  const palette = theme.palette;
  const typography = theme.typography as any;

  return (
    <Container sx={{ py: 6 }}>
      <SectionHeader
        title="Брендбук"
        subtitle="Ключевые элементы айдентики и UI-системы проекта: палитра, типографика, компоненты и принципы применения."
        align="left"
        spacingBottom={6}
      />

      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Цвета</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><ColorSwatch name="Primary / Main" value={palette.primary.main} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><ColorSwatch name="Primary / Light" value={palette.primary.light} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><ColorSwatch name="Primary / Dark" value={palette.primary.dark} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><ColorSwatch name="Secondary / Main" value={palette.secondary.main} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><ColorSwatch name="Secondary / Light" value={palette.secondary.light!} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><ColorSwatch name="Secondary / Dark" value={palette.secondary.dark!} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><ColorSwatch name="Background / Default" value={palette.background.default} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><ColorSwatch name="Background / Paper" value={palette.background.paper} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><ColorSwatch name="Success" value={palette.success.main} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><ColorSwatch name="Error" value={palette.error.main} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><ColorSwatch name="Warning" value={palette.warning.main} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><ColorSwatch name="Info" value={palette.info.main} /></Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Типографика</Typography>
        <Box sx={{ mb: 2 }}>
          <Chip label={`Семейство: ${typography.fontFamily}`} sx={{ mr: 1 }} />
          <Chip label="Система: H1–H6, Body1–Body2" />
        </Box>
        <Grid container spacing={2}>
          {['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Body1', 'Body2'].map((label) => (
            <Grid key={label} size={{ xs: 12, md: 6 }}>
              <TypeSpec label={label} variant={(label.toLowerCase() as any)} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Компоненты</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Кнопки</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Текст без CAPS, padding 8×24, вес 500, скругление 8px, мягкие тени.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="Contained" color="primary" />
                <Chip label="Outlined" variant="outlined" color="primary" />
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Карточки</Typography>
              <Typography variant="body2" color="text.secondary">
                Радиус 12px, базовая тень 0 2px 8px, hover 0 4px 16px.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Поля ввода</Typography>
              <Typography variant="body2" color="text.secondary">
                Вариант outlined, радиус 8px.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Моушн</Typography>
              <Typography variant="body2" color="text.secondary">
                Базовая анимация fadeIn 0.3s ease‑out, смещение 10px.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Принципы</Typography>
        <Typography variant="body1" color="text.secondary">
          Доступность (контраст, фокус), ясность и консистентность. Избегать лишних акцентов, опираться на
          primary для действий, вторичные элементы — в серой гамме. Единые радиусы: 8px базово, 12px для карточек.
        </Typography>
      </Box>
    </Container>
  );
}


