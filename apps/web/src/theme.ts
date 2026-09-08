import { createTheme, type PaletteMode } from '@mui/material/styles';

export const createVolexTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            primary: {
              main: '#38bdf8',
            },
            secondary: {
              main: '#f472b6',
            },
            background: {
              default: '#050505',
              paper: '#111111',
            },
            text: {
              primary: '#f8fafc',
              secondary: '#a1a1aa',
            },
            divider: 'rgba(255, 255, 255, 0.14)',
          }
        : {
            primary: {
              main: '#2563eb',
            },
            secondary: {
              main: '#7c3aed',
            },
            background: {
              default: '#f5f7fb',
              paper: '#ffffff',
            },
          }),
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },
    },
  });
