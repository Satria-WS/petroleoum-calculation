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
  MenuItem,
  useTheme,
  Alert,
} from '@mui/material';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import TuneIcon from '@mui/icons-material/Tune';
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
import {
  runNodalAnalysis,
  NodalAnalysisResult,
} from '@/lib/calculations/production/nodal-analysis';
import { EngineeringChartCard } from '@/components/shared/engineering-chart-card';
import { SaveCaseDialog } from '@/components/shared/save-case-dialog';
import { FeedbackSnackbar } from '@/components/shared/feedback-snackbar';
import { saveProductionCaseAction } from '../actions/save-production-case';

export function NodalAnalysisPanel() {
  const theme = useTheme();

  // Inflow Parameters
  const [reservoirPressure, setReservoirPressure] = React.useState(4200); // psi
  const [bubblePointPressure, setBubblePointPressure] = React.useState(3100); // psi
  const [productivityIndex, setProductivityIndex] = React.useState(3.0); // STB/d/psi

  // Outflow Parameters
  const [wellheadPressure, setWellheadPressure] = React.useState(250); // psi
  const [tubingId, setTubingId] = React.useState(2.875); // inches
  const [depthTvd, setDepthTvd] = React.useState(8500); // ft
  const [gasLiquidRatio, setGasLiquidRatio] = React.useState(600); // scf/STB
  const [waterCut, setWaterCut] = React.useState(0.1); // fraction

  // Result state
  const [nodalResult, setNodalResult] = React.useState<NodalAnalysisResult | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Calculate Nodal Analysis on parameter adjustment
  React.useEffect(() => {
    try {
      const res = runNodalAnalysis(
        {
          reservoirPressure,
          bubblePointPressure,
          productivityIndex,
        },
        {
          wellheadPressure,
          tubingInnerDiameter: tubingId,
          depthTVD: depthTvd,
          gasLiquidRatio,
          waterCut,
        }
      );
      setNodalResult(res);
    } catch (e) {
      setNodalResult(null);
    }
  }, [
    reservoirPressure,
    bubblePointPressure,
    productivityIndex,
    wellheadPressure,
    tubingId,
    depthTvd,
    gasLiquidRatio,
    waterCut,
  ]);

  const handleSaveCase = async (meta: { caseName: string; notes?: string; status: 'DRAFT' | 'VERIFIED' }) => {
    const res = await saveProductionCaseAction({
      projectId: 'proj_demo_1',
      domain: 'PRODUCTION',
      moduleType: 'NODAL_ANALYSIS',
      caseName: meta.caseName,
      unitSystem: 'FIELD',
      inputParams: {
        reservoirPressure,
        bubblePointPressure,
        productivityIndex,
        wellheadPressure,
        tubingInnerDiameter: tubingId,
        depthTVD: depthTvd,
        gasLiquidRatio,
        waterCut,
      },
      outputResults: nodalResult
        ? {
            aofp: nodalResult.aofp,
            operatingPoint: nodalResult.operatingPoint,
          }
        : null,
      chartSeries: nodalResult ? { curves: nodalResult.curves } : {},
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
        {/* Left Column: Interactive Parametric Controls */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            {/* Inflow Card */}
            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'petro.ipr' }}>
                  Reservoir Inflow (IPR) Parameters
                </Typography>

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Reservoir Pressure (Pr) [psi]"
                    type="number"
                    size="small"
                    fullWidth
                    value={reservoirPressure}
                    onChange={(e) => setReservoirPressure(Math.max(100, Number(e.target.value)))}
                  />
                  <TextField
                    label="Bubble Point (Pb) [psi]"
                    type="number"
                    size="small"
                    fullWidth
                    value={bubblePointPressure}
                    onChange={(e) => setBubblePointPressure(Math.max(0, Number(e.target.value)))}
                  />
                </Stack>

                <TextField
                  label="Productivity Index (PI) [STB/d/psi]"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { step: 0.1, min: 0.1 } }}
                  value={productivityIndex}
                  onChange={(e) => setProductivityIndex(Math.max(0.1, Number(e.target.value)))}
                />
              </Stack>
            </Card>

            {/* Outflow Tubing Card */}
            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2.5}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'petro.vlp' }}>
                    Wellbore Tubing & VLP Outflow
                  </Typography>
                  <TuneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </Stack>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                    Wellhead Pressure (Pwh): <strong>{wellheadPressure} psi</strong>
                  </Typography>
                  <Slider
                    value={wellheadPressure}
                    min={50}
                    max={1000}
                    step={25}
                    onChange={(_, val) => setWellheadPressure(val as number)}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Stack direction="row" spacing={2}>
                  <TextField
                    select
                    label="Tubing Inner Diameter (ID)"
                    size="small"
                    fullWidth
                    value={tubingId}
                    onChange={(e) => setTubingId(Number(e.target.value))}
                  >
                    <MenuItem value={2.441}>2-7/8" Tubing (2.441" ID)</MenuItem>
                    <MenuItem value={2.875}>3-1/2" Tubing (2.875" ID)</MenuItem>
                    <MenuItem value={3.500}>4" Tubing (3.500" ID)</MenuItem>
                    <MenuItem value={3.958}>4-1/2" Tubing (3.958" ID)</MenuItem>
                  </TextField>

                  <TextField
                    label="Well Depth (TVD) [ft]"
                    type="number"
                    size="small"
                    fullWidth
                    value={depthTvd}
                    onChange={(e) => setDepthTvd(Math.max(500, Number(e.target.value)))}
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Gas-Liquid Ratio [scf/STB]"
                    type="number"
                    size="small"
                    fullWidth
                    value={gasLiquidRatio}
                    onChange={(e) => setGasLiquidRatio(Math.max(0, Number(e.target.value)))}
                  />
                  <TextField
                    label="Water Cut [fraction]"
                    type="number"
                    size="small"
                    fullWidth
                    slotProps={{ htmlInput: { step: 0.05, min: 0, max: 0.99 } }}
                    value={waterCut}
                    onChange={(e) => setWaterCut(Number(e.target.value))}
                  />
                </Stack>

                <Button
                  variant="contained"
                  startIcon={<BookmarkAddOutlinedIcon />}
                  onClick={() => setSaveDialogOpen(true)}
                  fullWidth
                  sx={{ mt: 1, fontWeight: 700 }}
                >
                  Save Nodal Operating Point
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column: Operating Point KPIs & Interactive Curves */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3}>
            {/* KPI Cards */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Operating Flow Rate (Qop)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                    {nodalResult?.operatingPoint ? `${nodalResult.operatingPoint.flowRate.toLocaleString()} STB/d` : 'No Flow'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Intersection Point
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Operating Bottomhole Pwf
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'petro.vlp', mt: 0.5 }}>
                    {nodalResult?.operatingPoint ? `${nodalResult.operatingPoint.bottomholePressure.toLocaleString()} psi` : '-'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Flowing Pressure
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Max Deliverability (AOFP)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'petro.ipr', mt: 0.5 }}>
                    {nodalResult ? `${nodalResult.aofp.toLocaleString()} STB/d` : '-'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Theoretical Open Flow
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Nodal Curves Recharts */}
            <EngineeringChartCard
              title="Nodal Analysis System Intersection Plot (IPR vs. VLP)"
              subtitle="Green Curve: Inflow Performance (IPR) • Purple Curve: Vertical Lift Performance (VLP)"
            >
              {nodalResult && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={nodalResult.curves}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="flowRate"
                      unit=" STB/d"
                      fontSize={11}
                      tickFormatter={(v) => `${v}`}
                    />
                    <YAxis
                      unit=" psi"
                      domain={[0, Math.round(reservoirPressure * 1.1)]}
                      fontSize={11}
                    />
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [
                        `${val} psi`,
                        name === 'pwfIpr' ? 'IPR Inflow Pressure' : 'VLP Outflow Pressure',
                      ]}
                      labelFormatter={(l: any) => `Flow Rate: ${l} STB/d`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="pwfIpr"
                      name="IPR Inflow Curve"
                      stroke={theme.palette.petro.ipr}
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="pwfVlp"
                      name="VLP Tubing Curve"
                      stroke={theme.palette.petro.vlp}
                      strokeWidth={3}
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
        domain="PRODUCTION"
        moduleType="NODAL_ANALYSIS"
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
