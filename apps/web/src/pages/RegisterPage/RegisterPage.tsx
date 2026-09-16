import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { type SubmitEventHandler, useState } from 'react';
import { useCreateUserMutation } from '../../store/features/users';
import { getCreateUserErrorMessage } from './helpers/getCreateUserErrorMessage.ts';

export const RegisterPage = () => {
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const onSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (trimmedEmail.length === 0) {
      setErrorMessage('Email обязателен');
      setSuccessMessage('');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      const createdUser = await createUser({
        email: trimmedEmail,
        ...(trimmedName ? { name: trimmedName } : {}),
      }).unwrap();

      setSuccessMessage(`Пользователь ${createdUser.email} создан`);
      setEmail('');
      setName('');
    } catch (error) {
      setErrorMessage(getCreateUserErrorMessage(error));
    }
  };

  return (
    <Box
      onSubmit={onSubmit}
      component="form"
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
        px: 2,
        py: { xs: 8, sm: 2 },
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: { xs: 3, sm: 4 },
          }}
        >
          <Stack spacing={3}>
            <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PersonAddAltRoundedIcon />
              </Avatar>

              <Box sx={{ textAlign: 'center' }}>
                <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
                  Регистрация в Volex
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Создайте новый аккаунт
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={2.5}>
              {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
              {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

              <TextField
                value={name}
                onChange={(e) => setName(e.target?.value ?? '')}
                label="Имя"
                name="name"
                autoComplete="name"
                disabled={isCreatingUser}
                fullWidth
              />

              <TextField
                value={email}
                onChange={(e) => setEmail(e.target.value ?? '')}
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                disabled={isCreatingUser}
                fullWidth
                required
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isCreatingUser}
                startIcon={<PersonAddAltRoundedIcon />}
              >
                {isCreatingUser ? 'Создаем...' : 'Зарегистрироваться'}
              </Button>
            </Stack>

            <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center' }}>
              Уже есть аккаунт?{' '}
              <MuiLink component={RouterLink} to="/login" underline="hover">
                Войти
              </MuiLink>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
