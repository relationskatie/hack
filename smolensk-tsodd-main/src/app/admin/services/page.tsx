'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Grid, Chip, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Checkbox, Button } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import AppButton from '@/shared/components/ui/AppButton';
import { ServicesApi, type ShortServiceInfo, type CreateServiceRequest, type ServiceTimeSlot } from '@/features/services/services.api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceSchema, type ServiceFormValues } from '@/shared/types/validation';
import type { z } from 'zod';
import RHFForm from '@/shared/components/ui/form/RHFForm';
import RHFTextField from '@/shared/components/ui/form/RHFTextField';
import RHFCheckbox from '@/shared/components/ui/form/RHFCheckbox';

export default function AdminServicesPage() {
  const [services, setServices] = useState<ShortServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState<ShortServiceInfo | null>(null);
  type ServiceFormInput = z.input<typeof serviceSchema>;

  const methods = useForm<ServiceFormInput, any, ServiceFormValues>({
    defaultValues: {
      tittle: '',
      price: 0,
      description: '',
      need_schedule: false,
      schedule: []
    },
    mode: 'onSubmit',
    resolver: zodResolver(serviceSchema)
  });
  const [bulkAddMode, setBulkAddMode] = useState(false);
  const [bulkData, setBulkData] = useState({
    startDate: '',
    endDate: '',
    daysOfWeek: [] as number[],
    startTime: '09:00',
    endTime: '17:00',
    interval: 60, // минуты
  });

  // Отслеживаем изменения в расписании для отладки
  const watchedSchedule = methods.watch('schedule');
  console.log('Текущее расписание (watch):', watchedSchedule);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Загружаем услуги...');
      const resp = await ServicesApi.list({ limit: 100, offset: 0 });
      console.log('Ответ API услуг:', resp);
      setServices(resp.services || []);
    } catch (e: any) {
      console.error('Ошибка загрузки услуг:', e);
      setError(e?.message || 'Не удалось загрузить услуги');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = () => {
    setEditingService(null);
    methods.reset({ tittle: '', price: 0, description: '', need_schedule: false, schedule: [] });
    setOpenDialog(true);
  };

  const handleEdit = async (service: ShortServiceInfo) => {
    try {
      setError(null);
      const fullService = await ServicesApi.getById(service.id);
      setEditingService(service);
      methods.reset({
        tittle: fullService.service_info.tittle,
        price: fullService.service_info.price,
        description: fullService.service_info.description,
        need_schedule: fullService.service_info.need_schedule,
        schedule: fullService.service_info.schedule || []
      });
      setOpenDialog(true);
    } catch (e: any) {
      setError(e?.message || 'Не удалось загрузить данные услуги');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить услугу?')) return;
    try {
      setError(null);
      setSuccess(null);
      await ServicesApi.delete(id);
      setSuccess('Услуга удалена');
      load();
    } catch (e: any) {
      setError(e?.message || 'Не удалось удалить услугу');
    }
  };

  const handleSubmit = async (values: ServiceFormValues) => {
    try {
      setError(null);
      setSuccess(null);

      if (editingService) {
        const updateData = {
          tittle: values.tittle,
          price: values.price,
          description: values.description,
          need_schedule: values.need_schedule,
          schedule: values.need_schedule ? (values.schedule || []) : []
        };
        console.log('Обновление услуги:', updateData);
        await ServicesApi.update(editingService.id, updateData);
        setSuccess('Услуга обновлена');
      } else {
        const createData = {
          ...values,
          schedule: values.need_schedule ? (values.schedule || []) : []
        };
        console.log('Создание услуги:', createData);
        await ServicesApi.create(createData);
        setSuccess('Услуга создана');
      }

      setOpenDialog(false);
      load();
    } catch (e: any) {
      console.error('Ошибка при сохранении услуги:', e);
      setError(e?.message || 'Не удалось сохранить услугу');
    }
  };

  const addTimeSlot = () => {
    const current = methods.getValues();
    const newSlot = {
      start_time: '09:00',
      end_time: '10:00',
      is_booked: false,
      date: new Date().toISOString().split('T')[0]
    };
    const updatedSchedule = [
      ...(current.schedule || []),
      newSlot
    ];
    console.log('Добавляем слот:', newSlot);
    console.log('Обновленное расписание:', updatedSchedule);
    methods.setValue('schedule', updatedSchedule as any);
    methods.trigger('schedule'); // Принудительно обновляем валидацию и UI
  };

  const updateTimeSlot = (index: number, field: keyof ServiceTimeSlot, value: string | boolean) => {
    const current = methods.getValues();
    const updated = (current.schedule || []).map((slot, i) => (i === index ? { ...slot, [field]: value } : slot));
    methods.setValue('schedule', updated as any);
    methods.trigger('schedule');
  };

  const removeTimeSlot = (index: number) => {
    const current = methods.getValues();
    const updated = (current.schedule || []).filter((_, i) => i !== index);
    methods.setValue('schedule', updated as any);
    methods.trigger('schedule');
  };

  const generateBulkSlots = () => {
    if (!bulkData.startDate || !bulkData.endDate || bulkData.daysOfWeek.length === 0) {
      alert('Заполните все поля для массового добавления');
      return;
    }

    const slots: ServiceTimeSlot[] = [];
    const start = new Date(bulkData.startDate);
    const end = new Date(bulkData.endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay(); // 0 = воскресенье, 1 = понедельник, ...

      if (bulkData.daysOfWeek.includes(dayOfWeek)) {
        const startTime = new Date(date);
        const [startHour, startMin] = bulkData.startTime.split(':').map(Number);
        startTime.setHours(startHour, startMin, 0, 0);

        const endTime = new Date(date);
        const [endHour, endMin] = bulkData.endTime.split(':').map(Number);
        endTime.setHours(endHour, endMin, 0, 0);

        // Генерируем слоты с интервалом
        for (let current = new Date(startTime); current < endTime; current.setMinutes(current.getMinutes() + bulkData.interval)) {
          const slotEnd = new Date(current);
          slotEnd.setMinutes(slotEnd.getMinutes() + bulkData.interval);

          if (slotEnd <= endTime) {
            slots.push({
              date: date.toISOString().split('T')[0],
              start_time: current.toTimeString().slice(0, 5),
              end_time: slotEnd.toTimeString().slice(0, 5),
              is_booked: false
            });
          }
        }
      }
    }

    const current = methods.getValues();
    const updatedSchedule = [...(current.schedule || []), ...slots];
    console.log('Генерируем массовые слоты:', slots.length, 'слотов');
    console.log('Обновленное расписание:', updatedSchedule);
    methods.setValue('schedule', updatedSchedule as any);
    methods.trigger('schedule');

    setBulkAddMode(false);
    setBulkData({
      startDate: '',
      endDate: '',
      daysOfWeek: [],
      startTime: '09:00',
      endTime: '17:00',
      interval: 60,
    });
  };

  const clearAllSlots = () => {
    if (confirm('Удалить все слоты?')) {
      methods.setValue('schedule', [] as any);
      methods.trigger('schedule');
    }
  };

  const setPresetDays = (preset: 'weekdays' | 'weekends' | 'everyday') => {
    let days: number[] = [];
    switch (preset) {
      case 'weekdays':
        days = [1, 2, 3, 4, 5]; // Пн-Пт
        break;
      case 'weekends':
        days = [0, 6]; // Вс, Сб
        break;
      case 'everyday':
        days = [0, 1, 2, 3, 4, 5, 6]; // Все дни
        break;
    }
    setBulkData(prev => ({ ...prev, daysOfWeek: days }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box className="flex justify-between items-center" sx={{ mb: '16px' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Управление услугами</Typography>
        <AppButton styleType="primary" startIcon={<AddIcon />} onClick={handleCreate}>
          Добавить услугу
        </AppButton>
      </Box>

      {success && <Alert severity="success" className="mb-3">{success}</Alert>}
      {error && <Alert severity="error" className="mb-3">{error}</Alert>}

      <Grid container spacing={2}>
        {services.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: '16px' }}>
                  Услуги не найдены
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {error ? 'Ошибка загрузки данных' : 'Пока нет услуг в системе'}
                </Typography>
                {error && (
                  <AppButton
                    styleType="outlined"
                    onClick={load}
                    sx={{ mt: '8px' }}
                  >
                    Попробовать снова
                  </AppButton>
                )}
              </CardContent>
            </Card>
          </Grid>
        ) : (
          services.map(service => (
            <Grid key={service.id} size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Box className="flex items-start justify-between">
                    <Box className="flex-grow">
                      <Typography variant="h6" className="font-semibold" sx={{ mb: '4px' }}>
                        {service.tittle}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: '4px' }}>
                        {service.description}
                      </Typography>
                      <Box className="flex items-center gap-2" sx={{ mb: '8px' }}>
                        <Chip
                          label={`${service.price.toLocaleString('ru-RU')} ₽`}
                          size="small"
                          color="primary"
                        />
                        {service.need_schedule && (
                          <Chip
                            icon={<ScheduleIcon />}
                            label="По расписанию"
                            size="small"
                            color="secondary"
                          />
                        )}
                      </Box>
                    </Box>
                    <Box className="flex items-center gap-1">
                      <IconButton size="small" onClick={() => handleEdit(service)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(service.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Диалог создания/редактирования */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingService ? 'Редактировать услугу' : 'Создать услугу'}
        </DialogTitle>
        <DialogContent>
          <RHFForm methods={methods} onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <RHFTextField<CreateServiceRequest>
                  fullWidth
                  name="tittle"
                  label="Название услуги"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField<CreateServiceRequest>
                  fullWidth
                  name="price"
                  label="Цена"
                  type="number"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFCheckbox<CreateServiceRequest>
                  name="need_schedule"
                  label="Требует расписания"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <RHFTextField<CreateServiceRequest>
                  fullWidth
                  name="description"
                  label="Описание"
                  multiline
                  rows={3}
                />
              </Grid>

              {methods.watch('need_schedule') && (
                <Grid size={{ xs: 12 }}>
                  <Box className="flex items-center justify-between" sx={{ mb: '16px' }}>
                    <Typography variant="h6">Расписание</Typography>
                    <Box className="flex gap-2">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setBulkAddMode(!bulkAddMode)}
                      >
                        {bulkAddMode ? 'Отменить' : 'Массовое добавление'}
                      </Button>
                      <Button size="small" onClick={addTimeSlot}>
                        Добавить слот
                      </Button>
                       {watchedSchedule && watchedSchedule.length > 0 && (
                         <Button size="small" color="error" onClick={clearAllSlots}>
                           Очистить все
                         </Button>
                       )}
                    </Box>
                  </Box>

                  {/* Массовое добавление */}
                  {bulkAddMode && (
                    <Card sx={{ mb: 3, p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle1" sx={{ mb: '8px' }}>Массовое добавление слотов</Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Дата начала"
                            type="date"
                            value={bulkData.startDate}
                            InputLabelProps={{ shrink: true }}
                            onChange={(e) => setBulkData(prev => ({ ...prev, startDate: e.target.value }))}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Дата окончания"
                            type="date"
                            value={bulkData.endDate}
                            InputLabelProps={{ shrink: true }}
                            onChange={(e) => setBulkData(prev => ({ ...prev, endDate: e.target.value }))}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2" sx={{ mb: '8px' }}>Дни недели:</Typography>

                          {/* Быстрые пресеты */}
                          <Box className="flex gap-2" sx={{ mb: '12px' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setPresetDays('weekdays')}
                              sx={{ fontSize: '0.75rem' }}
                            >
                              Будни
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setPresetDays('weekends')}
                              sx={{ fontSize: '0.75rem' }}
                            >
                              Выходные
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setPresetDays('everyday')}
                              sx={{ fontSize: '0.75rem' }}
                            >
                              Каждый день
                            </Button>
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => setBulkData(prev => ({ ...prev, daysOfWeek: [] }))}
                              sx={{ fontSize: '0.75rem' }}
                            >
                              Очистить
                            </Button>
                          </Box>

                          {/* Индивидуальный выбор дней */}
                          <Box className="flex gap-1 flex-wrap">
                            {[
                              { value: 1, label: 'Пн' },
                              { value: 2, label: 'Вт' },
                              { value: 3, label: 'Ср' },
                              { value: 4, label: 'Чт' },
                              { value: 5, label: 'Пт' },
                              { value: 6, label: 'Сб' },
                              { value: 0, label: 'Вс' },
                            ].map(day => (
                              <Button
                                key={day.value}
                                size="small"
                                variant={bulkData.daysOfWeek.includes(day.value) ? 'contained' : 'outlined'}
                                onClick={() => {
                                  setBulkData(prev => ({
                                    ...prev,
                                    daysOfWeek: prev.daysOfWeek.includes(day.value)
                                      ? prev.daysOfWeek.filter(d => d !== day.value)
                                      : [...prev.daysOfWeek, day.value]
                                  }));
                                }}
                              >
                                {day.label}
                              </Button>
                            ))}
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Время начала"
                            type="time"
                            value={bulkData.startTime}
                            onChange={(e) => setBulkData(prev => ({ ...prev, startTime: e.target.value }))}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Время окончания"
                            type="time"
                            value={bulkData.endTime}
                            onChange={(e) => setBulkData(prev => ({ ...prev, endTime: e.target.value }))}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Интервал (минуты)"
                            type="number"
                            value={bulkData.interval}
                            onChange={(e) => setBulkData(prev => ({ ...prev, interval: Number(e.target.value) }))}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <AppButton
                            styleType="primary"
                            size="small"
                            onClick={generateBulkSlots}
                          >
                            Сгенерировать слоты
                          </AppButton>
                        </Grid>
                      </Grid>
                    </Card>
                  )}

                   {/* Список слотов */}
                   <Box className="max-h-60 overflow-y-auto">
                     {watchedSchedule?.map((slot, index) => (
                       <Box key={index} className="flex items-center gap-2 mb-2 p-2 border rounded">
                         <TextField
                           size="small"
                           label="Дата"
                           type="date"
                           value={slot.date}
                           onChange={(e) => updateTimeSlot(index, 'date', e.target.value)}
                           InputLabelProps={{ shrink: true }}
                         />
                         <TextField
                           size="small"
                           label="Начало"
                           type="time"
                           value={slot.start_time}
                           onChange={(e) => updateTimeSlot(index, 'start_time', e.target.value)}
                         />
                         <TextField
                           size="small"
                           label="Окончание"
                           type="time"
                           value={slot.end_time}
                           onChange={(e) => updateTimeSlot(index, 'end_time', e.target.value)}
                         />
                         <IconButton size="small" onClick={() => removeTimeSlot(index)}>
                           <DeleteIcon />
                         </IconButton>
                       </Box>
                     ))}
                     {(!watchedSchedule || watchedSchedule.length === 0) && (
                       <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                         Слоты не добавлены
                       </Typography>
                     )}
                   </Box>
                </Grid>
              )}
            </Grid>
          </RHFForm>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <AppButton styleType="primary" onClick={methods.handleSubmit(handleSubmit)}>
            {editingService ? 'Сохранить' : 'Создать'}
          </AppButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
