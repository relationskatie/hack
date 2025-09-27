'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Breadcrumbs,
  Link as MuiLink,
  Skeleton,
  Grid,
} from '@mui/material';
import Link from 'next/link';
import { NewsApi, type BackendNewsItem } from '@/features/news/services/news.api';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { markdownToHtml, createMarkup } from '@/shared/utils/markdownUtils';

export default function NewsDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const [item, setItem] = useState<BackendNewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await NewsApi.get(String(id));
        if (!ignore) setItem(data);
      } catch {
        if (!ignore) setItem(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  return (
    <Container maxWidth="lg" className="py-16">
      <Breadcrumbs
        className="mb-8"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: 'text.secondary'
          }
        }}
      >
        <MuiLink
          component={Link}
          href="/"
          sx={{
            color: 'text.secondary',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
              color: 'primary.main'
            }
          }}
        >
          Главная
        </MuiLink>
        <MuiLink
          component={Link}
          href="/news"
          sx={{
            color: 'text.secondary',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
              color: 'primary.main'
            }
          }}
        >
          Новости
        </MuiLink>
        <Typography
          color="text.primary"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: { xs: '200px', sm: '300px', md: '400px' }
          }}
        >
          {item?.title || 'Новость'}
        </Typography>
      </Breadcrumbs>

      <SectionHeader
        title={item?.title || ''}
        subtitle={item?.created_at ? new Date(item.created_at).toLocaleString('ru-RU') : ''}
        spacingBottom={6}
      />

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Изображение слева */}
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: '100%', md: '300px' },
            height: { xs: '200px', sm: '250px', md: '300px' }
          }}
        >
          {loading ? (
            <Skeleton
              variant="rectangular"
              height="100%"
              sx={{
                bgcolor: 'grey.100',
                borderRadius: 2
              }}
            />
          ) : (() => {
            let imageUrl = '';
            if (item?.file && item.file.length > 0) {
              imageUrl = `data:image/jpeg;base64,${item.file}`;
            } else if (item?.file_url && item.file_url.length > 0) {
              imageUrl = item.file_url;
            }

            return imageUrl ? (
              <Box
                component="img"
                src={imageUrl}
                alt={item?.title || ''}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.300'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Нет изображения
                </Typography>
              </Box>
            );
          })()}
        </Box>

        {/* Контент справа */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <Box>
              <Skeleton variant="text" height={32} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={24} width="80%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={24} width="60%" />
            </Box>
          ) : (
            <Box
              sx={{
                fontSize: '1.125rem',
                lineHeight: 1.7,
                color: 'text.primary',
                '& h1, & h2, & h3': {
                  fontWeight: 600,
                  mb: 2,
                  mt: 3,
                  '&:first-of-type': { mt: 0 }
                },
                '& h1': { fontSize: '1.75rem' },
                '& h2': { fontSize: '1.5rem' },
                '& h3': { fontSize: '1.25rem' },
                '& p': {
                  mb: 2,
                  '&:last-child': { mb: 0 }
                },
                '& ul, & ol': {
                  mb: 2,
                  pl: 0,
                  listStyle: 'none'
                },
                '& li': {
                  mb: 0.5,
                  position: 'relative',
                  pl: 2,
                  '&::before': {
                    content: '"•"',
                    position: 'absolute',
                    left: 0,
                    color: 'primary.main',
                    fontWeight: 'bold'
                  }
                },
                '& a': {
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                },
                '& strong': {
                  fontWeight: 600
                },
                '& em': {
                  fontStyle: 'italic'
                }
              }}
              dangerouslySetInnerHTML={createMarkup(markdownToHtml(item?.content || 'Нет содержимого'))}
            />
          )}
        </Box>
      </Box>
    </Container>
  );
}