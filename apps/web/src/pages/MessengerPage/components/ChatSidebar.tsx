import { Avatar, Box, Chip, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import SearchRounded from '@mui/icons-material/SearchRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';

export const ChatSidebar = () => (
  <Box
    component="aside"
    aria-label="Список чатов"
    sx={{
      width: { xs: 76, md: 320 },
      flexShrink: 0,
      borderRight: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
      overflowY: 'auto',
    }}
  >
    <Stack spacing={2.5} sx={{ p: { xs: 1.5, md: 3 } }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          component="h1"
          variant="h5"
          sx={{ fontWeight: 800, letterSpacing: '-0.04em', display: { xs: 'none', md: 'block' } }}
        >
          Volex
        </Typography>
        <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          <ForumRounded />
        </Avatar>
      </Stack>
      <TextField
        disabled
        placeholder="Поиск чатов"
        size="small"
        fullWidth
        sx={{ display: { xs: 'none', md: 'block' } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', display: { xs: 'none', md: 'flex' } }}
      >
        <Typography variant="subtitle2">Все чаты</Typography>
        <Chip label="1" size="small" sx={{ height: 22 }} />
      </Stack>
    </Stack>
    <Stack
      direction="row"
      spacing={1.5}
      aria-label="Общий чат, выбран"
      sx={{
        alignItems: 'center',
        mx: 1,
        p: 1,
        borderRadius: 2,
        bgcolor: 'action.selected',
        minHeight: 72,
      }}
    >
      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>О</Avatar>
      <Box sx={{ minWidth: 0, display: { xs: 'none', md: 'block' } }}>
        <Typography variant="subtitle2">Общий чат</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          Здесь начинается общение
        </Typography>
      </Box>
    </Stack>
  </Box>
);
