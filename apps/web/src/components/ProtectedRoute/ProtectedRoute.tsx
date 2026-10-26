import type { FC, ReactNode } from 'react';
import { useGetMeQuery } from '../../store/features/auth';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '../../store/features/users/types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { data: user, isLoading, isFetching, error, refetch } = useGetMeQuery();

  if (isLoading || (!user && isFetching)) {
    return <CircularProgress />;
  }

  if (error && 'status' in error && error.status === 401) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <Box sx={{ pt: 12, px: 2, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>
          Не удалось проверить вход. Проверьте соединение с сервером.
        </Alert>
      </Box>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/messenger" replace />;
  }

  return children;
};
