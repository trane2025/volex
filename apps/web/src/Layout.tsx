import { Box } from '@mui/material';
import type { PaletteMode } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { Navbar } from './components/Navbar';

interface LayoutProps {
  children: ReactNode;
  colorMode: PaletteMode;
  onToggleColorMode: () => void;
}

export const Layout = ({ children, colorMode, onToggleColorMode }: LayoutProps) => {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Navbar colorMode={colorMode} onToggleColorMode={onToggleColorMode} />

      <Box component="main" sx={{ minHeight: '100dvh' }}>
        {children}
      </Box>
    </Box>
  );
};
