import { IconAction } from '../../UI/icons/IconAction';
import { Box } from '@mui/material';
import type { PaletteMode } from '@mui/material/styles';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../../store';
import { authQuery, useGetMeQuery, useLogoutMutation } from '../../store/features/auth';
import { usersQuery } from '../../store/features/users';
import { MessageAlert } from '../../UI/alerts/MessageAlert';

interface NavbarProps {
  colorMode: PaletteMode;
  onToggleColorMode: () => void;
}

export const Navbar = ({ colorMode, onToggleColorMode }: NavbarProps) => {
  const { pathname } = useLocation();
  const isDarkMode = colorMode === 'dark';
  const isAdminPage = pathname === '/admin';
  const toggleLabel = isDarkMode ? 'Включить светлую тему' : 'Включить черную тему';

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [logoutError, setLogoutError] = useState('');
  const { data: user } = useGetMeQuery();
  const [logout, { isLoading: isLoadingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    setLogoutError('');

    try {
      await logout().unwrap();
      dispatch(usersQuery.util.resetApiState());
      dispatch(authQuery.util.resetApiState());
      navigate('/login', { replace: true });
    } catch {
      setLogoutError('Не удалось выйти. Попробуйте ещё раз');
    }
  };

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
      <MessageAlert message={logoutError} placement="header" />
      <Box sx={{ display: 'flex', gap: 1 }}>
        {user ? (
          <>
            <IconAction
              icon="chat"
              label="Открыть мессенджер"
              variant="header"
              active={pathname === '/messenger'}
              to="/messenger"
            />
            <IconAction
              icon="profile"
              label="Открыть профиль"
              variant="header"
              active={pathname === '/profile'}
              to="/profile"
            />
          </>
        ) : null}
        {user ? (
          <IconAction
            icon="logout"
            label="Выйти"
            variant="header"
            disabled={isLoadingOut}
            onClick={handleLogout}
          />
        ) : null}
        {user?.role === 'ADMIN' ? (
          <IconAction
            icon="admin"
            label="Открыть админку"
            variant="header"
            active={isAdminPage}
            to="/admin"
          />
        ) : null}
      </Box>
      <IconAction
        icon={isDarkMode ? 'lightMode' : 'darkMode'}
        label={toggleLabel}
        variant="header"
        onClick={onToggleColorMode}
      />
    </Box>
  );
};
