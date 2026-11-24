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
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import ElectricBoltOutlinedIcon from '@mui/icons-material/ElectricBoltOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import {
  calculateEspSizing,
  calculateGasLift,
  EspSizingResult,
  GasLiftResult,
} from '@/lib/calculations/production/artificial-lift';
import { SaveCaseDialog } from '@/components/shared/save-case-dialog';
import { FeedbackSnackbar } from '@/components/shared/feedback-snackbar';
import { saveProductionCaseAction } from '../actions/save-production-case';

export function ArtificialLiftPanel() {
  const [liftMethod, setLiftMethod] = React.useState<'ESP' | 'GAS_LIFT'>('ESP');

  // ESP Inputs
  const [espTargetRate, setEspTargetRate] = React.useState(2500); // STB/d
  const [espDepth, setEspDepth] = React.useState(7500); // ft
  const [espTubingId, setEspTubingId] = React.useState(2.875); // inches
  const [espPwh, setEspPwh] = React.useState(250); // psi
  const [espPip, setEspPip] = React.useState(850); // psi
  const [espHeadPerStage, setEspHeadPerStage] = React.useState(45); // ft/stage

  // Gas Lift Inputs
  const [glOilRate, setGlOilRate] = React.useState(1800); // STB/d
  const [glFormationGor, setGlFormationGor] = React.useState(350); // scf/STB
  const [glTargetGlr, setGlTargetGlr] = React.useState(850); // scf/STB
  const [glPwh, setGlPwh] = React.useState(200); // psi
  const [glGasPressure, setGlGasPressure] = React.useState(1200); // psi
  const [glDepth, setGlDepth] = React.useState(8500); // ft

  // State
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const espResult: EspSizingResult = React.useMemo(() => {
    return calculateEspSizing({
      targetFlowRate: espTargetRate,
      pumpSettingDepthTVD: espDepth,
      tubingInnerDiameter: espTubingId,
      wellheadPressure: espPwh,
      pumpIntakePressure: espPip,
      headPerStage: espHeadPerStage,
    });
  }, [espTargetRate, espDepth, espTubingId, espPwh, espPip, espHeadPerStage]);

  const gasLiftResult: GasLiftResult = React.useMemo(() => {
    return calculateGasLift({
      oilRate: glOilRate,
      formationGor: glFormationGor,
      targetGlr: glTargetGlr,
      wellheadPressure: glPwh,
      availableGasPressure: glGasPressure,
      depthTVD: glDepth,
    });
  }, [glOilRate, glFormationGor, glTargetGlr, glPwh, glGasPressure, glDepth]);

  const handleSaveCase = async (meta: { caseName: string; notes?: string; status: 'DRAFT' | 'VERIFIED' }) => {
    const res = await saveProductionCaseAction({
      projectId: 'proj_demo_1',
      domain: 'PRODUCTION',
      moduleType: 'ARTIFICIAL_LIFT',
      caseName: meta.caseName,
      unitSystem: 'FIELD',
      inputParams: liftMethod === 'ESP' ? { espTargetRate, espDepth, espTubingId, espPwh, espPip } : { glOilRate, glFormationGor, glTargetGlr },
      outputResults: liftMethod === 'ESP' ? espResult : gasLiftResult,
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
      <Tabs
        value={liftMethod}
        onChange={(_, val) => setLiftMethod(val)}
        sx={{ mb: 3 }}
      >
        <Tab icon={<ElectricBoltOutlinedIcon />} iconPosition="start" value="ESP" label="Electric Submersible Pump (ESP)" sx={{ fontWeight: 700 }} />
        <Tab icon={<AirOutlinedIcon />} iconPosition="start" value="GAS_LIFT" label="Continuous Gas Lift Design" sx={{ fontWeight: 700 }} />
      </Tabs>

      {liftMethod === 'ESP' ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ESP Well & Lift Design Parameters
                </Typography>

                <TextField
                  label="Target Flow Rate [STB/d]"
                  type="number"
                  size="small"
                  fullWidth
                  value={espTargetRate}
                  onChange={(e) => setEspTargetRate(Number(e.target.value))}
                />

                <TextField
                  label="Pump Setting Depth (TVD) [ft]"
                  type="number"
                  size="small"
                  fullWidth
                  value={espDepth}
                  onChange={(e) => setEspDepth(Number(e.target.value))}
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Tubing ID [inches]"
                    type="number"
                    size="small"
                    fullWidth
                    slotProps={{ htmlInput: { step: 0.1 } }}
                    value={espTubingId}
                    onChange={(e) => setEspTubingId(Number(e.target.value))}
                  />
                  <TextField
                    label="Head / Stage [ft]"
                    type="number"
                    size="small"
                    fullWidth
                    value={espHeadPerStage}
                    onChange={(e) => setEspHeadPerStage(Number(e.target.value))}
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Wellhead Pwh [psi]"
                    type="number"
                    size="small"
                    fullWidth
                    value={espPwh}
                    onChange={(e) => setEspPwh(Number(e.target.value))}
                  />
                  <TextField
                    label="Pump Intake PIP [psi]"
                    type="number"
                    size="small"
                    fullWidth
                    value={espPip}
                    onChange={(e) => setEspPip(Number(e.target.value))}
                  />
                </Stack>

                <Button
                  variant="contained"
                  startIcon={<BookmarkAddOutlinedIcon />}
                  onClick={() => setSaveDialogOpen(true)}
                  fullWidth
                  sx={{ mt: 1, fontWeight: 700 }}
                >
                  Save ESP Sizing Case
                </Button>
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Total Dynamic Head (TDH)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                    {espResult.totalDynamicHeadFt.toLocaleString()} ft
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Net lift + tubing friction + wellhead
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Required Pump Stages
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'petro.ipr', mt: 0.5 }}>
                    {espResult.numberOfStages} Stages
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    @ {espHeadPerStage} ft / stage catalog
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Motor Brake Horsepower (BHP)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'petro.oil', mt: 0.5 }}>
                    {espResult.brakeHorsepower} HP
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    60 Hz surface power requirement
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Pump Discharge Pressure
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'petro.vlp', mt: 0.5 }}>
                    {espResult.dischargePressurePsi.toLocaleString()} psi
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Discharge into tubing string
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        /* Gas Lift View */
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Continuous Gas Lift Inputs
                </Typography>

                <TextField
                  label="Target Oil Rate [STB/d]"
                  type="number"
                  size="small"
                  fullWidth
                  value={glOilRate}
                  onChange={(e) => setGlOilRate(Number(e.target.value))}
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Formation GOR [scf/STB]"
                    type="number"
                    size="small"
                    fullWidth
                    value={glFormationGor}
                    onChange={(e) => setGlFormationGor(Number(e.target.value))}
                  />
                  <TextField
                    label="Optimum Target GLR [scf/STB]"
                    type="number"
                    size="small"
                    fullWidth
                    value={glTargetGlr}
                    onChange={(e) => setGlTargetGlr(Number(e.target.value))}
                  />
                </Stack>

                <TextField
                  label="Available Surface Gas Pressure [psi]"
                  type="number"
                  size="small"
                  fullWidth
                  value={glGasPressure}
                  onChange={(e) => setGlGasPressure(Number(e.target.value))}
                />

                <TextField
                  label="Well Depth (TVD) [ft]"
                  type="number"
                  size="small"
                  fullWidth
                  value={glDepth}
                  onChange={(e) => setGlDepth(Number(e.target.value))}
                />

                <Button
                  variant="contained"
                  startIcon={<BookmarkAddOutlinedIcon />}
                  onClick={() => setSaveDialogOpen(true)}
                  fullWidth
                  sx={{ mt: 1, fontWeight: 700 }}
                >
                  Save Gas Lift Case
                </Button>
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Optimum Injection Depth (TVD)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                    {gasLiftResult.injectionDepthTVD.toLocaleString()} ft
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Operating gas lift valve depth
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Required Daily Gas Injection
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'petro.gas', mt: 0.5 }}>
                    {gasLiftResult.requiredGasRateMscfd.toLocaleString()} Mscf/d
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Continuous injection rate
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Save Scenario Dialog */}
      <SaveCaseDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveCase}
        domain="PRODUCTION"
        moduleType="ARTIFICIAL_LIFT"
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
