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
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import Link from 'next/link';
import { HydraulicsEcdPanel } from '@/features/drilling/components/hydraulics-ecd-panel';
import { KillSheetPanel } from '@/features/drilling/components/kill-sheet-panel';

export default function DrillingPage() {
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
            Drilling & Well Control
          </Typography>
        </Breadcrumbs>

        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Drilling Hydraulics & Well Control
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Hydrostatic head ($P_h$), Annular Pressure Loss, Equivalent Circulating Density (ECD), Fracture Gradient margin, and Wait & Weight Kill Sheet pressure schedules.
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            aria-label="Drilling calculation modules"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.9rem',
                minHeight: 48,
                textTransform: 'none',
              },
            }}
          >
            <Tab icon={<ConstructionOutlinedIcon />} iconPosition="start" label="Drilling Hydraulics & ECD Profile" />
            <Tab icon={<SecurityOutlinedIcon />} iconPosition="start" label="Well Control Kill Sheet (Wait & Weight)" />
          </Tabs>
        </Box>
      </Stack>

      {/* Panels */}
      {activeTab === 0 && <HydraulicsEcdPanel />}
      {activeTab === 1 && <KillSheetPanel />}
    </Box>
  );
}
