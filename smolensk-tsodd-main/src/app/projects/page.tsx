'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { HoverCard } from '@/shared/components/ui/HoverCard';
import { Description as DescriptionIcon, Download as DownloadIcon } from '@mui/icons-material';
import { getFileIcon, getFileTypeLabel } from '@/shared/utils/fileIconUtils';
import { ProjectsApi, type BackendProjectItem } from '@/features/projects/services/projects.api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<BackendProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProjectsApi.list({ limit: 100, offset: 0 });
      setProjects(response || []);
    } catch (e: any) {
      console.error('Ошибка загрузки проектов:', e);
      setError(e?.message || 'Не удалось загрузить проекты');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDownload = async (project: BackendProjectItem) => {
    try {
      setDownloadingIds(prev => new Set(prev).add(project.ID));

      if (project.FileURL && project.FileURL.trim() !== '') {
        // Если есть прямая ссылка на файл
        const link = window.document.createElement('a');
        link.href = project.FileURL;
        link.download = project.Filename || project.Title;
        link.target = '_blank';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      } else if (project.Filename && project.Filename.trim() !== '') {
        // Скачиваем через API, получая файл в base64
        console.log('Скачиваем файл для проекта:', project.ID);
        const projectWithFile = await ProjectsApi.download(project.ID);
        console.log('Получен ответ API:', projectWithFile);

        if (projectWithFile.File && projectWithFile.File.trim() !== '') {
          try {
            // Конвертируем base64 в blob
            const byteCharacters = atob(projectWithFile.File);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            
            // Определяем MIME тип по расширению файла
            const filename = projectWithFile.Filename || projectWithFile.Title;
            const extension = filename.split('.').pop()?.toLowerCase();
            let mimeType = 'application/octet-stream';
            
            switch (extension) {
              case 'pdf': mimeType = 'application/pdf'; break;
              case 'doc': mimeType = 'application/msword'; break;
              case 'docx': mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; break;
              case 'zip': mimeType = 'application/zip'; break;
              case 'rar': mimeType = 'application/x-rar-compressed'; break;
              case 'txt': mimeType = 'text/plain'; break;
              case 'jpg':
              case 'jpeg': mimeType = 'image/jpeg'; break;
              case 'png': mimeType = 'image/png'; break;
            }
            
            const blob = new Blob([byteArray], { type: mimeType });

            // Создаем ссылку для скачивания
            const url = window.URL.createObjectURL(blob);
            const link = window.document.createElement('a');
            link.href = url;
            link.download = filename;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log('Файл успешно скачан:', filename);
          } catch (base64Error) {
            console.error('Ошибка обработки base64:', base64Error);
            throw new Error('Не удалось обработать файл. Возможно, файл поврежден.');
          }
        } else {
          console.log('Файл не найден в ответе API');
          throw new Error('Файл не найден на сервере');
        }
      } else {
        console.log('У проекта нет файла:', project);
        alert('У проекта нет прикрепленного файла');
      }
    } catch (error) {
      console.error('Ошибка скачивания файла:', error);
      const errorMessage = error instanceof Error ? error.message : 'Не удалось скачать файл. Попробуйте позже.';
      alert(`Ошибка скачивания: ${errorMessage}`);
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(project.ID);
        return newSet;
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SectionHeader
        title="Проекты ЦОДД"
        subtitle="Инициативы по улучшению дорожной инфраструктуры и безопасности"
        spacingBottom={3}
      />

      {loading ? (
        <Box className="flex items-center justify-center" sx={{ py: '32px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : null}

      {!loading && !error && projects.length === 0 && (
        <Box className="text-center py-8">
          <Typography variant="body2" color="text.secondary">
            Проекты не найдены
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid key={project.ID} size={{ xs: 12 }}>
            <HoverCard>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {project.Title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                      {project.Description}
                    </Typography>
                    <Box className="flex items-center gap-1 mb-2">
                      {project.Filename ? (
                        <>
                          <DescriptionIcon className="text-blue-600 text-sm" />
                          <Typography variant="body2" className="truncate">
                            {project.Filename}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Файл не прикреплен
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Box sx={{ '& > * + *': { mt: 1.5 } }}>
                        <Box className="flex items-center gap-2">
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Дата создания
                          </Typography>
                          <Typography variant="body2">
                            {project.CreatedAt ? new Date(project.CreatedAt).toLocaleDateString('ru-RU') : '-'}
                          </Typography>
                        </Box>

                        {project.Filename && (
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Документ
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getFileIcon(project.Filename, { size: 16 })}
                                <Typography variant="body2">{getFileTypeLabel(project.Filename)}</Typography>
                              </Box>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDownload(project)}
                                disabled={downloadingIds.has(project.ID)}
                                title="Скачать файл"
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </HoverCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}