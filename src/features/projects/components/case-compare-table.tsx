'use client';

import * as React from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  Typography,
  Chip,
  Box,
  Button,
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';

interface CalculationCaseSummary {
  id: string;
  caseName: string;
  domain: string;
  moduleType: string;
  unitSystem: string;
  status: 'DRAFT' | 'VERIFIED';
  createdAt: string | Date;
  inputParams: any;
  outputResults: any;
}

interface CaseCompareTableProps {
  cases: CalculationCaseSummary[];
}

export function CaseCompareTable({ cases }: CaseCompareTableProps) {
  const handleExportComparisonCsv = () => {
    if (cases.length === 0) return;
    const headers = 'Case Name,Domain,Module,Status,Units,Outputs Summary\n';
    const rows = cases
      .map(
        (c) =>
          `"${c.caseName}","${c.domain}","${c.moduleType}","${c.status}","${c.unitSystem}","${JSON.stringify(c.outputResults).replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-comparison-${Date.now()}.csv`;
    a.click();
  };

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'RESERVOIR':
        return { bg: '#FEF3C7', color: '#B45309' };
      case 'PRODUCTION':
        return { bg: '#DCFCE7', color: '#15803D' };
      case 'DRILLING':
        return { bg: '#FEE2E2', color: '#B91C1C' };
      default:
        return { bg: '#F1F5F9', color: '#475569' };
    }
  };

  return (
    <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Saved Well Simulation Scenarios
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Multi-scenario audit table with domain classification and output verification
          </Typography>
        </Box>
        <Button size="small" variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={handleExportComparisonCsv} sx={{ fontWeight: 600 }}>
          Export Comparison CSV
        </Button>
      </Box>

      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Scenario / Case Name</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Domain</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Key Calculated Outputs</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cases.map((c) => {
            const domainColors = getDomainColor(c.domain);
            return (
              <TableRow key={c.id} hover>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {c.caseName}
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={c.domain}
                    sx={{
                      bgcolor: domainColors.bg,
                      color: domainColors.color,
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.85rem' }}>{c.moduleType.replace(/_/g, ' ')}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={c.status}
                    color={c.status === 'VERIFIED' ? 'success' : 'default'}
                    variant={c.status === 'VERIFIED' ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                  {Object.entries(c.outputResults || {})
                    .slice(0, 3)
                    .map(([k, v]) => `${k}: ${typeof v === 'number' ? v.toLocaleString() : v}`)
                    .join(' • ')}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
