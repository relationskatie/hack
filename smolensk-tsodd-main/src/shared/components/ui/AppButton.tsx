'use client';

import React from 'react';
import { Button, ButtonProps } from '@mui/material';

type AppButtonStyle =
  | 'primary'           // contained primary
  | 'outlined'          // outlined default
  | 'link'              // text link-like
  | 'whiteOnPrimary'    // white bg, primary text (for dark/primary backgrounds)
  | 'outlinedWhite';    // white border/text on dark bg

export interface AppButtonProps extends Omit<ButtonProps, 'variant'> {
  styleType?: AppButtonStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({ styleType = 'primary', sx, children, ...rest }) => {
  let variant: ButtonProps['variant'] = 'contained';
  // Respect provided color prop if any
  let color: ButtonProps['color'] | undefined = (rest as any).color;
  let styleSx: ButtonProps['sx'] = { boxShadow: 1 };

  switch (styleType) {
    case 'primary':
      variant = 'contained';
      if (!color) color = 'primary';
      break;
    case 'outlined':
      variant = 'outlined';
      if (!color) color = 'inherit';
      break;
    case 'link':
      variant = 'text';
      if (!color) color = 'primary';
      styleSx = { p: 0, minWidth: 0 };
      break;
    case 'whiteOnPrimary':
      variant = 'contained';
      color = undefined;
      styleSx = {
        backgroundColor: 'common.white',
        color: 'primary.main',
        '&:hover': { backgroundColor: 'grey.100' },
      };
      break;
    case 'outlinedWhite':
      variant = 'outlined';
      color = undefined;
      styleSx = {
        color: 'common.white',
        borderColor: 'common.white',
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'common.white' },
      };
      break;
    default:
      break;
  }

  return (
    <Button variant={variant} color={color} sx={{ ...styleSx, ...sx }} {...rest}>
      {children}
    </Button>
  );
};

export default AppButton;
