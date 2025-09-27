'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Grid, Chip, Alert } from '@mui/material';
import AppButton from '@/shared/components/ui/AppButton';
import { OrdersApi, type OrderItem } from '@/features/orders/orders.api';
import { getOrderStatusLabel, getOrderStatusColor, canCancelOrder } from '@/shared/constants/orderStatus';
import Link from 'next/link';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await OrdersApi.getMine({ limit: 20, offset: 0 });
      setOrders(resp.orders);
    } catch (e: any) {
      setError(e?.message || 'Не удалось загрузить заказы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id: string) => {
    try {
      setError(null);
      setSuccess(null);
      await OrdersApi.cancel(id);
      setSuccess('Заказ отменен');
      load();
    } catch (e: any) {
      setError(e?.message || 'Не удалось отменить заказ');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box className="mb-4">
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Мои заказы</Typography>
      </Box>
      {success && <Alert severity="success" className="mb-3">{success}</Alert>}
      {error && <Alert severity="error" className="mb-3">{error}</Alert>}

      <Grid container spacing={2}>
        {orders.map(order => (
          <Grid key={order.order_id} size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="subtitle1" className="font-semibold">Заказ #{order.order_id}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{order.location}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {order.start_time}–{order.end_time}
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <Chip
                      label={getOrderStatusLabel(order.status)}
                      color={getOrderStatusColor(order.status)}
                      size="small"
                    />
                    <Link href={`/orders/${order.order_id}`}>Подробнее</Link>
                    {canCancelOrder(order.status) && (
                      <AppButton styleType="outlined" size="small" onClick={() => cancel(order.order_id)}>Отменить</AppButton>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {orders.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Список пуст</Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}


