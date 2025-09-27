'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Alert,
} from '@mui/material';
import AppButton from '@/shared/components/ui/AppButton';
import { ServicesApi, type ServiceInfo, type ServiceTimeSlot } from '@/features/services/services.api';
import { OrdersApi } from '@/features/orders/orders.api';
import { useAuth } from '@/features/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderCreateSchema, type OrderFormValues } from '@/shared/types/validation';
import RHFForm from '@/shared/components/ui/form/RHFForm';
import RHFTextField from '@/shared/components/ui/form/RHFTextField';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const serviceId = String(params?.id || '');

  const [service, setService] = useState<ServiceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const methods = useForm<OrderFormValues>({
    defaultValues: { date: '', start_time: '', end_time: '', location: '', description: '' },
    mode: 'onSubmit',
    resolver: zodResolver(orderCreateSchema)
  });
  const [selectedSlot, setSelectedSlot] = useState<ServiceTimeSlot | null>(null);

  useEffect(() => {
    const fn = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await ServicesApi.getById(serviceId);
        setService(resp.service_info);
      } catch (e: any) {
        setError(e?.message || 'Не удалось загрузить услугу');
      } finally {
        setLoading(false);
      }
    };
    if (serviceId) fn();
  }, [serviceId]);

  useEffect(() => {
    if (!selectedSlot) return;
    methods.setValue('date', selectedSlot.date);
    methods.setValue('start_time', selectedSlot.start_time.slice(0, 5));
    methods.setValue('end_time', selectedSlot.end_time.slice(0, 5));
  }, [selectedSlot]);

  const availableSlots = useMemo(() => {
    if (!service?.need_schedule) return [] as ServiceTimeSlot[];
    return (service?.schedule || []).filter(s => !s.is_booked);
  }, [service]);

  const handleSubmit = async (values: OrderFormValues) => {
    try {
      setError(null);
      setSuccess(null);
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (!service) return;

      if (!values.date || !values.start_time || !values.end_time) {
        setError('Укажите дату и время');
        return;
      }

      const resp = await OrdersApi.create({
        service_id: service.id,
        description: values.description,
        location: values.location,
        date: values.date,
        start_time: values.start_time,
        end_time: values.end_time,
      });
      setSuccess(`Заявка создана: ${resp.order_id}`);
      setSelectedSlot(null);
      methods.reset();
    } catch (e: any) {
      setError(e?.message || 'Не удалось создать заказ');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!service) return null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: '16px' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{service.tittle}</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: '4px' }}>{service.description}</Typography>
        <Typography variant="h6" sx={{ mt: '4px' }}>{service.price.toLocaleString('ru-RU')} ₽</Typography>
      </Box>

      {service.need_schedule && (
        <Card className="mb-4">
          <CardContent>
            <Typography variant="h6" sx={{ mb: '12px' }}>Доступные слоты</Typography>
            <Grid container spacing={1}>
              {availableSlots.length === 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Нет доступных слотов</Typography>
                </Grid>
              )}
              {availableSlots.map((slot, idx) => (
                <Grid key={`${slot.date}-${slot.start_time}-${idx}`} size={{ xs: 12, sm: 6, md: 4 }}>
                  <AppButton
                    styleType={selectedSlot === slot ? 'primary' : 'outlined'}
                    fullWidth
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot.date} {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                  </AppButton>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: '24px' }}>Оформление заявки</Typography>
          {success && <Alert severity="success" className="mb-3">{success}</Alert>}
          {error && <Alert severity="error" className="mb-3">{error}</Alert>}

          <RHFForm methods={methods} onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField<OrderFormValues>
                  fullWidth
                  name="date"
                  label="Дата"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <RHFTextField<OrderFormValues>
                  fullWidth
                  name="start_time"
                  label="Начало"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <RHFTextField<OrderFormValues>
                  fullWidth
                  name="end_time"
                  label="Окончание"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <RHFTextField<OrderFormValues>
                  fullWidth
                  name="location"
                  label="Место оказания услуги"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <RHFTextField<OrderFormValues>
                  fullWidth
                  name="description"
                  label="Комментарий"
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <AppButton type="submit" styleType="primary">Оформить заказ</AppButton>
              </Grid>
            </Grid>
          </RHFForm>
        </CardContent>
      </Card>
    </Container>
  );
}


