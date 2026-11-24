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
  useTheme,
  Alert,
} from '@mui/material';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
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
  calculateDrillingHydraulics,
  HydraulicsResult,
} from '@/lib/calculations/drilling/hydraulics';
import { EngineeringChartCard } from '@/components/shared/engineering-chart-card';
import { SaveCaseDialog } from '@/components/shared/save-case-dialog';
import { FeedbackSnackbar } from '@/components/shared/feedback-snackbar';
import { saveDrillingCaseAction } from '../actions/save-drilling-case';

export function HydraulicsEcdPanel() {
  const theme = useTheme();

  // Inputs
  const [trueVerticalDepth, setTrueVerticalDepth] = React.useState(9500); // ft
  const [measuredDepth, setMeasuredDepth] = React.useState(10400); // ft
  const [currentMudWeight, setCurrentMudWeight] = React.useState(10.5); // ppg
  const [flowRateGpm, setFlowRateGpm] = React.useState(480); // GPM
  const [leakOffTestEmw, setLeakOffTestEmw] = React.useState(13.8); // ppg
  const [holeDiameter, setHoleDiameter] = React.useState(8.5); // inches
  const [dpDiameter, setDpDiameter] = React.useState(5.0); // inches

  // State
  const [hydraulicsResult, setHydraulicsResult] = React.useState<HydraulicsResult | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  React.useEffect(() => {
    try {
      const res = calculateDrillingHydraulics({
        trueVerticalDepth,
        measuredDepth,
        currentMudWeight,
        flowRateGpm,
        leakOffTestEmw,
        holeDiameterInches: holeDiameter,
        drillpipeOuterDiameter: dpDiameter,
      });
      setHydraulicsResult(res);
    } catch (e) {
      setHydraulicsResult(null);
    }
  }, [
    trueVerticalDepth,
    measuredDepth,
    currentMudWeight,
    flowRateGpm,
    leakOffTestEmw,
    holeDiameter,
    dpDiameter,
  ]);

  const handleSaveCase = async (meta: { caseName: string; notes?: string; status: 'DRAFT' | 'VERIFIED' }) => {
    const res = await saveDrillingCaseAction({
      projectId: 'proj_demo_1',
      domain: 'DRILLING',
      moduleType: 'DRILLING_HYDRAULICS',
      caseName: meta.caseName,
      unitSystem: 'FIELD',
      inputParams: {
        trueVerticalDepth,
        measuredDepth,
        currentMudWeight,
        flowRateGpm,
        leakOffTestEmw,
        holeDiameter,
        dpDiameter,
      },
      outputResults: hydraulicsResult
        ? {
            hydrostaticPressureBottomPsi: hydraulicsResult.hydrostaticPressureBottomPsi,
            annularPressureLossPsi: hydraulicsResult.annularPressureLossPsi,
            ecd: hydraulicsResult.equivalentCirculatingDensityPpg,
            fractureMargin: hydraulicsResult.fractureMarginPpg,
          }
        : null,
      chartSeries: hydraulicsResult ? { pressureProfile: hydraulicsResult.pressureProfile } : {},
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
        {/* Left Column: Wellbore & Mud Parameters */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2.5}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Wellbore Geometry & Mud Inputs
              </Typography>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="True Vertical Depth (TVD) [ft]"
                  type="number"
                  size="small"
                  fullWidth
                  value={trueVerticalDepth}
                  onChange={(e) => setTrueVerticalDepth(Number(e.target.value))}
                />
                <TextField
                  label="Measured Depth (MD) [ft]"
                  type="number"
                  size="small"
                  fullWidth
                  value={measuredDepth}
                  onChange={(e) => setMeasuredDepth(Number(e.target.value))}
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Mud Weight (MW) [ppg]"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { step: 0.1 } }}
                  value={currentMudWeight}
                  onChange={(e) => setCurrentMudWeight(Number(e.target.value))}
                />
                <TextField
                  label="Circulating Rate (Q) [GPM]"
                  type="number"
                  size="small"
                  fullWidth
                  value={flowRateGpm}
                  onChange={(e) => setFlowRateGpm(Number(e.target.value))}
                />
              </Stack>

              <TextField
                label="Leak-Off Test / Fracture Limit (LOT) [ppg]"
                type="number"
                size="small"
                fullWidth
                slotProps={{ htmlInput: { step: 0.1 } }}
                value={leakOffTestEmw}
                onChange={(e) => setLeakOffTestEmw(Number(e.target.value))}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Hole Diameter (Dh) [in]"
                  type="number"
                  size="small"
                  fullWidth
                  value={holeDiameter}
                  onChange={(e) => setHoleDiameter(Number(e.target.value))}
                />
                <TextField
                  label="Drillpipe OD (Dp) [in]"
                  type="number"
                  size="small"
                  fullWidth
                  value={dpDiameter}
                  onChange={(e) => setDpDiameter(Number(e.target.value))}
                />
              </Stack>

              <Button
                variant="contained"
                startIcon={<BookmarkAddOutlinedIcon />}
                onClick={() => setSaveDialogOpen(true)}
                fullWidth
                sx={{ mt: 1, fontWeight: 700 }}
              >
                Save Hydraulics Case
              </Button>
            </Stack>
          </Card>
        </Grid>

        {/* Right Column: ECD Safety Cards & Wellbore Pressure Gradient Plot */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3}>
            {/* KPI Cards */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Equivalent Circulating Density
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                    {hydraulicsResult?.equivalentCirculatingDensityPpg ?? '-'} ppg
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    ECD at Total Depth
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Hydrostatic Pressure (Ph)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
                    {hydraulicsResult?.hydrostaticPressureBottomPsi.toLocaleString() ?? '-'} psi
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Static bottomhole head
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Annular Friction Loss
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'petro.vlp', mt: 0.5 }}>
                    {hydraulicsResult?.annularPressureLossPsi ?? '-'} psi
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Dynamic annular deltaP
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Fracture Safety Margin
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: hydraulicsResult?.isWithinSafeMargin ? 'petro.ipr' : 'error.main',
                      mt: 0.5,
                    }}
                  >
                    {hydraulicsResult?.fractureMarginPpg ?? '-'} ppg
                  </Typography>
                  <Chip
                    size="small"
                    icon={hydraulicsResult?.isWithinSafeMargin ? <CheckCircleIcon /> : <WarningAmberIcon />}
                    label={hydraulicsResult?.isWithinSafeMargin ? 'Safe Window' : 'Fracture Risk'}
                    color={hydraulicsResult?.isWithinSafeMargin ? 'success' : 'error'}
                    sx={{ height: 20, fontSize: '0.65rem', mt: 0.5, fontWeight: 700 }}
                  />
                </Card>
              </Grid>
            </Grid>

            {/* Depth Profile Chart */}
            <EngineeringChartCard
              title="Wellbore Depth Pressure Gradient Profile"
              subtitle="Static Hydrostatic vs Circulating (ECD) vs LOT Fracture Limit Gradient"
            >
              {hydraulicsResult && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hydraulicsResult.pressureProfile}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="depthTvd"
                      unit=" ft"
                      fontSize={11}
                    />
                    <YAxis
                      unit=" psi"
                      fontSize={11}
                    />
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [`${val.toLocaleString()} psi`, name]}
                      labelFormatter={(l: any) => `TVD Depth: ${l} ft`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="hydrostaticPressure"
                      name="Static Hydrostatic (Ph)"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="circulatingPressure"
                      name="Circulating Pressure (Ph + APL)"
                      stroke={theme.palette.petro.oil}
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="fractureLimitPressure"
                      name="LOT Fracture Limit"
                      stroke={theme.palette.petro.fracture}
                      strokeWidth={2}
                      strokeDasharray="5 5"
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
        domain="DRILLING"
        moduleType="DRILLING_HYDRAULICS"
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
