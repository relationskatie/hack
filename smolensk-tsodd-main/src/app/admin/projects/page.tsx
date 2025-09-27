'use client';

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNotification } from '@/shared/contexts';
import AppButton from '@/shared/components/ui/AppButton';
import { ProjectsApi, type BackendProjectItem } from '@/features/projects/services/projects.api';

type UiProject = {
  ID: string;
  Title: string;
  Description: string;
  UploadedBy: string;
  CreatedAt: string;
  UpdatedAt: string;
  Filename: string;
  FileURL: string;
};

export default function AdminProjectsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [projects, setProjects] = useState<UiProject[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<UiProject | null>(null);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await ProjectsApi.list({ limit: 50, offset: 0 });
        if (ignore) return;
        setProjects(response || []);
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
        setProjects([]);
        showNotification('Ошибка загрузки проектов', 'error');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [showNotification]);

  const handleOpenDialog = (project?: UiProject) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.Title,
        description: project.Description,
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
      });
      setSelectedFile(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProject(null);
    setSelectedFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      showNotification('Заполните название и описание проекта', 'error');
      return;
    }

    try {
      if (editingProject) {
        await ProjectsApi.update(editingProject.ID, {
          title: formData.title.trim(),
          description: formData.description.trim(),
        });
        showNotification('Проект обновлен', 'success');
      } else {
        await ProjectsApi.create({
          title: formData.title.trim(),
          description: formData.description.trim(),
          file: selectedFile ?? undefined,
          filename: selectedFile?.name,
        });
        showNotification('Проект добавлен', 'success');
      }
      handleCloseDialog();

      // Перезагружаем список
      try {
        const response = await ProjectsApi.list({ limit: 50, offset: 0 });
        setProjects(response || []);
      } catch (refreshError) {
        console.error('Ошибка обновления списка проектов:', refreshError);
        // Не показываем уведомление об ошибке, так как основная операция прошла успешно
      }
    } catch (error) {
      console.error('Ошибка сохранения проекта:', error);
      showNotification('Ошибка сохранения проекта', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Удалить этот проект?')) {
      try {
        await ProjectsApi.delete(id);
        setProjects(prev => prev.filter(p => p.ID !== id));
        showNotification('Проект удален', 'success');
      } catch (error) {
        console.error('Ошибка удаления проекта:', error);
        showNotification('Ошибка удаления проекта', 'error');
      }
    }
  };

  return (
    <Box>
      <Box className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'} mb-6`}>
        <Typography variant="h4" className="font-bold">
          Управление проектами
        </Typography>
        <AppButton
          styleType="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          fullWidth={isMobile}
        >
          Добавить проект
        </AppButton>
      </Box>

      {isMobile ? (
        <Stack spacing={2}>
          {loading ? (
            <Box className="flex items-center justify-center" sx={{ py: '32px' }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: '8px' }}>
                Загрузка...
              </Typography>
            </Box>
          ) : projects.length === 0 ? (
            <Box className="text-center py-8">
              <Typography variant="body2" color="text.secondary">
                Проекты не найдены
              </Typography>
            </Box>
          ) : (
            projects.map((project) => (
              <Card key={project.ID} className="hover:shadow-md transition-shadow">
                <CardContent>
                  <Typography variant="h6" className="font-semibold" sx={{ mb: '8px' }}>
                    {project.Title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="line-clamp-3" sx={{ mb: '8px' }}>
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
                  <Typography variant="body2" color="text.secondary">
                    Создан: {project.CreatedAt ? new Date(project.CreatedAt).toLocaleDateString('ru-RU') : '-'}
                  </Typography>
                </CardContent>
                <CardActions className="justify-end">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(project)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(project.ID)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            ))
          )}
        </Stack>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Файл</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box className="flex items-center justify-center py-4">
                      <CircularProgress size={24} />
                      <Typography variant="body2" sx={{ ml: '8px' }}>
                        Загрузка...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Проекты не найдены
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.ID} hover>
                    <TableCell>
                      <Typography variant="body2" className="font-medium">
                        {project.Title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="max-w-xs truncate">
                        {project.Description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {project.Filename ? (
                        <Box className="flex items-center gap-1">
                          <DescriptionIcon className="text-blue-600 text-sm" />
                          <Typography variant="body2">{project.Filename}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {project.CreatedAt ? new Date(project.CreatedAt).toLocaleDateString('ru-RU') : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(project)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(project.ID)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Диалог добавления/редактирования */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProject ? 'Редактировать проект' : 'Добавить проект'}
        </DialogTitle>
        <DialogContent>
          <Box className="pt-2 space-y-4">
            <TextField
              fullWidth
              label="Название проекта"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Описание проекта"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              required
              placeholder="Подробное описание проекта..."
            />

            {!editingProject && (
              <Box>
                <Typography variant="h6" sx={{ mb: '12px' }}>
                  Файл проекта
                </Typography>
                <Box className="flex items-center space-x-4">
                  <input
                    accept=".pdf,.doc,.docx,.zip,.rar"
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
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <AppButton styleType="outlined" onClick={handleCloseDialog}>Отмена</AppButton>
          <AppButton styleType="primary" onClick={handleSave}>
            {editingProject ? 'Сохранить' : 'Добавить'}
          </AppButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
