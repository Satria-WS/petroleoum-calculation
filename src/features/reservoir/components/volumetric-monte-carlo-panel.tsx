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
  Divider,
  MenuItem,
  useTheme,
  Alert,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  calculateDeterministicOOIP,
  calculateDeterministicOGIP,
  runMonteCarloVolumetric,
  MonteCarloResult,
} from '@/lib/calculations/reservoir/volumetric';
import { EngineeringChartCard } from '@/components/shared/engineering-chart-card';
import { SaveCaseDialog } from '@/components/shared/save-case-dialog';
import { FeedbackSnackbar } from '@/components/shared/feedback-snackbar';
import { saveReservoirCaseAction } from '../actions/save-reservoir-case';

export function VolumetricMonteCarloPanel() {
  const theme = useTheme();

  // Deterministic & Base Inputs
  const [fluidType, setFluidType] = React.useState<'OIL' | 'GAS'>('OIL');
  const [area, setArea] = React.useState(640); // acres
  const [thickness, setThickness] = React.useState(85); // ft
  const [porosity, setPorosity] = React.useState(0.22); // fraction
  const [waterSaturation, setWaterSaturation] = React.useState(0.25); // fraction
  const [formationVolumeFactor, setFormationVolumeFactor] = React.useState(1.25); // Boi or Bgi
  const [recoveryFactor, setRecoveryFactor] = React.useState(0.35); // fraction
  const [seed, setSeed] = React.useState(42);
  const [numTrials, setNumTrials] = React.useState(5000);

  // Simulation State
  const [simulationResult, setSimulationResult] = React.useState<MonteCarloResult | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Calculate Deterministic Baseline
  const deterministicOutput = React.useMemo(() => {
    try {
      if (fluidType === 'OIL') {
        return calculateDeterministicOOIP({
          area,
          thickness,
          porosity,
          waterSaturation,
          formationVolumeFactor,
          recoveryFactor,
        });
      } else {
        return calculateDeterministicOGIP({
          area,
          thickness,
          porosity,
          waterSaturation,
          formationVolumeFactor,
          recoveryFactor,
        });
      }
    } catch (e) {
      return null;
    }
  }, [fluidType, area, thickness, porosity, waterSaturation, formationVolumeFactor, recoveryFactor]);

  // Run Monte Carlo Simulation
  const handleRunSimulation = React.useCallback(() => {
    const res = runMonteCarloVolumetric({
      fluidType,
      area: { type: 'TRIANGULAR', min: area * 0.8, mode: area, max: area * 1.25 },
      thickness: { type: 'TRIANGULAR', min: thickness * 0.75, mode: thickness, max: thickness * 1.2 },
      porosity: { type: 'NORMAL', mean: porosity, stdDev: porosity * 0.1 },
      waterSaturation: { type: 'UNIFORM', min: Math.max(0.05, waterSaturation - 0.08), max: Math.min(0.6, waterSaturation + 0.08) },
      formationVolumeFactor: { type: 'TRIANGULAR', min: formationVolumeFactor * 0.95, mode: formationVolumeFactor, max: formationVolumeFactor * 1.05 },
      recoveryFactor: { type: 'TRIANGULAR', min: recoveryFactor * 0.8, mode: recoveryFactor, max: recoveryFactor * 1.2 },
      numTrials,
      seed,
    });
    setSimulationResult(res);
  }, [fluidType, area, thickness, porosity, waterSaturation, formationVolumeFactor, recoveryFactor, numTrials, seed]);

  React.useEffect(() => {
    handleRunSimulation();
  }, [handleRunSimulation]);

  const handleSaveCase = async (meta: { caseName: string; notes?: string; status: 'DRAFT' | 'VERIFIED' }) => {
    const res = await saveReservoirCaseAction({
      projectId: 'proj_demo_1',
      domain: 'RESERVOIR',
      moduleType: 'VOLUMETRIC_MONTE_CARLO',
      caseName: meta.caseName,
      unitSystem: 'FIELD',
      inputParams: {
        fluidType,
        area,
        thickness,
        porosity,
        waterSaturation,
        formationVolumeFactor,
        recoveryFactor,
        seed,
      },
      outputResults: {
        deterministic: deterministicOutput,
        monteCarlo: simulationResult
          ? {
              p90: simulationResult.p90,
              p50: simulationResult.p50,
              p10: simulationResult.p10,
              mean: simulationResult.mean,
            }
          : null,
      },
      chartSeries: simulationResult ? { histogram: simulationResult.histogram, cdf: simulationResult.cdf } : {},
      notes: meta.notes,
      status: meta.status,
    });

    setSnackbar({
      open: true,
      message: res.message,
      severity: res.success ? 'success' : 'error',
    });
  };

  const volumeUnit = fluidType === 'OIL' ? 'STB' : 'SCF';

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Left Column: Parameter Inputs */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2.5}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Reservoir Petrophysical Inputs
              </Typography>

              <TextField
                select
                label="Fluid System"
                fullWidth
                size="small"
                value={fluidType}
                onChange={(e) => setFluidType(e.target.value as any)}
              >
                <MenuItem value="OIL">Black Oil (STOIIP in STB)</MenuItem>
                <MenuItem value="GAS">Natural Gas (GIIP in SCF)</MenuItem>
              </TextField>

              <TextField
                label="Drainage Area (A) [acres]"
                type="number"
                size="small"
                fullWidth
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
              />

              <TextField
                label="Net Pay Thickness (h) [ft]"
                type="number"
                size="small"
                fullWidth
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Porosity (phi) [fraction]"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { step: 0.01, min: 0.01, max: 0.99 } }}
                  value={porosity}
                  onChange={(e) => setPorosity(Number(e.target.value))}
                />
                <TextField
                  label="Water Sat. (Sw) [fraction]"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { step: 0.01, min: 0.0, max: 0.99 } }}
                  value={waterSaturation}
                  onChange={(e) => setWaterSaturation(Number(e.target.value))}
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  label={fluidType === 'OIL' ? 'Boi [bbl/STB]' : 'Bgi [ft3/SCF]'}
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { step: 0.01 } }}
                  value={formationVolumeFactor}
                  onChange={(e) => setFormationVolumeFactor(Number(e.target.value))}
                />
                <TextField
                  label="Recovery Factor [fraction]"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { step: 0.01, min: 0.01, max: 1.0 } }}
                  value={recoveryFactor}
                  onChange={(e) => setRecoveryFactor(Number(e.target.value))}
                />
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Monte Carlo Risk Configuration
              </Typography>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Trials"
                  type="number"
                  size="small"
                  fullWidth
                  value={numTrials}
                  onChange={(e) => setNumTrials(Number(e.target.value))}
                />
                <TextField
                  label="PRNG Seed"
                  type="number"
                  size="small"
                  fullWidth
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  helperText="Guarantees exact reproducibility"
                />
              </Stack>

              <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayArrowIcon />}
                  onClick={handleRunSimulation}
                  sx={{ fontWeight: 700 }}
                >
                  Run Simulation
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BookmarkAddOutlinedIcon />}
                  onClick={() => setSaveDialogOpen(true)}
                  sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  Save Scenario
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* Right Column: Key Metric Cards & Visualizations */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* KPI Cards */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Deterministic In-Place
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'petro.oil', mt: 0.5 }}>
                    {deterministicOutput ? (deterministicOutput.originalInPlace / 1e6).toFixed(2) : '-'} MM
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {volumeUnit} ({fluidType === 'OIL' ? 'STOIIP' : 'GIIP'})
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    P90 (Conservative / 1P)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
                    {simulationResult ? (simulationResult.p90 / 1e6).toFixed(2) : '-'} MM
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    90% Probability Exceeded
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    P50 (Best Estimate / 2P)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                    {simulationResult ? (simulationResult.p50 / 1e6).toFixed(2) : '-'} MM
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Median Expectation
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    P10 (Optimistic / 3P)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'petro.ipr', mt: 0.5 }}>
                    {simulationResult ? (simulationResult.p10 / 1e6).toFixed(2) : '-'} MM
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    10% Probability Exceeded
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Charts: Histogram & CDF */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <EngineeringChartCard
                  title="Reserve Probability Density (Histogram)"
                  subtitle={`Frequency distribution across ${numTrials} Monte Carlo runs`}
                >
                  {simulationResult && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={simulationResult.histogram}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="binMid"
                          tickFormatter={(val) => `${(val / 1e6).toFixed(1)}M`}
                          fontSize={11}
                        />
                        <YAxis unit="%" fontSize={11} />
                        <RechartsTooltip
                          formatter={(value: any) => [`${value}% frequency`, 'Frequency']}
                          labelFormatter={(label: any) => `Volume: ${(Number(label) / 1e6).toFixed(2)} MM ${volumeUnit}`}
                        />
                        <Bar dataKey="frequency" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </EngineeringChartCard>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EngineeringChartCard
                  title="Cumulative Exceedance Probability (CDF)"
                  subtitle="SPE PRMS P90, P50, and P10 probability curve"
                >
                  {simulationResult && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={simulationResult.cdf}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="value"
                          tickFormatter={(val) => `${(val / 1e6).toFixed(1)}M`}
                          fontSize={11}
                        />
                        <YAxis unit="%" domain={[0, 100]} fontSize={11} />
                        <RechartsTooltip
                          formatter={(value: any) => [`${value}%`, 'Exceedance Prob']}
                          labelFormatter={(label: any) => `Reserve: ${(Number(label) / 1e6).toFixed(2)} MM ${volumeUnit}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="probabilityExceeded"
                          stroke={theme.palette.petro.oil}
                          strokeWidth={2.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </EngineeringChartCard>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>

      {/* Save Scenario Dialog */}
      <SaveCaseDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveCase}
        domain="RESERVOIR"
        moduleType="VOLUMETRIC_MONTE_CARLO"
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
