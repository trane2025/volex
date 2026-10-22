import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { useGetMeQuery, useUpdateMeMutation } from '../../store/features/auth';
import { AppIcon } from '../../UI/icons/AppIcon';
import { IconBadge } from '../../UI/icons/IconBadge';
import { useState } from 'react';
import { EditProfileDialog } from './EditProfileDialog.tsx';
import type { TextFieldsDialogValues } from '../../UI/dialogs/TextFieldsDialog';

export const ProfilePage = () => {
  const { data: user } = useGetMeQuery();
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (values: TextFieldsDialogValues<'name'>) => {
    setErrorMessage('');
    try {
      await updateMe({ name: values.name }).unwrap();
      setIsEditOpen(false);
    } catch {
      setErrorMessage('Не удалось сохранить имя. Попробуйте ещё раз.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', px: 2, py: { xs: 10, sm: 12 } }}>
      <Container maxWidth="md" disableGutters>
        <Stack spacing={3}>
          <Box>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
              Профиль
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Ваш профиль в Volex
            </Typography>
          </Box>

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
              spacing={3}
              sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', minWidth: 0 }}>
                <IconBadge name="users" />
                <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                  <Typography variant="overline" color="text.secondary">
                    Мой профиль
                  </Typography>
                  <Typography component="h2" variant="h6">
                    {user?.name ?? 'Имя не указано'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Stack>

              <Button
                disabled={!user}
                onClick={() => {
                  setErrorMessage('');
                  setIsEditOpen(true);
                }}
                variant="outlined"
                startIcon={<AppIcon name="edit" />}
                sx={{ flexShrink: 0 }}
              >
                Изменить имя
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Container>
      {isEditOpen && user && (
        <EditProfileDialog
          name={user.name}
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSubmit={onSubmit}
          errorText={errorMessage}
          isSubmitting={isUpdating}
        />
      )}
    </Box>
  );
};
