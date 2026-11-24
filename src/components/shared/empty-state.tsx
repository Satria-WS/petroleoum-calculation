'use client';

import * as React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 420, mx: 'auto' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon || <FolderOpenOutlinedIcon fontSize="large" />}
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {description}
          </Typography>
        </Box>
        {actionLabel && onAction && (
          <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
