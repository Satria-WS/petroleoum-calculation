'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import Link from 'next/link';
import { ProjectList } from '@/features/projects/components/project-list';
import { ProjectFormDialog } from '@/features/projects/components/project-form-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { ProjectSummary } from '@/features/projects/types/project.types';

// Mock initial data for immediate interactive feedback while database connects
const INITIAL_DEMO_PROJECTS: ProjectSummary[] = [
  {
    id: 'proj_demo_1',
    userId: 'user_1',
    name: 'Gullfaks Main Brent Oil',
    fieldName: 'Gullfaks',
    wellName: 'A-12H',
    wellType: 'OIL',
    description: 'Offshore high-deliverability horizontal oil producer targeting Brent sandstone formation.',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      calculationCases: 3,
      productionHistory: 36,
    },
  },
  {
    id: 'proj_demo_2',
    userId: 'user_1',
    name: 'Permian Wolfcamp Shale Gas',
    fieldName: 'Delaware Basin',
    wellName: 'State-4H',
    wellType: 'GAS',
    description: 'Horizontal hydraulically fractured gas condensate producer with Arps DCA logs.',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      calculationCases: 2,
      productionHistory: 24,
    },
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<ProjectSummary[]>(INITIAL_DEMO_PROJECTS);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <Box>
      {/* Header & Breadcrumb */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component={Link} href="/" color="inherit" underline="hover">
            Home
          </MuiLink>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            Well Workspaces
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
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Well Workspaces & Simulation Scenarios
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Manage oil, gas, and condensate wells. Run and compare multi-scenario simulations.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ fontWeight: 700, px: 3, py: 1.2 }}
          >
            New Well Project
          </Button>
        </Stack>
      </Stack>

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderOutlinedIcon fontSize="large" />}
          title="No Well Projects Found"
          description="Create your first field or well workspace to store volumetric reserves, nodal curves, and kill sheets."
          actionLabel="Create First Well Project"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <ProjectList projects={projects} />
      )}

      {/* Project Form Dialog */}
      <ProjectFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          // In actual app, refetch or add newly created project
          setDialogOpen(false);
        }}
      />
    </Box>
  );
}
