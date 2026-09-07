import './App.css';
import { CssBaseline } from '@mui/material';
import { Layout } from './Layout.tsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { MessengerPage } from './pages/MessengerPage';
import { RegisterPage } from './pages/RegisterPage';

export const App = () => {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/messenger" element={<MessengerPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
