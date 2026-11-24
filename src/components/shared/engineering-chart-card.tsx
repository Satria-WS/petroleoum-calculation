'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, Box, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';

interface EngineeringChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onExportCsv?: () => void;
  action?: React.ReactNode;
}

export function EngineeringChartCard({
  title,
  subtitle,
  children,
  onExportCsv,
  action,
}: EngineeringChartCardProps) {
  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary' }}>
            {title}
          </Typography>
        }
        subheader={
          subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {subtitle}
            </Typography>
          )
        }
        action={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {action}
            {onExportCsv && (
              <Tooltip title="Export Chart Data as CSV">
                <IconButton size="small" onClick={onExportCsv} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <DownloadOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        }
        sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1.5, px: 2.5 }}
      />
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ width: '100%', height: { xs: 320, sm: 380 } }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}
