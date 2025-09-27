'use client';

import React from 'react';
import { Box, ButtonProps } from '@mui/material';
import AppButton from './AppButton';

interface ActionButton extends Omit<ButtonProps, 'children'> {
  label: string;
}

interface ToolbarActionsProps {
  actions: ActionButton[];
}

export const ToolbarActions: React.FC<ToolbarActionsProps> = ({ actions }) => {
  return (
    <Box className="flex gap-2">
      {actions.map((action, idx) => (
        <AppButton key={idx} {...action}>
          {action.label}
        </AppButton>
      ))}
    </Box>
  );
};

export default ToolbarActions;
