'use client';

import * as React from 'react';
import {
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

interface SaveCaseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { caseName: string; notes?: string; status: 'DRAFT' | 'VERIFIED' }) => Promise<void>;
  domain: string;
  moduleType: string;
}

export function SaveCaseDialog({
  open,
  onClose,
  onSave,
  domain,
  moduleType,
}: SaveCaseDialogProps) {
  const [caseName, setCaseName] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [status, setStatus] = React.useState<'DRAFT' | 'VERIFIED'>('DRAFT');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setCaseName(`${moduleType.replace(/_/g, ' ')} Case - ${new Date().toLocaleDateString()}`);
      setNotes('');
      setStatus('DRAFT');
    }
  }, [open, moduleType]);

  const handleSave = async () => {
    if (!caseName.trim()) return;
    setSaving(true);
    try {
      await onSave({ caseName, notes, status });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Save Calculation Case
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          Domain: {domain} • Module: {moduleType}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Case Scenario Name"
            required
            fullWidth
            value={caseName}
            onChange={(e) => setCaseName(e.target.value)}
            disabled={saving}
          />
          <TextField
            select
            label="Verification Status"
            fullWidth
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            disabled={saving}
          >
            <MenuItem value="DRAFT">DRAFT (Preliminary Estimation)</MenuItem>
            <MenuItem value="VERIFIED">VERIFIED (Reviewed Engineering Case)</MenuItem>
          </TextField>
          <TextField
            label="Engineering Notes & Assumptions"
            multiline
            rows={3}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document logging tools, fluid sample dates, assumptions..."
            disabled={saving}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || !caseName.trim()} variant="contained">
          {saving ? 'Saving...' : 'Persist Case'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
