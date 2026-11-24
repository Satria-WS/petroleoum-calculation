'use client';

import * as React from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  MenuItem,
  Typography,
} from '@mui/material';
import { createProjectAction } from '../actions/create-project';

interface ProjectFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProjectFormDialog({ open, onClose, onSuccess }: ProjectFormDialogProps) {
  const [name, setName] = React.useState('');
  const [fieldName, setFieldName] = React.useState('');
  const [wellName, setWellName] = React.useState('');
  const [wellType, setWellType] = React.useState<'OIL' | 'GAS' | 'CONDENSATE'>('OIL');
  const [description, setDescription] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await createProjectAction({
      name,
      fieldName,
      wellName,
      wellType,
      description,
    });
    setLoading(false);

    if (res.success) {
      setName('');
      setFieldName('');
      setWellName('');
      setDescription('');
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Initialize Well Project
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
            Set up an engineering workspace for multi-scenario simulations
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {errorMsg && (
              <Typography color="error" variant="body2">
                {errorMsg}
              </Typography>
            )}

            <TextField
              label="Project Title"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brent Sandstone Reservoir Optimization"
              disabled={loading}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Field Name"
                required
                fullWidth
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="e.g. Gullfaks, Permian"
                disabled={loading}
              />
              <TextField
                label="Well Identifier"
                required
                fullWidth
                value={wellName}
                onChange={(e) => setWellName(e.target.value)}
                placeholder="e.g. A-12H, Well-01"
                disabled={loading}
              />
            </Stack>

            <TextField
              select
              label="Primary Fluid / Well Type"
              fullWidth
              value={wellType}
              onChange={(e) => setWellType(e.target.value as any)}
              disabled={loading}
            >
              <MenuItem value="OIL">Black / Volatile Oil Producer</MenuItem>
              <MenuItem value="GAS">Natural Gas Well</MenuItem>
              <MenuItem value="CONDENSATE">Gas Condensate Well</MenuItem>
            </TextField>

            <TextField
              label="Geological / Engineering Description"
              multiline
              rows={3}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Target formation, depth interval, lithology details..."
              disabled={loading}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading || !name || !fieldName || !wellName}>
            {loading ? 'Creating...' : 'Create Well Workspace'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
