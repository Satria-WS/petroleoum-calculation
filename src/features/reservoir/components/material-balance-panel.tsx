'use client';

import * as React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
} from '@mui/material';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
} from 'recharts';
import {
  runHavlenaOdehAnalysis,
  MaterialBalanceResult,
  MaterialBalancePoint,
} from '@/lib/calculations/reservoir/material-balance';
import { EngineeringChartCard } from '@/components/shared/engineering-chart-card';
import { SaveCaseDialog } from '@/components/shared/save-case-dialog';
import { FeedbackSnackbar } from '@/components/shared/feedback-snackbar';
import { saveReservoirCaseAction } from '../actions/save-reservoir-case';

const DEFAULT_PRESSURE_POINTS: MaterialBalancePoint[] = [
  { pressure: 4200, cumulativeOil: 0, bo: 1.240, rs: 620, bg: 0.00095 },
  { pressure: 4000, cumulativeOil: 320000, bo: 1.255, rs: 620, bg: 0.00105 },
  { pressure: 3800, cumulativeOil: 680000, bo: 1.272, rs: 620, bg: 0.00115 },
  { pressure: 3600, cumulativeOil: 1050000, bo: 1.290, rs: 620, bg: 0.00128 },
  { pressure: 3400, cumulativeOil: 1450000, bo: 1.310, rs: 620, bg: 0.00142 },
];

export function MaterialBalancePanel() {
  const theme = useTheme();

  // Reservoir PVT Baseline
  const [initialPressure, setInitialPressure] = React.useState(4200); // psi
  const [initialBo, setInitialBo] = React.useState(1.240); // bbl/STB
  const [initialRs, setInitialRs] = React.useState(620); // scf/STB
  const [initialBg, setInitialBg] = React.useState(0.00095); // bbl/scf
  const [gasCapRatio, setGasCapRatio] = React.useState(0.0); // m

  const [points] = React.useState<MaterialBalancePoint[]>(DEFAULT_PRESSURE_POINTS);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const matBalResult: MaterialBalanceResult | null = React.useMemo(() => {
    try {
      return runHavlenaOdehAnalysis({
        initialPressure,
        initialBo,
        initialRs,
        initialBg,
        gasCapRatio,
        dataPoints: points,
      });
    } catch (e) {
      return null;
    }
  }, [initialPressure, initialBo, initialRs, initialBg, gasCapRatio, points]);

  const handleSaveCase = async (meta: { caseName: string; notes?: string; status: 'DRAFT' | 'VERIFIED' }) => {
    const res = await saveReservoirCaseAction({
      projectId: 'proj_demo_1',
      domain: 'RESERVOIR',
      moduleType: 'MATERIAL_BALANCE',
      caseName: meta.caseName,
      unitSystem: 'FIELD',
      inputParams: {
        initialPressure,
        initialBo,
        initialRs,
        initialBg,
        gasCapRatio,
      },
      outputResults: matBalResult
        ? {
            estimatedOOIP: matBalResult.estimatedOOIP,
            rSquared: matBalResult.rSquared,
            inferredDriveMechanism: matBalResult.inferredDriveMechanism,
          }
        : null,
      notes: meta.notes,
      status: meta.status,
    });

    setSnackbar({
      open: true,
      message: res.message,
      severity: res.success ? 'success' : 'error',
    });
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Left Column: PVT Parameters & History */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Havlena-Odeh Reservoir Inputs
                </Typography>

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Initial Pressure (Pi) [psi]"
                    type="number"
                    size="small"
                    fullWidth
                    value={initialPressure}
                    onChange={(e) => setInitialPressure(Number(e.target.value))}
                  />
                  <TextField
                    label="Initial Boi [bbl/STB]"
                    type="number"
                    size="small"
                    fullWidth
                    slotProps={{ htmlInput: { step: 0.01 } }}
                    value={initialBo}
                    onChange={(e) => setInitialBo(Number(e.target.value))}
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Initial Rsi [scf/STB]"
                    type="number"
                    size="small"
                    fullWidth
                    value={initialRs}
                    onChange={(e) => setInitialRs(Number(e.target.value))}
                  />
                  <TextField
                    label="Gas Cap Ratio (m)"
                    type="number"
                    size="small"
                    fullWidth
                    slotProps={{ htmlInput: { step: 0.1, min: 0 } }}
                    value={gasCapRatio}
                    onChange={(e) => setGasCapRatio(Number(e.target.value))}
                  />
                </Stack>

                <Button
                  variant="contained"
                  startIcon={<BookmarkAddOutlinedIcon />}
                  onClick={() => setSaveDialogOpen(true)}
                  fullWidth
                  sx={{ mt: 1, fontWeight: 700 }}
                >
                  Save Material Balance Case
                </Button>
              </Stack>
            </Card>

            {/* Pressure History Table */}
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Historical Pressure & Production Data
                </Typography>
              </Box>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>P (psi)</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Np (STB)</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Bo</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Bg (bbl/scf)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {points.map((pt, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{pt.pressure}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{(pt.cumulativeOil / 1000).toFixed(0)}k</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{pt.bo.toFixed(3)}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{pt.bg}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column: Regression Results & Diagnostic Plot */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3}>
            {/* KPI Cards */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Estimated OOIP (Regression Slope)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'petro.oil', mt: 0.5 }}>
                    {matBalResult ? (matBalResult.estimatedOOIP / 1e6).toFixed(2) : '-'} MM STB
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Linear fit through origin
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Correlation Coefficient (R²)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'petro.ipr', mt: 0.5 }}>
                    {matBalResult?.rSquared ?? '-'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Drive: {matBalResult?.inferredDriveMechanism ?? '-'}
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Diagnostic Plot */}
            <EngineeringChartCard
              title="Havlena-Odeh Diagnostic Plot: F vs. Et"
              subtitle="Linear trendline slope directly equals Original Oil In Place (N)"
            >
              {matBalResult && (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      type="number"
                      dataKey="totalExpansionE"
                      name="Total Expansion Et"
                      unit=" bbl/STB"
                      fontSize={11}
                    />
                    <YAxis
                      type="number"
                      dataKey="undergroundWithdrawalF"
                      name="Fluid Withdrawal F"
                      tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`}
                      unit=" bbl"
                      fontSize={11}
                    />
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [
                        name === 'totalExpansionE' ? val : `${(val / 1e6).toFixed(2)} MM bbl`,
                        name === 'totalExpansionE' ? 'Total Expansion Et' : 'Withdrawal F',
                      ]}
                    />
                    <Scatter
                      name="Production Intervals"
                      data={matBalResult.diagnosticSeries}
                      fill={theme.palette.primary.main}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </EngineeringChartCard>
          </Stack>
        </Grid>
      </Grid>

      {/* Save Scenario Dialog */}
      <SaveCaseDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveCase}
        domain="RESERVOIR"
        moduleType="MATERIAL_BALANCE"
      />

      <FeedbackSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
}
