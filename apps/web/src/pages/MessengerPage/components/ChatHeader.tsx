import { Avatar, Box, Stack, Typography } from '@mui/material';

export const ChatHeader = () => (
  <Stack
    component="header"
    direction="row"
    spacing={1.5}
    sx={{
      alignItems: 'center',
      px: { xs: 2, md: 3 },
      py: 2,
      borderBottom: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
    }}
  >
    <Avatar sx={{ bgcolor: 'primary.main', width: 42, height: 42 }}>О</Avatar>
    <Box sx={{ minWidth: 0 }}>
      <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 700 }}>
        Общий чат
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Место для ваших разговоров
      </Typography>
    </Box>
  </Stack>
);
