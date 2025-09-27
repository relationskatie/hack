'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/shared/types/validation';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '@/features/auth';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { IconBadge } from '@/shared/components/ui/IconBadge';
import AppButton from '@/shared/components/ui/AppButton';
import RHFForm from '@/shared/components/ui/form/RHFForm';
import { RHFTextField } from '@/shared/components/ui/form/RHFTextField';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const methods = useForm<LoginFormValues>({
    defaultValues: { username: '', password: '' },
    mode: 'onSubmit',
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError('');
    try {
      // Обрезаем пробелы в логине
      const trimmedValues = {
        ...values,
        username: values.username.trim()
      };
      await login(trimmedValues);
      router.push('/admin');
    } catch (err) {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <Container maxWidth="sm" className="py-16">
      <Paper elevation={3} className="p-8">
        <Box className="text-center mb-8">
          <Box className="mb-4">
            <IconBadge size={80}>
              <LockIcon />
            </IconBadge>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Вход в систему
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Доступ к панели управления ЦОДД
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <Typography variant="body2" className="text-blue-800">
            <strong>Демо-доступы:</strong><br />
            Администратор: admin / admin_test_1<br />
            Редактор: editor / editor_test_1<br />
            Пользователь: test_user / user_test_1
          </Typography>
        </Box>

        <RHFForm methods={methods} onSubmit={onSubmit}>
          <RHFTextField<LoginFormValues>
            fullWidth
            name="username"
            label="Имя пользователя"
            variant="outlined"
            margin="normal"
            disabled={isLoading}
          />

          <RHFTextField<LoginFormValues>
            fullWidth
            name="password"
            label="Пароль"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            disabled={isLoading}
          />

          <AppButton type="submit" fullWidth size="large" className="mt-6" disabled={isLoading}>
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Войти'
            )}
          </AppButton>
        </RHFForm>
      </Paper>
    </Container>
  );
}