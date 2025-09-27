'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import AppButton from '@/shared/components/ui/AppButton';
import { useNotification } from '@/shared/contexts';
import { NewsApi } from '@/features/news/services/news.api';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsCreateSchema, type NewsFormValues } from '@/shared/types/validation';
import RHFForm from '@/shared/components/ui/form/RHFForm';
import RHFTextField from '@/shared/components/ui/form/RHFTextField';

// using shared NewsFormValues from validation

export default function CreateNewsPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const methods = useForm<NewsFormValues>({
    defaultValues: { title: '', content: '' },
    mode: 'onSubmit',
    resolver: zodResolver(newsCreateSchema)
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const onSubmit = async (values: NewsFormValues) => {
    if (!values.title || !values.content) {
      showNotification('Заполните заголовок и содержимое', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await NewsApi.create({ 
        title: values.title, 
        content: values.content,
        file: selectedFile ?? undefined,
        filename: selectedFile?.name 
      });
      showNotification('Новость успешно создана', 'success');
      router.push('/admin/news');
    } catch (e) {
      console.error('Ошибка создания новости:', e);
      const errorMessage = e instanceof Error ? e.message : 'Неизвестная ошибка';
      showNotification(`Ошибка при создании новости: ${errorMessage}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Breadcrumbs className="mb-6">
        <MuiLink component={Link} href="/admin" color="inherit">
          Админ-панель
        </MuiLink>
        <MuiLink component={Link} href="/admin/news" color="inherit">
          Новости
        </MuiLink>
        <Typography color="text.primary">Создание новости</Typography>
      </Breadcrumbs>

      <SectionHeader
        title="Создание новости"
        subtitle="Добавьте новую новость"
      />

      <Card className="mt-6">
        <CardContent className="p-6">
          <RHFForm methods={methods} onSubmit={onSubmit}>
            <Box className="space-y-6">
              <RHFTextField<NewsFormValues>
                fullWidth
                name="title"
                label="Заголовок"
                variant="outlined"
              />

              <RHFTextField<NewsFormValues>
                fullWidth
                name="content"
                label="Содержимое"
                multiline
                rows={8}
                variant="outlined"
                placeholder="Основное содержимое новости"
              />

            <Box>
              <Typography variant="h6" sx={{ mb: '12px' }}>
                Изображение
              </Typography>
              <Box className="flex items-center space-x-4">
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload">
                  <AppButton
                    component="span"
                    styleType="outlined"
                    startIcon={<UploadIcon />}
                  >
                    Выбрать файл
                  </AppButton>
                </label>
                {selectedFile && (
                  <Typography variant="body2" color="text.secondary">
                    Выбран файл: {selectedFile.name}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box className="space-y-3">
              <AppButton
                type="submit"
                styleType="primary"
                fullWidth
                startIcon={<SaveIcon />}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Создание...' : 'Создать новость'}
              </AppButton>

              <AppButton
                styleType="link"
                fullWidth
                color="inherit"
                startIcon={<CancelIcon />}
                onClick={() => router.push('/admin/news')}
                disabled={isSubmitting}
              >
                Отмена
              </AppButton>
            </Box>
            </Box>
          </RHFForm>
        </CardContent>
      </Card>
    </Container>
  );
}