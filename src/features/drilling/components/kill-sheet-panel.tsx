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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
} from '@mui/material';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  calculateKillSheet,
  KillSheetResult,
} from '@/lib/calculations/drilling/kill-sheet';
import { EngineeringChartCard } from '@/components/shared/engineering-chart-card';
import { SaveCaseDialog } from '@/components/shared/save-case-dialog';
import { FeedbackSnackbar } from '@/components/shared/feedback-snackbar';
import { saveDrillingCaseAction } from '../actions/save-drilling-case';

export function KillSheetPanel() {
  const theme = useTheme();

  // Inputs
  const [trueVerticalDepth, setTrueVerticalDepth] = React.useState(9500); // ft
  const [measuredDepth, setMeasuredDepth] = React.useState(10400); // ft
  const [currentMudWeight, setCurrentMudWeight] = React.useState(10.8); // ppg
  const [sidpp, setSidpp] = React.useState(480); // psi
  const [sicp, setSicp] = React.useState(690); // psi
  const [slowCirculatingPressure, setSlowCirculatingPressure] = React.useState(820); // psi
  const [slowCirculatingRateSpm, setSlowCirculatingRateSpm] = React.useState(30); // SPM
  const [drillpipeCapacity, setDrillpipeCapacity] = React.useState(0.01776); // bbl/ft (5" DP)
  const [pumpOutput, setPumpOutput] = React.useState(0.119); // bbl/stroke

  // State
  const [killResult, setKillResult] = React.useState<KillSheetResult | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  React.useEffect(() => {
    try {
      const res = calculateKillSheet({
        trueVerticalDepth,
        measuredDepth,
        currentMudWeight,
        sidpp,
        sicp,
        slowCirculatingPressure,
        slowCirculatingRateSpm,
        drillpipeCapacity,
        pumpOutputBblPerStroke: pumpOutput,
      });
      setKillResult(res);
    } catch (e) {
      setKillResult(null);
    }
  }, [
    trueVerticalDepth,
    measuredDepth,
    currentMudWeight,
    sidpp,
    sicp,
    slowCirculatingPressure,
    slowCirculatingRateSpm,
    drillpipeCapacity,
    pumpOutput,
  ]);

  const handleExportCsv = () => {
    if (!killResult) return;
    const headers = 'Step,Strokes,Drillpipe Pressure (psi),Volume Pumped (bbl)\n';
    const rows = killResult.stepDownSchedule
      .map((s) => `${s.step},${s.strokes},${s.drillpipePressure},${s.volumePumpedBbl}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kill-sheet-schedule-${Date.now()}.csv`;
    a.click();
  };

  const handleSaveCase = async (meta: { caseName: string; notes?: string; status: 'DRAFT' | 'VERIFIED' }) => {
    const res = await saveDrillingCaseAction({
      projectId: 'proj_demo_1',
      domain: 'DRILLING',
      moduleType: 'KILL_SHEET',
      caseName: meta.caseName,
      unitSystem: 'FIELD',
      inputParams: {
        trueVerticalDepth,
        measuredDepth,
        currentMudWeight,
        sidpp,
        sicp,
        slowCirculatingPressure,
        slowCirculatingRateSpm,
        drillpipeCapacity,
        pumpOutput,
      },
      outputResults: killResult
        ? {
            killMudWeightPpg: killResult.killMudWeightPpg,
            icp: killResult.initialCirculatingPressurePsi,
            fcp: killResult.finalCirculatingPressurePsi,
            strokesToBit: killResult.strokesToBit,
          }
        : null,
      chartSeries: killResult ? { stepDownSchedule: killResult.stepDownSchedule } : {},
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
        {/* Left Column: Well Control Shut-In Inputs */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2.5}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Kick Data & Pressure Parameters
              </Typography>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="TVD [ft]"
                  type="number"
                  size="small"
                  fullWidth
                  value={trueVerticalDepth}
                  onChange={(e) => setTrueVerticalDepth(Number(e.target.value))}
                />
                <TextField
                  label="Original Mud Weight [ppg]"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { step: 0.1 } }}
                  value={currentMudWeight}
                  onChange={(e) => setCurrentMudWeight(Number(e.target.value))}
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Shut-In DP (SIDPP) [psi]"
                  type="number"
                  size="small"
                  fullWidth
                  value={sidpp}
                  onChange={(e) => setSidpp(Number(e.target.value))}
                />
                <TextField
                  label="Shut-In Casing (SICP) [psi]"
                  type="number"
                  size="small"
                  fullWidth
                  value={sicp}
                  onChange={(e) => setSicp(Number(e.target.value))}
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Slow Circ. Press. (SCR) [psi]"
                  type="number"
                  size="small"
                  fullWidth
                  value={slowCirculatingPressure}
                  onChange={(e) => setSlowCirculatingPressure(Number(e.target.value))}
                />
                <TextField
                  label="Kill Pump Rate [SPM]"
                  type="number"
                  size="small"
                  fullWidth
                  value={slowCirculatingRateSpm}
                  onChange={(e) => setSlowCirculatingRateSpm(Number(e.target.value))}
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="DP Capacity [bbl/ft]"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { step: 0.001 } }}
                  value={drillpipeCapacity}
                  onChange={(e) => setDrillpipeCapacity(Number(e.target.value))}
                />
                <TextField
                  label="Pump Output [bbl/stroke]"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { step: 0.001 } }}
                  value={pumpOutput}
                  onChange={(e) => setPumpOutput(Number(e.target.value))}
                />
              </Stack>

              <Button
                variant="contained"
                startIcon={<BookmarkAddOutlinedIcon />}
                onClick={() => setSaveDialogOpen(true)}
                fullWidth
                sx={{ mt: 1, fontWeight: 700 }}
              >
                Save Kill Sheet Case
              </Button>
            </Stack>
          </Card>
        </Grid>

        {/* Right Column: Key Well Control KPIs & Schedule Table */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3}>
            {/* KPI Cards */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Kill Mud Weight (KMW)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'error.main', mt: 0.5 }}>
                    {killResult?.killMudWeightPpg ?? '-'} ppg
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Required density
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Initial Circ. (ICP)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                    {killResult?.initialCirculatingPressurePsi ?? '-'} psi
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    SIDPP + SCR
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Final Circ. (FCP)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'petro.ipr', mt: 0.5 }}>
                    {killResult?.finalCirculatingPressurePsi ?? '-'} psi
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    SCR * (KMW/OMW)
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Strokes to Bit
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'petro.oil', mt: 0.5 }}>
                    {killResult?.strokesToBit.toLocaleString() ?? '-'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {killResult?.timeToBitMinutes ?? '-'} mins @ {slowCirculatingRateSpm} SPM
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Step-Down Pressure Chart */}
            <EngineeringChartCard
              title="Drillpipe Pressure Step-Down Schedule"
              subtitle="Linear pressure schedule vs pump strokes from ICP to FCP"
              onExportCsv={handleExportCsv}
            >
              {killResult && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={killResult.stepDownSchedule}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="strokes"
                      unit=" stk"
                      fontSize={11}
                    />
                    <YAxis
                      unit=" psi"
                      domain={[Math.round(killResult.finalCirculatingPressurePsi * 0.9), Math.round(killResult.initialCirculatingPressurePsi * 1.05)]}
                      fontSize={11}
                    />
                    <RechartsTooltip
                      formatter={(val: any) => [`${val} psi`, 'Drillpipe Pressure']}
                      labelFormatter={(l: any) => `Strokes Pumped: ${l}`}
                    />
                    <Line
                      type="linear"
                      dataKey="drillpipePressure"
                      name="Circulating Pressure"
                      stroke={theme.palette.error.main}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </EngineeringChartCard>

            {/* Step-Down Schedule Table */}
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Wait & Weight Pressure Schedule
                </Typography>
                <Button size="small" startIcon={<DownloadOutlinedIcon />} onClick={handleExportCsv} sx={{ fontWeight: 600 }}>
                  Export CSV
                </Button>
              </Box>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Step</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Strokes</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Volume Pumped (bbl)</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Drillpipe Pressure (psi)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {killResult?.stepDownSchedule.map((row) => (
                    <TableRow key={row.step}>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{row.step}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{row.strokes.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{row.volumePumpedBbl.toFixed(1)} bbl</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'error.main' }}>
                        {row.drillpipePressure} psi
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Save Scenario Dialog */}
      <SaveCaseDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveCase}
        domain="DRILLING"
        moduleType="KILL_SHEET"
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
