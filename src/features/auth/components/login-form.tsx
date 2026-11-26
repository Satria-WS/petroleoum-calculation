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
  Link as MuiLink,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAction } from '../actions/login';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await loginAction({ email, password });
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
        maxWidth: 440,
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
            <LockOutlinedIcon fontSize="medium" />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Engineer Sign In
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Enter credentials to access your well calculation workspace
            </Typography>
          </Box>

          {errorMsg && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {errorMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Stack spacing={3.5}>
              <TextField
                label="Engineering Corporate Email"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@petrocalc.com"
                disabled={loading}
              />

              <TextField
                label="Password"
                type="password"
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

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
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              </Button>

              <Box sx={{ textAlign: 'center', pt: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Don&apos;t have an account?{' '}
                  <MuiLink component={Link} href="/register" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Register Engineer Account
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
