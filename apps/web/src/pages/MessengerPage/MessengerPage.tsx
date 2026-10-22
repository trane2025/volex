import { Box, Paper } from '@mui/material';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { MessageComposer } from './components/MessageComposer';

export const MessengerPage = () => (
  <Box
    sx={{
      height: '100dvh',
      pt: { xs: '72px', sm: '80px' },
      pb: { xs: 0, sm: 2 },
      px: { xs: 0, sm: 2 },
    }}
  >
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        height: '100%',
        maxWidth: 1440,
        mx: 'auto',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: { xs: 0, sm: 3 },
      }}
    >
      <ChatSidebar />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <ChatHeader />
        <MessageList />
        <MessageComposer />
      </Box>
    </Paper>
  </Box>
);
