import { Box, CircularProgress, CssBaseline } from '@mui/material';
import { ThemeProvider, type PaletteMode } from '@mui/material/styles';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Layout } from './Layout.tsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { createVolexTheme } from './theme.ts';

const COLOR_MODE_STORAGE_KEY = 'volex-color-mode';

const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })),
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const MessengerPage = lazy(() =>
  import('./pages/MessengerPage').then((module) => ({ default: module.MessengerPage })),
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })),
);

const routeFallback = (
  <Box
    sx={{
      minHeight: '100dvh',
      display: 'grid',
      placeItems: 'center',
    }}
  >
    <CircularProgress />
  </Box>
);

const getInitialPaletteMode = (): PaletteMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedMode = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);

  if (storedMode === 'light' || storedMode === 'dark') {
    return storedMode;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const App = () => {
  const [paletteMode, setPaletteMode] = useState<PaletteMode>(getInitialPaletteMode);
  const theme = useMemo(() => createVolexTheme(paletteMode), [paletteMode]);

  useEffect(() => {
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, paletteMode);
  }, [paletteMode]);

  const togglePaletteMode = useCallback(() => {
    setPaletteMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout colorMode={paletteMode} onToggleColorMode={togglePaletteMode}>
          <Suspense fallback={routeFallback}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/messenger" element={<MessengerPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
};
