import type { FC, ReactNode } from 'react';
import { useGetMeQuery } from '../../store/features/auth';
import { CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '../../store/features/users/types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { data: user, isLoading, isError } = useGetMeQuery();

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/messenger" replace />;
  }

  return children;
};
