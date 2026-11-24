'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import PropaneTankOutlinedIcon from '@mui/icons-material/PropaneTankOutlined';
import Link from 'next/link';
import { CaseCompareTable } from '@/features/projects/components/case-compare-table';
import { useParams } from 'next/navigation';

const DEMO_PROJECT_CASES = [
  {
    id: 'case_1',
    caseName: 'Brent Sandstone STOIIP Base Case',
    domain: 'RESERVOIR',
    moduleType: 'VOLUMETRIC_MONTE_CARLO',
    unitSystem: 'FIELD',
    status: 'VERIFIED' as const,
    createdAt: new Date(),
    inputParams: { area: 640, thickness: 85, porosity: 0.24, waterSaturation: 0.22 },
    outputResults: { stoiip: 57422325, recoverableReserves: 20097814, p50: 57200000 },
  },
  {
    id: 'case_2',
    caseName: 'Initial Inflow / VLP Natural Flow Analysis',
    domain: 'PRODUCTION',
    moduleType: 'NODAL_ANALYSIS',
    unitSystem: 'FIELD',
    status: 'VERIFIED' as const,
    createdAt: new Date(),
    inputParams: { reservoirPressure: 4500, bubblePointPressure: 3200, productivityIndex: 3.5 },
    outputResults: { operatingFlowRate: 3420, operatingPwf: 3522, aofp: 8100 },
  },
  {
    id: 'case_3',
    caseName: '9-5/8" Casing Section Kick Mitigation',
    domain: 'DRILLING',
    moduleType: 'KILL_SHEET',
    unitSystem: 'FIELD',
    status: 'VERIFIED' as const,
    createdAt: new Date(),
    inputParams: { trueVerticalDepth: 9500, currentMudWeight: 10.8, sidpp: 480 },
    outputResults: { killMudWeightPpg: 11.77, initialCirculatingPressure: 1300, finalCirculatingPressure: 894 },
  },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  return (
    <Box>
      {/* Breadcrumb & Navigation */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component={Link} href="/projects" color="inherit" underline="hover">
            Well Workspaces
          </MuiLink>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            Gullfaks Main Brent Oil (A-12H)
          </Typography>
        </Breadcrumbs>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Gullfaks Main Brent Oil
              </Typography>
              <Chip label="OIL WELL" color="warning" size="small" sx={{ fontWeight: 700 }} />
              <Chip label="ACTIVE" color="success" size="small" sx={{ fontWeight: 700 }} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Field: <strong>Gullfaks</strong> • Well Identifier: <strong>A-12H</strong> • Offshore Horizontal Producer
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              component={Link}
              href="/projects"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{ fontWeight: 600 }}
            >
              Back to Projects
            </Button>
            <Button
              component={Link}
              href="/reservoir"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ fontWeight: 700 }}
            >
              Add New Simulation
            </Button>
          </Stack>
        </Stack>
      </Stack>

      {/* Well Metadata Card */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Target Reservoir Formation
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Brent Sandstone Group
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Total Depth (MD / TVD)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              10,400 ft / 9,500 ft
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Associated Scenarios
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              3 Verified Engineering Cases
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Workspace Status
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
              Compliant & Verified
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Side-by-Side Comparison Matrix */}
      <CaseCompareTable cases={DEMO_PROJECT_CASES} />
    </Box>
  );
}
