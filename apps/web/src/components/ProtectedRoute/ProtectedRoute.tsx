import type { FC, ReactNode } from 'react';
import { useGetMeQuery } from '../../store/features/auth';
import { CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoading, isError } = useGetMeQuery();

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
