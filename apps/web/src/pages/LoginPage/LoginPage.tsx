import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const LoginPage = () => {
  return (
    <Box
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
                <LockOutlinedIcon />
              </Avatar>

              <Box sx={{ textAlign: 'center' }}>
                <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
                  Вход в Volex
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Введите данные аккаунта
                </Typography>
              </Box>
            </Stack>

            <Box
              component="form"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <Stack spacing={2.5}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  fullWidth
                  required
                />

                <TextField
                  label="Пароль"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  fullWidth
                  required
                />

                <FormControlLabel control={<Checkbox name="remember" />} label="Запомнить меня" />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<LoginRoundedIcon />}
                >
                  Войти
                </Button>
              </Stack>
            </Box>

            <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center' }}>
              Нет аккаунта?{' '}
              <MuiLink component={RouterLink} to="/register" underline="hover">
                Зарегистрироваться
              </MuiLink>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
