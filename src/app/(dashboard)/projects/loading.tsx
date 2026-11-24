'use client';

import * as React from 'react';
import { Box, Skeleton, Stack, Grid } from '@mui/material';

export default function ProjectsLoading() {
  return (
    <Box>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Skeleton variant="text" width={200} height={24} />
        <Skeleton variant="text" width={400} height={48} />
      </Stack>

      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
