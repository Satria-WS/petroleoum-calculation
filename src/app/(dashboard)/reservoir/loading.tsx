'use client';

import * as React from 'react';
import { Box, Skeleton, Stack, Grid } from '@mui/material';

export default function ReservoirLoading() {
  return (
    <Box>
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Skeleton variant="text" width={180} height={24} />
        <Skeleton variant="text" width={380} height={40} />
        <Skeleton variant="rounded" width={450} height={48} sx={{ borderRadius: 2 }} />
      </Stack>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Skeleton variant="rounded" height={480} sx={{ borderRadius: 3 }} />
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Skeleton variant="rounded" height={480} sx={{ borderRadius: 3 }} />
        </Grid>
      </Grid>
    </Box>
  );
}
