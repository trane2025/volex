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
  TextField,
  Typography,
} from '@mui/material';
import { ConfirmDialog } from '../../UI/dialogs/ConfirmDialog.tsx';
import { TextFieldsDialog, type TextFieldsDialogValues } from '../../UI/dialogs/TextFieldsDialog';
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from '../../store/features/users';
import type { User } from '../../store/features/users/types.ts';
import { TableUsers } from './TableUsers.tsx';
import { getUpdateUserErrorMessage } from './helpers/getUpdateUserErrorMessage.ts';

type EditUserField = 'email' | 'name';

export const AdminPage = () => {
  const {
    data: users = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetUsersQuery(undefined, {
    pollingInterval: 5000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteUser, { isLoading: isLoadingDelete }] = useDeleteUserMutation();

  const handleCloseDeleteDialog = () => {
    setUserToDelete(null);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      await deleteUser(userToDelete.id).unwrap();
      setUserToDelete(null);
    } catch (error) {
      console.error('Не удалось удалить пользователя', error);
    }
  };

  const [updateUser, { isLoading: isLoadingUpdate }] = useUpdateUserMutation();
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editUserErrorMessage, setEditUserErrorMessage] = useState('');

  const handleOpenEditUser = (user: User) => {
    setUserToEdit(user);
    setEditUserErrorMessage('');
  };

  const handleCloseEditDialog = () => {
    setUserToEdit(null);
    setEditUserErrorMessage('');
  };

  const handleSubmitEditUser = async (values: TextFieldsDialogValues<EditUserField>) => {
    if (!userToEdit) {
      return;
    }

    const email = values.email.trim();
    const name = values.name.trim();

    if (email.length === 0) {
      setEditUserErrorMessage('Email обязателен');
      return;
    }

    setEditUserErrorMessage('');

    try {
      await updateUser({
        id: userToEdit.id,
        body: {
          email,
          name: name.length > 0 ? name : undefined,
        },
      }).unwrap();
      setUserToEdit(null);
    } catch (error) {
      setEditUserErrorMessage(getUpdateUserErrorMessage(error));
    }
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
                startIcon={
                  isFetching ? (
                    <CircularProgress color="inherit" size={16} />
                  ) : (
                    <RefreshRoundedIcon />
                  )
                }
                disabled={isFetching}
                onClick={refetch}
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
              <TableUsers
                users={users}
                onDeleteUser={setUserToDelete}
                onEditUser={handleOpenEditUser}
              />
            )}
          </Paper>
        </Stack>
      </Container>

      {userToEdit ? (
        <TextFieldsDialog
          open={Boolean(userToEdit)}
          title="Редактировать пользователя"
          description={`Обновите данные пользователя ${userToEdit.email}`}
          errorText={editUserErrorMessage}
          isSubmitting={isLoadingUpdate}
          submitText="Сохранить"
          onClose={handleCloseEditDialog}
          onSubmit={handleSubmitEditUser}
        >
          <TextField
            sx={{ marginTop: 3 }}
            name="name"
            label="Имя"
            defaultValue={userToEdit.name ?? ''}
            autoComplete="name"
            autoFocus
            fullWidth
          />
          <TextField
            sx={{ marginTop: 3 }}
            name="email"
            label="Email"
            type="email"
            defaultValue={userToEdit.email}
            autoComplete="email"
            required
            fullWidth
          />
        </TextFieldsDialog>
      ) : null}

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
