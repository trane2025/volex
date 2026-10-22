import { Box, IconButton, Stack, TextField, Typography } from '@mui/material';
import AttachFileRounded from '@mui/icons-material/AttachFileRounded';
import SendRounded from '@mui/icons-material/SendRounded';

export const MessageComposer = () => (
  <Box
    sx={{
      px: { xs: 1, md: 3 },
      py: 1.5,
      bgcolor: 'background.paper',
      borderTop: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <IconButton disabled aria-label="Прикрепить файл">
        <AttachFileRounded />
      </IconButton>
      <TextField
        disabled
        fullWidth
        multiline
        maxRows={4}
        size="small"
        placeholder="Сообщение…"
        slotProps={{ htmlInput: { 'aria-label': 'Текст сообщения' } }}
      />
      <IconButton
        disabled
        aria-label="Отправить сообщение"
        sx={{ bgcolor: 'action.selected', borderRadius: 2 }}
      >
        <SendRounded />
      </IconButton>
    </Stack>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block', textAlign: 'center', mt: 1 }}
    >
      Отправка сообщений скоро появится
    </Typography>
  </Box>
);
