'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    TextField,
    Alert,
    CircularProgress,
    Breadcrumbs,
    Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { NewsApi, type BackendNewsItem } from '@/features/news/services/news.api';
import { useNotification } from '@/shared/contexts';
import AppButton from '@/shared/components/ui/AppButton';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import {
    Save as SaveIcon,
    Cancel as CancelIcon,
    CloudUpload as UploadIcon,
} from '@mui/icons-material';

interface NewsFormValues {
    title: string;
    content: string;
}


export default function EditNewsPage() {
    const params = useParams();
    const router = useRouter();
    const { showNotification } = useNotification();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newsItem, setNewsItem] = useState<BackendNewsItem | null>(null);
    const [formValues, setFormValues] = useState<NewsFormValues>({
        title: '',
        content: '',
    });

    const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);

    useEffect(() => {
        const loadNews = async () => {
            if (!id) return;
            try {
                const data = await NewsApi.get(id);
                setNewsItem(data);
                setFormValues({
                    title: data.title || '',
                    content: data.content || '',
                });
            } catch (error) {
                console.error('Ошибка загрузки новости:', error);
                showNotification('Ошибка загрузки новости', 'error');
                router.push('/admin/news');
            } finally {
                setLoading(false);
            }
        };

        loadNews();
    }, [id, router, showNotification]);

    const handleInputChange = (field: keyof NewsFormValues) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormValues(prev => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

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
            await NewsApi.update(id, {
                title: values.title,
                content: values.content,
                file: selectedFile ?? undefined,
                filename: selectedFile?.name,
            });
            showNotification('Новость успешно обновлена', 'success');
            router.push('/admin/news');
        } catch (e) {
            console.error('Ошибка обновления новости:', e);
            const errorMessage = e instanceof Error ? e.message : 'Неизвестная ошибка';
            showNotification(`Ошибка при обновлении новости: ${errorMessage}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" className="py-8">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (!newsItem) {
        return (
            <Container maxWidth="lg" className="py-8">
                <Alert severity="error">Новость не найдена</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" className="py-8">
            <Breadcrumbs className="mb-6">
                <MuiLink component={Link} href="/admin" color="inherit">
                    Админ-панель
                </MuiLink>
                <MuiLink component={Link} href="/admin/news" color="inherit">
                    Новости
                </MuiLink>
                <Typography color="text.primary">Редактирование</Typography>
            </Breadcrumbs>

            <SectionHeader
                title="Редактирование новости"
                subtitle="Измените информацию о новости"
            />

            <Card className="mt-6">
                <CardContent className="p-6">
                    <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(formValues); }} className="space-y-6">
                        <TextField
                            fullWidth
                            label="Заголовок"
                            value={formValues.title}
                            onChange={handleInputChange('title')}
                            required
                            variant="outlined"
                        />


                        <TextField
                            fullWidth
                            label="Содержимое"
                            value={formValues.content}
                            onChange={handleInputChange('content')}
                            multiline
                            rows={8}
                            required
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
                                {(() => {
                                    let currentImage = '';
                                    if (newsItem?.file && newsItem.file.length > 0) {
                                        currentImage = `data:image/jpeg;base64,${newsItem.file}`;
                                    } else if (newsItem?.file_url && newsItem.file_url.length > 0) {
                                        currentImage = newsItem.file_url;
                                    }

                                    return currentImage && !selectedFile ? (
                                        <Box className="mt-2">
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: '8px' }}>
                                                Текущее изображение:
                                            </Typography>
                                            <img
                                                src={currentImage}
                                                alt="Текущее изображение"
                                                className="max-w-xs max-h-32 object-cover rounded"
                                            />
                                        </Box>
                                    ) : null;
                                })()}
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
                                {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
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
                </CardContent>
            </Card>
        </Container>
    );
}
