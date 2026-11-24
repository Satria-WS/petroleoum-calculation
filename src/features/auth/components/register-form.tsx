'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  MenuItem,
  Link as MuiLink,
} from '@mui/material';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerAction } from '../actions/register';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<'ENGINEER' | 'REVIEWER' | 'ADMIN'>('ENGINEER');
  const [preferredUnitSystem, setPreferredUnitSystem] = React.useState<'FIELD' | 'SI'>('FIELD');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await registerAction({
      name,
      email,
      password,
      role,
      preferredUnitSystem,
    });
    setLoading(false);

    if (res.success && res.data?.redirectUrl) {
      router.push(res.data.redirectUrl);
      router.refresh();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 480,
        p: { xs: 2, sm: 3 },
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EngineeringOutlinedIcon fontSize="medium" />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Create Engineer Account
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Join PetroCalc Suite for unified field simulation
            </Typography>
          </Box>

          {errorMsg && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {errorMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Stack spacing={2.5}>
              <TextField
                label="Full Name & Title"
                required
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Alex Rivera (PE)"
                disabled={loading}
              />

              <TextField
                label="Engineering Corporate Email"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.rivera@operator.com"
                disabled={loading}
              />

              <TextField
                label="Password"
                type="password"
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Minimum 8 characters"
                disabled={loading}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Role"
                  fullWidth
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  disabled={loading}
                >
                  <MenuItem value="ENGINEER">Petroleum Engineer</MenuItem>
                  <MenuItem value="REVIEWER">Lead Reviewer</MenuItem>
                  <MenuItem value="ADMIN">System Administrator</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Default Unit System"
                  fullWidth
                  value={preferredUnitSystem}
                  onChange={(e) => setPreferredUnitSystem(e.target.value as any)}
                  disabled={loading}
                >
                  <MenuItem value="FIELD">Field (psi, bbl, ft)</MenuItem>
                  <MenuItem value="SI">SI Metric (bar, m³, m)</MenuItem>
                </TextField>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.4,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                {loading ? 'Creating Profile...' : 'Register & Enter Workspace'}
              </Button>

              <Box sx={{ textAlign: 'center', pt: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Already registered?{' '}
                  <MuiLink component={Link} href="/login" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Sign In
                  </MuiLink>
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
