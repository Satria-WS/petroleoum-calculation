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
  Slider,
  Chip,
  useTheme,
  Alert,
} from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import Papa from 'papaparse';
import { runDcaAnalysis, DcaResult } from '@/lib/calculations/reservoir/dca';
import { EngineeringChartCard } from '@/components/shared/engineering-chart-card';
import { SaveCaseDialog } from '@/components/shared/save-case-dialog';
import { FeedbackSnackbar } from '@/components/shared/feedback-snackbar';
import { saveReservoirCaseAction } from '../actions/save-reservoir-case';

export function DcaArpsPanel() {
  const theme = useTheme();

  // DCA Parameters
  const [initialRate, setInitialRate] = React.useState(1200); // STB/d
  const [initialDecline, setInitialDecline] = React.useState(0.25); // fraction/yr
  const [bFactor, setBFactor] = React.useState(0.4); // 0 to 1+
  const [economicLimit, setEconomicLimit] = React.useState(50); // STB/d
  const [forecastYears, setForecastYears] = React.useState(10); // years

  // State
  const [dcaResult, setDcaResult] = React.useState<DcaResult | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Calculate DCA Forecast
  React.useEffect(() => {
    try {
      const res = runDcaAnalysis({
        initialRate,
        initialDeclineNominal: initialDecline,
        bFactor,
        economicLimitRate: economicLimit,
        forecastYears,
      });
      setDcaResult(res);
    } catch (e) {
      setDcaResult(null);
    }
  }, [initialRate, initialDecline, bFactor, economicLimit, forecastYears]);

  // Handle CSV Upload
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        if (rows.length > 0 && rows[0].oilRate) {
          const firstRate = parseFloat(rows[0].oilRate);
          if (!isNaN(firstRate) && firstRate > 0) {
            setInitialRate(firstRate);
            setSnackbar({
              open: true,
              message: `Successfully loaded ${rows.length} production history records. Updated initial rate to ${firstRate} STB/d.`,
              severity: 'success',
            });
          }
        }
      },
    });
  };

  const handleSaveCase = async (meta: { caseName: string; notes?: string; status: 'DRAFT' | 'VERIFIED' }) => {
    const res = await saveReservoirCaseAction({
      projectId: 'proj_demo_1',
      domain: 'RESERVOIR',
      moduleType: 'DCA_ARPS',
      caseName: meta.caseName,
      unitSystem: 'FIELD',
      inputParams: {
        initialRate,
        initialDeclineNominal: initialDecline,
        bFactor,
        economicLimitRate: economicLimit,
        forecastYears,
      },
      outputResults: dcaResult
        ? {
            declineModelUsed: dcaResult.declineModelUsed,
            timeToLimitYears: dcaResult.timeToEconomicLimitYears,
            eur: dcaResult.estimatedUltimateRecovery,
          }
        : null,
      chartSeries: dcaResult ? { forecastSeries: dcaResult.forecastSeries } : {},
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
        {/* Left Column: Parameter Sliders & Inputs */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2.5}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Arps Decline Parameters
                </Typography>
                <Chip
                  size="small"
                  label={dcaResult?.declineModelUsed ?? 'HYPERBOLIC'}
                  color="primary"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              <TextField
                label="Initial Flow Rate (qi) [STB/d]"
                type="number"
                size="small"
                fullWidth
                value={initialRate}
                onChange={(e) => setInitialRate(Math.max(1, Number(e.target.value)))}
              />

              <TextField
                label="Nominal Decline Rate (Di) [fraction/yr]"
                type="number"
                size="small"
                fullWidth
                slotProps={{ htmlInput: { step: 0.05, min: 0.01, max: 0.99 } }}
                value={initialDecline}
                onChange={(e) => setInitialDecline(Math.max(0.01, Number(e.target.value)))}
                helperText={`${(initialDecline * 100).toFixed(1)}% annual decline`}
              />

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                  Arps b-Factor Exponent: <strong>{bFactor.toFixed(2)}</strong>
                </Typography>
                <Slider
                  value={bFactor}
                  min={0.0}
                  max={1.5}
                  step={0.05}
                  onChange={(_, val) => setBFactor(val as number)}
                  marks={[
                    { value: 0, label: 'Exp (b=0)' },
                    { value: 0.5, label: 'Hyp (0.5)' },
                    { value: 1.0, label: 'Harm (1.0)' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              <TextField
                label="Economic Limit Rate (q_el) [STB/d]"
                type="number"
                size="small"
                fullWidth
                value={economicLimit}
                onChange={(e) => setEconomicLimit(Math.max(1, Number(e.target.value)))}
              />

              <TextField
                label="Forecast Duration [Years]"
                type="number"
                size="small"
                fullWidth
                value={forecastYears}
                onChange={(e) => setForecastYears(Math.max(1, Number(e.target.value)))}
              />

              {/* CSV Upload */}
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileOutlinedIcon />}
                fullWidth
                sx={{ fontWeight: 600 }}
              >
                Import Production History CSV
                <input type="file" accept=".csv" hidden onChange={handleCsvUpload} />
              </Button>

              <Button
                variant="contained"
                startIcon={<BookmarkAddOutlinedIcon />}
                onClick={() => setSaveDialogOpen(true)}
                fullWidth
                sx={{ fontWeight: 700 }}
              >
                Save DCA Forecast Case
              </Button>
            </Stack>
          </Card>
        </Grid>

        {/* Right Column: Key Outputs & Curve Plots */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* KPI Summary Cards */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Estimated Ultimate Recovery (EUR)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'petro.oil', mt: 0.5 }}>
                    {dcaResult ? (dcaResult.estimatedUltimateRecovery / 1e6).toFixed(2) : '-'} MM
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    STB at economic limit
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Time to Economic Limit
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                    {dcaResult?.timeToEconomicLimitYears ?? '-'} Years
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {dcaResult?.timeToEconomicLimitMonths ?? '-'} months
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Cumulative Production (10-Yr)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'petro.ipr', mt: 0.5 }}>
                    {dcaResult?.forecastSeries.length
                      ? (dcaResult.forecastSeries[dcaResult.forecastSeries.length - 1].cumulativeProduction / 1e6).toFixed(2)
                      : '-'}{' '}
                    MM
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    STB projected
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Production Forecast Curves */}
            <EngineeringChartCard
              title="Decline Curve & Cumulative Recovery Forecast"
              subtitle="Dual-axis visualization: Monthly flowrate q(t) vs Cumulative recovery Np(t)"
            >
              {dcaResult && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dcaResult.forecastSeries}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="timeYears" unit=" yr" fontSize={11} />
                    <YAxis yAxisId="left" unit=" STB/d" fontSize={11} stroke={theme.palette.petro.oil} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`}
                      unit=" STB"
                      fontSize={11}
                      stroke={theme.palette.primary.main}
                    />
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [
                        name === 'rate' ? `${val} STB/d` : `${(val / 1e6).toFixed(3)} MM STB`,
                        name === 'rate' ? 'Production Rate' : 'Cumulative Np',
                      ]}
                      labelFormatter={(l: any) => `Time: ${l} Years`}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="rate"
                      name="Flow Rate q(t)"
                      stroke={theme.palette.petro.oil}
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cumulativeProduction"
                      name="Cumulative Np(t)"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
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
        moduleType="DCA_ARPS"
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
