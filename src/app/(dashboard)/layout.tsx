'use client';

import * as React from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Button,
  Chip,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import PrecisionManufacturingOutlinedIcon from '@mui/icons-material/PrecisionManufacturingOutlined';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import PropaneTankOutlinedIcon from '@mui/icons-material/PropaneTankOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UnitSystemToggle } from '@/components/shared/unit-system-toggle';
import { logoutAction } from '@/features/auth/actions/logout';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  domain?: string;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Well Workspaces',
    path: '/projects',
    icon: <FolderOutlinedIcon />,
  },
  {
    label: 'Reservoir',
    path: '/reservoir',
    icon: <LayersOutlinedIcon />,
    domain: 'OOIP • DCA • MatBal',
  },
  {
    label: 'Production',
    path: '/production',
    icon: <PrecisionManufacturingOutlinedIcon />,
    domain: 'Nodal • ESP • Gas Lift',
  },
  {
    label: 'Drilling & Well Control',
    path: '/drilling',
    icon: <ConstructionOutlinedIcon />,
    domain: 'Hydraulics • Kill Sheet',
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [unitSystem, setUnitSystem] = React.useState<'FIELD' | 'SI'>('FIELD');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push('/login');
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Platform Branding */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <PropaneTankOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }}>
              PetroCalc Suite
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Petroleum Simulation v1.0
            </Typography>
          </Box>
        </Link>
      </Box>

      <Divider />

      {/* Navigation Links */}
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                selected={isActive}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#fff',
                    },
                    '& .MuiTypography-root': {
                      color: '#fff',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: isActive ? '#fff' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.domain}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: '0.9rem',
                        fontWeight: isActive ? 700 : 500,
                      },
                    },
                    secondary: {
                      sx: {
                        fontSize: '0.7rem',
                        color: isActive ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* User Session & Logout */}
      <Box sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Box sx={{ px: 1, py: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Lead Petroleum Engineer
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              engineer@petrocalc.com
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            fullWidth
            startIcon={<LogoutOutlinedIcon />}
            onClick={handleLogout}
            sx={{ fontWeight: 600 }}
          >
            Sign Out
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: { xs: 'none', md: 'block' } }}>
              Engineering Calculation Console
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            {/* Global Unit Switcher */}
            <UnitSystemToggle unitSystem={unitSystem} onChange={setUnitSystem} />
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
