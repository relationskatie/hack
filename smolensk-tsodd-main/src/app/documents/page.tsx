'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Grid, Alert, CircularProgress, IconButton, Chip } from '@mui/material';
import {
  Description as DocumentIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { getFileIcon, getFileTypeLabel } from '@/shared/utils/fileIconUtils';
import { DocumentsApi, type BackendDocumentItem } from '@/features/documents/services/documents.api';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<BackendDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await DocumentsApi.list({ limit: 50, offset: 0 });
      setDocuments(response.items || []);
    } catch (e: any) {
      console.error('Ошибка загрузки документов:', e);
      setError(e?.message || 'Не удалось загрузить документы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const handleDownload = async (document: BackendDocumentItem) => {
    try {
      setDownloadingIds(prev => new Set(prev).add(document.id));

      if (document.file_url) {
        // Если есть прямая ссылка на файл
        const link = window.document.createElement('a');
        link.href = document.file_url;
        link.download = document.filename || document.title;
        link.target = '_blank';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      } else {
        // Скачиваем через API, получая файл в base64
        const documentWithFile = await DocumentsApi.download(document.id);

        if (documentWithFile.file) {
          // Конвертируем base64 в blob
          const byteCharacters = atob(documentWithFile.file);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray]);

          // Создаем ссылку для скачивания
          const url = window.URL.createObjectURL(blob);
          const link = window.document.createElement('a');
          link.href = url;
          link.download = documentWithFile.filename || documentWithFile.title;
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          throw new Error('Файл не найден');
        }
      }
    } catch (error) {
      console.error('Ошибка скачивания файла:', error);
      alert('Не удалось скачать файл. Попробуйте позже.');
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(document.id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box className="flex justify-center items-center py-8">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box className="mb-8">
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          Документы
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '600px' }}>
          Официальные документы, регламенты, формы и другие материалы для ознакомления и скачивания.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {documents.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <DocumentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                  {error ? 'Ошибка загрузки данных' : 'Нет доступных документов'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {error ? 'Попробуйте обновить страницу позже' : 'Документы будут добавлены в ближайшее время'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          documents.map((document) => (
            <Grid key={document.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box className="flex items-start justify-between mb-3">
                    <Box className="flex items-center gap-2 flex-grow">
                      {getFileIcon(document.filename, { size: 32 })}
                      <Box className="flex-grow min-w-0">
                        <Typography
                          variant="h6"
                          className="font-semibold"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {document.title}
                        </Typography>
                        <Chip
                          label={getFileTypeLabel(document.filename)}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <IconButton
                      onClick={() => handleDownload(document)}
                      disabled={downloadingIds.has(document.id)}
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'white'
                        },
                        '&:disabled': {
                          color: 'text.disabled'
                        }
                      }}
                    >
                      {downloadingIds.has(document.id) ? (
                        <CircularProgress size={20} />
                      ) : (
                        <DownloadIcon />
                      )}
                    </IconButton>
                  </Box>

                  {document.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {document.description}
                    </Typography>
                  )}

                  <Box className="flex items-center gap-1">
                    <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {formatDate(document.created_at)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {documents.length > 0 && (
        <Box className="mt-8 text-center">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Не нашли нужный документ? Обратитесь к нам по{' '}
            <a href="mailto:info@codd.ru" className="text-primary hover:underline">
              info@codd.ru
            </a>
          </Typography>
        </Box>
      )}
    </Container>
  );
}