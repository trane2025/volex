import { CssBaseline } from '@mui/material';
import { ThemeProvider, type PaletteMode } from '@mui/material/styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout } from './Layout.tsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { MessengerPage } from './pages/MessengerPage';
import { RegisterPage } from './pages/RegisterPage';
import { createVolexTheme } from './theme.ts';

const COLOR_MODE_STORAGE_KEY = 'volex-color-mode';

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
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/messenger" element={<MessengerPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
};
