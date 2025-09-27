'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Container, Box, Typography, Card, CardContent, Chip, Alert } from '@mui/material';
import AppButton from '@/shared/components/ui/AppButton';
import { OrdersApi, type OrderItem } from '@/features/orders/orders.api';
import { getOrderStatusLabel, getOrderStatusColor, canCancelOrder } from '@/shared/constants/orderStatus';

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = String(params?.id || '');
    const [order, setOrder] = useState<OrderItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const resp = await OrdersApi.getForUser(orderId);
            setOrder(resp);
        } catch (e: any) {
            setError(e?.message || 'Не удалось загрузить заказ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (orderId) load(); }, [orderId]);

    const cancel = async () => {
        try {
            setError(null);
            setSuccess(null);
            await OrdersApi.cancel(orderId);
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

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!order) return null;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {success && <Alert severity="success" className="mb-3">{success}</Alert>}
            <Card>
                <CardContent>
                    <Box className="flex items-center justify-between mb-2">
                        <Typography variant="h6" className="font-semibold">Заказ #{order.order_id}</Typography>
                        <Chip 
                          label={getOrderStatusLabel(order.status)} 
                          color={getOrderStatusColor(order.status)}
                          size="small" 
                        />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Адрес: {order.location}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Даты: {order.start_time}–{order.end_time}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Описание: {order.description}</Typography>
                    {canCancelOrder(order.status) && (
                        <Box className="mt-3">
                            <AppButton styleType="outlined" onClick={cancel}>Отменить заказ</AppButton>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}


