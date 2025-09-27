'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import AppButton from '@/shared/components/ui/AppButton';
import { Error as ErrorIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box className="min-h-screen flex items-center justify-center p-4">
          <Paper className="p-8 max-w-md w-full text-center">
            <ErrorIcon className="text-6xl text-red-500 mb-4" />
            <Typography variant="h5" className="font-bold" sx={{ mb: '16px' }}>
              Что-то пошло не так
            </Typography>
            <Typography variant="body1" className="text-gray-600" sx={{ mb: '24px' }}>
              Произошла непредвиденная ошибка. Пожалуйста, попробуйте обновить страницу.
            </Typography>
            <AppButton styleType="primary" onClick={() => window.location.reload()}>
              Обновить страницу
            </AppButton>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box className="mt-6 text-left">
                <Typography variant="caption" className="text-gray-500">
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}