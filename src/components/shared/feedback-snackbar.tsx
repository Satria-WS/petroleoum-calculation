'use client';

import * as React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface FeedbackSnackbarProps {
  open: boolean;
  message: string;
  severity?: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
  autoHideDuration?: number;
}

export function FeedbackSnackbar({
  open,
  message,
  severity = 'success',
  onClose,
  autoHideDuration = 4000,
}: FeedbackSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontWeight: 500,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
