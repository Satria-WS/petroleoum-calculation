'use client';

import * as React from 'react';
import { ToggleButton, ToggleButtonGroup, Typography, Stack, Tooltip } from '@mui/material';

interface UnitSystemToggleProps {
  unitSystem: 'FIELD' | 'SI';
  onChange: (system: 'FIELD' | 'SI') => void;
  size?: 'small' | 'medium';
}

export function UnitSystemToggle({ unitSystem, onChange, size = 'small' }: UnitSystemToggleProps) {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newSystem: 'FIELD' | 'SI' | null
  ) => {
    if (newSystem !== null) {
      onChange(newSystem);
    }
  };

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
        Units:
      </Typography>
      <ToggleButtonGroup
        value={unitSystem}
        exclusive
        onChange={handleChange}
        size={size}
        aria-label="Unit System"
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '& .MuiToggleButton-root': {
            px: 1.5,
            py: 0.5,
            fontWeight: 700,
            fontSize: '0.75rem',
            border: 'none',
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: '#fff',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            },
          },
        }}
      >
        <Tooltip title="Field Units: psi, bbl, ft, ppg, °F">
          <ToggleButton value="FIELD" aria-label="Field Units">
            FIELD
          </ToggleButton>
        </Tooltip>
        <Tooltip title="SI Metric Units: bar, m³, m, kg/m³, °C">
          <ToggleButton value="SI" aria-label="SI Metric Units">
            SI METRIC
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Stack>
  );
}
