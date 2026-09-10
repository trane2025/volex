import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { Box, IconButton, Tooltip } from '@mui/material';
import type { PaletteMode } from '@mui/material/styles';
import { Link as RouterLink, useLocation } from 'react-router-dom';

interface NavbarProps {
  colorMode: PaletteMode;
  onToggleColorMode: () => void;
}

export const Navbar = ({ colorMode, onToggleColorMode }: NavbarProps) => {
  const { pathname } = useLocation();
  const isDarkMode = colorMode === 'dark';
  const isAdminPage = pathname === '/admin';
  const toggleLabel = isDarkMode ? 'Включить светлую тему' : 'Включить черную тему';

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: { xs: 12, sm: 16 },
        left: { xs: 12, sm: 16 },
        right: { xs: 12, sm: 16 },
        zIndex: (theme) => theme.zIndex.tooltip,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none',
      }}
    >
      <Tooltip title="Открыть админку">
        <IconButton
          aria-label="Открыть админку"
          color={isAdminPage ? 'primary' : 'inherit'}
          component={RouterLink}
          to="/admin"
          sx={{
            width: 44,
            height: 44,
            border: '1px solid',
            borderColor: isAdminPage ? 'primary.main' : 'divider',
            bgcolor: 'background.paper',
            boxShadow: 2,
            pointerEvents: 'auto',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <AdminPanelSettingsRoundedIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title={toggleLabel}>
        <IconButton
          aria-label={toggleLabel}
          color="inherit"
          onClick={onToggleColorMode}
          sx={{
            width: 44,
            height: 44,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: 2,
            pointerEvents: 'auto',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {isDarkMode ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};
