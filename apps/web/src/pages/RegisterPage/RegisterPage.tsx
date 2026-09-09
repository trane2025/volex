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
import { ApiError, usersApi } from '../../api';

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (trimmedEmail.length === 0) {
      setErrorMessage('Email обязателен');
      setSuccessMessage('');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const createdUser = await usersApi.create({
        email: trimmedEmail,
        ...(trimmedName ? { name: trimmedName } : {}),
      });

      setSuccessMessage(`Пользователь ${createdUser.email} создан`);
      setEmail('');
      setName('');
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage('Не удалось создать пользователя');
    } finally {
      setIsSubmitting(false);
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
                disabled={isSubmitting}
                fullWidth
              />

              <TextField
                value={email}
                onChange={(e) => setEmail(e.target.value ?? '')}
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                fullWidth
                required
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                startIcon={<PersonAddAltRoundedIcon />}
              >
                {isSubmitting ? 'Создаем...' : 'Зарегистрироваться'}
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
