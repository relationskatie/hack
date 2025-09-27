'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import AppButton from '@/shared/components/ui/AppButton';
import { Warning as WarningIcon } from '@mui/icons-material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'warning' | 'error' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  severity = 'warning',
  onConfirm,
  onCancel,
}) => {
  const getColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'warning';
    }
  };

  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <WarningIcon className="text-5xl text-red-500" />;
      case 'info':
        return <WarningIcon className="text-5xl text-blue-500" />;
      default:
        return <WarningIcon className="text-5xl text-orange-500" />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box className="flex items-center gap-3">
          {getIcon()}
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" className="text-gray-700">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <AppButton onClick={onCancel} color="inherit" styleType="outlined">
          {cancelText}
        </AppButton>
        <AppButton onClick={onConfirm} styleType="primary" color={getColor() as any}>
          {confirmText}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};