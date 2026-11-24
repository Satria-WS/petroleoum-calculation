'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import PrecisionManufacturingOutlinedIcon from '@mui/icons-material/PrecisionManufacturingOutlined';
import ElectricBoltOutlinedIcon from '@mui/icons-material/ElectricBoltOutlined';
import Link from 'next/link';
import { NodalAnalysisPanel } from '@/features/production/components/nodal-analysis-panel';
import { ArtificialLiftPanel } from '@/features/production/components/artificial-lift-panel';

export default function ProductionPage() {
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <Box>
      {/* Header & Breadcrumbs */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component={Link} href="/projects" color="inherit" underline="hover">
            Workspaces
          </MuiLink>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            Production Engineering
          </Typography>
        </Breadcrumbs>

        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Production Engineering & Well Deliverability
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Inflow performance modeling (Darcy & Vogel two-phase), vertical lift tubing hydraulics (VLP), operating point bisection solver, and artificial lift design (ESP & Gas Lift).
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            aria-label="Production calculation modules"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.9rem',
                minHeight: 48,
                textTransform: 'none',
              },
            }}
          >
            <Tab icon={<PrecisionManufacturingOutlinedIcon />} iconPosition="start" label="Nodal Analysis (IPR / VLP Solver)" />
            <Tab icon={<ElectricBoltOutlinedIcon />} iconPosition="start" label="Artificial Lift Sizing (ESP & Gas Lift)" />
          </Tabs>
        </Box>
      </Stack>

      {/* Panels */}
      {activeTab === 0 && <NodalAnalysisPanel />}
      {activeTab === 1 && <ArtificialLiftPanel />}
    </Box>
  );
}
