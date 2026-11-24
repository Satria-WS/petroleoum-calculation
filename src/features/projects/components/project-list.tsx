'use client';

import * as React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Stack,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import PropaneTankOutlinedIcon from '@mui/icons-material/PropaneTankOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import Link from 'next/link';
import { ProjectSummary } from '../types/project.types';
import { deleteProjectAction } from '../actions/delete-project';

interface ProjectListProps {
  projects: ProjectSummary[];
  onRefresh?: () => void;
}

export function ProjectList({ projects, onRefresh }: ProjectListProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" and all saved scenarios?`)) return;
    setDeletingId(id);
    await deleteProjectAction(id);
    setDeletingId(null);
    if (onRefresh) onRefresh();
  };

  const getWellTypeColor = (type: string) => {
    switch (type) {
      case 'OIL':
        return { bg: '#FEF3C7', color: '#B45309', label: 'Oil Well' };
      case 'GAS':
        return { bg: '#FEE2E2', color: '#B91C1C', label: 'Gas Well' };
      case 'CONDENSATE':
        return { bg: '#E0E7FF', color: '#4338CA', label: 'Condensate' };
      default:
        return { bg: '#F1F5F9', color: '#475569', label: type };
    }
  };

  return (
    <Grid container spacing={3}>
      {projects.map((proj) => {
        const badge = getWellTypeColor(proj.wellType);
        return (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={proj.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  borderColor: 'primary.light',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 2.5, flex: 1 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={badge.label}
                      sx={{
                        bgcolor: badge.bg,
                        color: badge.color,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                      }}
                    />
                    <Tooltip title="Delete Well Workspace">
                      <IconButton
                        size="small"
                        color="error"
                        disabled={deletingId === proj.id}
                        onClick={() => handleDelete(proj.id, proj.name)}
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                      {proj.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      Field: <strong>{proj.fieldName}</strong> • Well: <strong>{proj.wellName}</strong>
                    </Typography>
                  </Box>

                  {proj.description && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {proj.description}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={2} sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <CalculateOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {proj._count?.calculationCases || 0} Saved Cases
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <TimelineOutlinedIcon fontSize="small" sx={{ color: 'petro.oil' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {proj._count?.productionHistory || 0} History Records
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  component={Link}
                  href={`/projects/${proj.id}`}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{ fontWeight: 600 }}
                >
                  Open Well Workspace & Scenarios
                </Button>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
