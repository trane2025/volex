import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { Box, IconButton, Tooltip } from '@mui/material';
import type { PaletteMode } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  colorMode: PaletteMode;
  onToggleColorMode: () => void;
}

export const Layout = ({ children, colorMode, onToggleColorMode }: LayoutProps) => {
  const isDarkMode = colorMode === 'dark';
  const toggleLabel = isDarkMode ? 'Включить светлую тему' : 'Включить черную тему';

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: { xs: 12, sm: 16 },
          right: { xs: 12, sm: 16 },
          zIndex: (theme) => theme.zIndex.tooltip,
        }}
      >
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
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {isDarkMode ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box component="main" sx={{ minHeight: '100dvh' }}>
        {children}
      </Box>
    </Box>
  );
};
