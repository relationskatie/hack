'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Grid, Chip, Alert, MenuItem, Select } from '@mui/material';
import AppButton from '@/shared/components/ui/AppButton';
import { OrdersApi, type OrderItem, type OrderStatus } from '@/features/orders/orders.api';
import { getOrderStatusLabel, getOrderStatusColor, getOrderStatusOptions } from '@/shared/constants/orderStatus';

// Получаем статусы с переводами
const statusOptions = getOrderStatusOptions();

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Загружаем заказы...');
      const resp = await OrdersApi.listAll({ limit: 50, offset: 0 });
      console.log('Ответ API заказов:', resp);
      setOrders(resp.orders || []);
    } catch (e: any) {
      console.error('Ошибка загрузки заказов:', e);
      setError(e?.message || 'Не удалось загрузить заказы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      setError(null);
      setSuccess(null);
      await OrdersApi.updateStatus(id, status);
      setSuccess('Статус обновлен');
      load();
    } catch (e: any) {
      setError(e?.message || 'Не удалось обновить статус');
    }
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
      <Box className="mb-4">
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Все заказы</Typography>
      </Box>
      {success && <Alert severity="success" className="mb-3">{success}</Alert>}
      {error && <Alert severity="error" className="mb-3">{error}</Alert>}

      <Grid container spacing={2}>
        {orders.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                  Заказы не найдены
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {error ? 'Ошибка загрузки данных' : 'Пока нет заказов в системе'}
                </Typography>
                {error && (
                  <AppButton 
                    styleType="outlined" 
                    onClick={load}
                    sx={{ mt: 2 }}
                  >
                    Попробовать снова
                  </AppButton>
                )}
              </CardContent>
            </Card>
          </Grid>
        ) : (
          orders.map(order => (
            <Grid key={order.order_id} size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Box className="flex items-center justify-between">
                    <Box>
                      <Typography variant="subtitle1" className="font-semibold">Заказ #{order.order_id}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{order.location}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{order.start_time}–{order.end_time}</Typography>
                    </Box>
                    <Box className="flex items-center gap-2">
                      <Chip 
                        label={getOrderStatusLabel(order.status)} 
                        color={getOrderStatusColor(order.status)}
                        size="small" 
                      />
                      <Select
                        size="small"
                        value={order.status}
                        onChange={(e) => updateStatus(order.order_id, e.target.value as OrderStatus)}
                      >
                        {statusOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}


