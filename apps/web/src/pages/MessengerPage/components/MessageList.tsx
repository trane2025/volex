import { Box, Stack, Typography } from '@mui/material';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import { alpha } from '@mui/material/styles';

export const MessageList = () => (
  <Box
    component="section"
    aria-label="История сообщений"
    sx={{
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'grid',
      placeItems: 'center',
      p: { xs: 2, md: 4 },
      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.035),
      backgroundImage: (theme) =>
        `radial-gradient(${alpha(theme.palette.primary.main, 0.1)} 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }}
  >
    <Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 320, textAlign: 'center' }}>
      <Box
        sx={{
          width: 76,
          height: 76,
          borderRadius: 6,
          display: 'grid',
          placeItems: 'center',
          color: 'primary.main',
          bgcolor: 'background.paper',
          boxShadow: 1,
        }}
      >
        <ChatBubbleOutlineRounded sx={{ fontSize: 34 }} />
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Начало новой истории
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Здесь появятся сообщения общего чата.
        </Typography>
      </Box>
    </Stack>
  </Box>
);
