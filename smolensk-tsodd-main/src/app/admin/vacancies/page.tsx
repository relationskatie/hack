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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import AppButton from '@/shared/components/ui/AppButton';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNotification } from '@/shared/contexts';
import { VacanciesApi, type BackendVacancyItem } from '@/features/vacancies/services/vacancies.api';

type UiVacancy = {
  id: string;
  position: string;
  description: string;
  salary: string;
  is_active: boolean;
  published_at?: string;
};

export default function AdminVacanciesPage() {
  const [vacancies, setVacancies] = useState<UiVacancy[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<UiVacancy | null>(null);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    position: '',
    description: '',
    salary: '',
    is_active: true,
  });

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const { items } = await VacanciesApi.list({ limit: 50, offset: 0 });
        if (ignore) return;
        setVacancies(items || []);
      } catch (error) {
        console.error('Ошибка загрузки вакансий:', error);
        setVacancies([]);
        showNotification('Ошибка загрузки вакансий', 'error');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [showNotification]);

  const handleOpenDialog = (vacancy?: UiVacancy) => {
    if (vacancy) {
      setEditingVacancy(vacancy);
      setFormData({
        position: vacancy.position,
        description: vacancy.description,
        salary: vacancy.salary,
        is_active: vacancy.is_active,
      });
    } else {
      setEditingVacancy(null);
      setFormData({
        position: '',
        description: '',
        salary: '',
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVacancy(null);
  };

  const handleSave = async () => {
    try {
      if (editingVacancy) {
        await VacanciesApi.update(String(editingVacancy.id), {
          position: formData.position,
          description: formData.description,
          salary: formData.salary,
          is_active: formData.is_active,
        });
        showNotification('Вакансия обновлена', 'success');
      } else {
        await VacanciesApi.create({
          position: formData.position,
          description: formData.description,
          salary: formData.salary,
          is_active: formData.is_active,
        });
        showNotification('Вакансия добавлена', 'success');
      }
      handleCloseDialog();

      // Перезагружаем список
      const { items } = await VacanciesApi.list({ limit: 50, offset: 0 });
      setVacancies(items || []);
    } catch (error) {
      console.error('Ошибка сохранения вакансии:', error);
      showNotification('Ошибка сохранения вакансии', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Удалить эту вакансию?')) {
      try {
        await VacanciesApi.delete(String(id));
        setVacancies(prev => prev.filter(v => v.id !== id));
        showNotification('Вакансия удалена', 'success');
      } catch (error) {
        console.error('Ошибка удаления вакансии:', error);
        showNotification('Ошибка удаления вакансии', 'error');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    const current = vacancies.find(v => v.id === id);
    if (!current) return;
    try {
      await VacanciesApi.update(String(id), {
        position: current.position,
        description: current.description,
        salary: current.salary,
        is_active: !current.is_active,
      });
      setVacancies(prev => prev.map(v =>
        v.id === id
          ? { ...v, is_active: !v.is_active }
          : v
      ));
      showNotification('Статус вакансии изменен', 'success');
    } catch (error) {
      console.error('Ошибка изменения статуса вакансии:', error);
      showNotification('Ошибка изменения статуса', 'error');
    }
  };

  return (
    <Box>
      <Box className="flex justify-between items-center" sx={{ mb: '24px' }}>
        <Typography variant="h4" className="font-bold">
          Управление вакансиями
        </Typography>
        <AppButton styleType="primary" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Добавить вакансию
        </AppButton>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Должность</TableCell>
              <TableCell>Зарплата</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box className="flex items-center justify-center" sx={{ py: '16px' }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: '8px' }}>
                      Загрузка...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : vacancies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Вакансии не найдены
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              vacancies.map((vacancy) => (
                <TableRow key={vacancy.id} hover>
                  <TableCell>
                    <Typography variant="body2" className="font-medium">
                      {vacancy.position}
                    </Typography>
                  </TableCell>
                  <TableCell>{vacancy.salary}</TableCell>
                  <TableCell>
                    <Chip
                      label={vacancy.is_active ? 'Активна' : 'Закрыта'}
                      color={vacancy.is_active ? 'success' : 'default'}
                      size="small"
                      onClick={() => handleToggleStatus(vacancy.id)}
                      className="cursor-pointer"
                    />
                  </TableCell>
                  <TableCell>
                    {vacancy.published_at ? new Date(vacancy.published_at).toLocaleDateString('ru-RU') : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(vacancy)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(vacancy.id)}
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

      {/* Диалог добавления/редактирования */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingVacancy ? 'Редактировать вакансию' : 'Добавить вакансию'}
        </DialogTitle>
        <DialogContent>
          <Box className="pt-2 space-y-4">
            <TextField
              fullWidth
              label="Название должности"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Зарплата"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              placeholder="50 000 - 70 000 ₽"
              required
            />

            <TextField
              fullWidth
              label="Описание"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                label="Статус"
              >
                <MenuItem value="true">Активна</MenuItem>
                <MenuItem value="false">Закрыта</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <AppButton styleType="outlined" onClick={handleCloseDialog}>Отмена</AppButton>
          <AppButton styleType="primary" onClick={handleSave}>
            {editingVacancy ? 'Сохранить' : 'Добавить'}
          </AppButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}