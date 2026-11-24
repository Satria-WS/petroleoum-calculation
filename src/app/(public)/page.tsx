'use client';

import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import PropaneTankOutlinedIcon from '@mui/icons-material/PropaneTankOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import PrecisionManufacturingOutlinedIcon from '@mui/icons-material/PrecisionManufacturingOutlined';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';

export default function LandingPage() {
  const domains = [
    {
      title: 'Reservoir Engineering',
      icon: <LayersOutlinedIcon fontSize="large" sx={{ color: 'petro.oil' }} />,
      tag: 'Reserve Estimation & Forecast',
      features: [
        'Volumetric OOIP/OGIP deterministic reserve sizing',
        'Monte Carlo risk analysis with P10/P50/P90 distributions & CDF',
        'Arps Decline Curve Analysis (Exponential, Hyperbolic, Harmonic) + EUR',
        'Havlena-Odeh Material Balance diagnostic plots',
      ],
      href: '/reservoir',
    },
    {
      title: 'Production Engineering',
      icon: <PrecisionManufacturingOutlinedIcon fontSize="large" sx={{ color: 'petro.ipr' }} />,
      tag: 'Well Deliverability & Lift',
      features: [
        'Inflow Performance Relationship (IPR) via Darcy & Vogel two-phase',
        'Vertical Lift Performance (VLP) tubing hydraulics curves',
        'Numerical bisection root finder for operating point (Qop, Pwf)',
        'Artificial lift sizing: Electric Submersible Pumps (ESP) & Gas Lift',
      ],
      href: '/production',
    },
    {
      title: 'Drilling & Well Control',
      icon: <ConstructionOutlinedIcon fontSize="large" sx={{ color: 'petro.gas' }} />,
      tag: 'Hydraulics & Pressure Safety',
      features: [
        'Hydrostatic pressure, Annular Pressure Loss, and ECD profiling',
        'Fracture gradient margin and kick tolerance monitoring',
        'Wait & Weight Kill Sheet drillpipe step-down schedule',
        'Strokes-to-bit, strokes-to-surface, and KMW / ICP / FCP',
      ],
      href: '/drilling',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation Header */}
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          py: 2,
          px: { xs: 2, sm: 4 },
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PropaneTankOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }}>
                PetroCalc Suite
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Petroleum Simulation Platform
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Button component={Link} href="/login" variant="outlined" sx={{ fontWeight: 600 }}>
              Engineer Sign In
            </Button>
            <Button component={Link} href="/projects" variant="contained" sx={{ fontWeight: 600 }}>
              Launch Workspaces
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 }, textAlign: 'center' }}>
        <Chip
          label="PetroCalc Suite v1.0 • SPE Standard Formulations"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700, mb: 3 }}
        />
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '2.4rem', sm: '3.4rem', md: '4rem' },
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'text.primary',
            maxWidth: 900,
            mx: 'auto',
          }}
        >
          High-Precision Petroleum Engineering Simulation Platform
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: 'text.secondary',
            mt: 3,
            maxWidth: 720,
            mx: 'auto',
            fontWeight: 400,
            lineHeight: 1.6,
          }}
        >
          Unified calculations across Reservoir, Production, and Well Control.
          Interactive curve diagnostics, instant Field $\leftrightarrow$ SI unit conversions, and multi-scenario well comparison.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center', mt: 5 }}>
          <Button
            component={Link}
            href="/projects"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ px: 4, py: 1.6, fontSize: '1rem', fontWeight: 700 }}
          >
            Open Well Workspace
          </Button>
          <Button
            component={Link}
            href="/register"
            variant="outlined"
            size="large"
            sx={{ px: 4, py: 1.6, fontSize: '1rem', fontWeight: 600 }}
          >
            Create Engineer Profile
          </Button>
        </Stack>
      </Container>

      {/* Three Engineering Pillars */}
      <Container maxWidth="lg" sx={{ pb: 12 }}>
        <Grid container spacing={3}>
          {domains.map((dom) => (
            <Grid size={{ xs: 12, md: 4 }} key={dom.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                  },
                }}
              >
                <CardContent sx={{ p: 0, flex: 1 }}>
                  <Box sx={{ mb: 2 }}>{dom.icon}</Box>
                  <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {dom.tag}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, mb: 2 }}>
                    {dom.title}
                  </Typography>

                  <Stack spacing={1.2}>
                    {dom.features.map((feat, idx) => (
                      <Typography key={idx} variant="body2" sx={{ color: 'text.secondary', display: 'flex' }}>
                        • {feat}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>

                <Button
                  component={Link}
                  href={dom.href}
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ mt: 3, fontWeight: 600 }}
                >
                  Explore Domain Module
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
