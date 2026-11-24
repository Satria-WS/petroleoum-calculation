import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    petro: {
      oil: string;
      gas: string;
      water: string;
      ipr: string;
      vlp: string;
      fracture: string;
      porePressure: string;
    };
  }
  interface PaletteOptions {
    petro?: {
      oil?: string;
      gas?: string;
      water?: string;
      ipr?: string;
      vlp?: string;
      fracture?: string;
      porePressure?: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0284C7', // Sky Blue / Cyan Engineering
      light: '#38BDF8',
      dark: '#0369A1',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#475569', // Slate
      light: '#64748B',
      dark: '#334155',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    petro: {
      oil: '#D97706',      // Amber Gold for Oil
      gas: '#EF4444',      // Flame Red for Gas
      water: '#2563EB',    // Deep Water Blue
      ipr: '#16A34A',      // Reservoir Inflow Green
      vlp: '#9333EA',      // Wellbore Lift Purple
      fracture: '#DC2626', // Fracture gradient
      porePressure: '#F59E0B', // Pore pressure
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
          borderRadius: 12,
        },
      },
    },
  },
});
