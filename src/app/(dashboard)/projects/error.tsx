'use client';

import * as React from 'react';
import { Box, Typography, Button, Stack, Alert } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box sx={{ py: 8, px: 3, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
      <Stack spacing={3} sx={{ alignItems: 'center' }}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error.message || 'An engineering calculation error occurred while loading this workspace.'}
        </Alert>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Simulation Execution Interrupted
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Please verify your physical parameters and database connection, or retry the calculation.
        </Typography>
        <Button variant="contained" startIcon={<ReplayIcon />} onClick={reset}>
          Retry Operation
        </Button>
      </Stack>
    </Box>
  );
}
