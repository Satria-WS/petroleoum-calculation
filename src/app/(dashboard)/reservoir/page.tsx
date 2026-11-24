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
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import BalanceOutlinedIcon from '@mui/icons-material/BalanceOutlined';
import Link from 'next/link';
import { VolumetricMonteCarloPanel } from '@/features/reservoir/components/volumetric-monte-carlo-panel';
import { DcaArpsPanel } from '@/features/reservoir/components/dca-arps-panel';
import { MaterialBalancePanel } from '@/features/reservoir/components/material-balance-panel';

export default function ReservoirPage() {
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <Box>
      {/* Header & Breadcrumb */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component={Link} href="/projects" color="inherit" underline="hover">
            Workspaces
          </MuiLink>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            Reservoir Engineering
          </Typography>
        </Breadcrumbs>

        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Reservoir Engineering & Simulation
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Reserve sizing (OOIP/OGIP), probabilistic Monte Carlo analysis, Arps decline forecasting, and Havlena-Odeh material balance.
          </Typography>
        </Box>

        {/* Domain Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            aria-label="Reservoir calculation modules"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.9rem',
                minHeight: 48,
                textTransform: 'none',
              },
            }}
          >
            <Tab icon={<LayersOutlinedIcon />} iconPosition="start" label="Volumetric & Monte Carlo" />
            <Tab icon={<TimelineOutlinedIcon />} iconPosition="start" label="Arps Decline Curve (DCA)" />
            <Tab icon={<BalanceOutlinedIcon />} iconPosition="start" label="Material Balance (Havlena-Odeh)" />
          </Tabs>
        </Box>
      </Stack>

      {/* Tab Panels */}
      {activeTab === 0 && <VolumetricMonteCarloPanel />}
      {activeTab === 1 && <DcaArpsPanel />}
      {activeTab === 2 && <MaterialBalancePanel />}
    </Box>
  );
}
