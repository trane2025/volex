import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ConfirmDialog } from '../../UI/dialogs';
import { useDeleteUserMutation, useGetUsersQuery } from '../../store/features/users';
import type { User } from '../../store/features/users/types.ts';
import { TableUsers } from './TableUsers.tsx';

export const AdminPage = () => {
  const { data: users = [], isLoading, refetch, isError } = useGetUsersQuery();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteUser, { isLoading: isLoadingDelete }] = useDeleteUserMutation();

  const handleCloseDeleteDialog = () => {
    setUserToDelete(null);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) {
      return;
    }

    await deleteUser(userToDelete.id);
    setUserToDelete(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'background.default',
        px: 2,
        py: { xs: 8, sm: 10 },
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: { xs: 3, sm: 4 },
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AdminPanelSettingsRoundedIcon />
                </Avatar>

                <Box>
                  <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
                    Администрирование
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Пользователи сервиса
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={refetch}
                disabled={isLoading}
              >
                Обновить
              </Button>
            </Stack>
          </Paper>

          {isError ? <Alert severity="error">Не удалось загрузить пользователей</Alert> : null}

          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                px: { xs: 2, sm: 3 },
                py: 2,
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <PeopleAltRoundedIcon color="primary" />
                <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
                  Пользователи
                </Typography>
              </Stack>

              <Typography color="text.secondary" variant="body2">
                Всего: {users.length}
              </Typography>
            </Stack>

            <Divider />

            {isLoading ? (
              <Box
                sx={{
                  minHeight: 260,
                  display: 'grid',
                  placeItems: 'center',
                  px: 2,
                  py: 6,
                }}
              >
                <Stack spacing={2} sx={{ alignItems: 'center' }}>
                  <CircularProgress />
                  <Typography color="text.secondary" variant="body2">
                    Загружаем пользователей
                  </Typography>
                </Stack>
              </Box>
            ) : users.length === 0 ? (
              <Box sx={{ px: { xs: 2, sm: 3 }, py: 6, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Пользователей пока нет
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Создайте первого пользователя на странице регистрации
                </Typography>
              </Box>
            ) : (
              <TableUsers users={users} onDeleteUser={setUserToDelete} />
            )}
          </Paper>
        </Stack>
      </Container>

      <ConfirmDialog
        open={Boolean(userToDelete)}
        title="Удалить пользователя?"
        prompt={
          userToDelete
            ? `Пользователь ${userToDelete.email} будет удален. Подтвердите действие.`
            : undefined
        }
        confirmText="Удалить"
        cancelText="Отмена"
        confirmColor="error"
        isLoading={isLoadingDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDeleteUser}
      />
    </Box>
  );
};
