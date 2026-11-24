import * as React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import PropaneTankOutlinedIcon from '@mui/icons-material/PropaneTankOutlined';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Branding Bar */}
      <Box
        sx={{
          py: 2.5,
          px: { xs: 2, sm: 4 },
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PropaneTankOutlinedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }}>
                PetroCalc Suite
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Petroleum Engineering & Simulation
              </Typography>
            </Box>
          </Stack>
        </Link>
      </Box>

      {/* Main Centered Content */}
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
