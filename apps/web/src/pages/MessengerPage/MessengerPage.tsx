import { Box, Paper } from '@mui/material';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { MessageComposer } from './components/MessageComposer';
import { useEffect, useState } from 'react';
import { socket } from '../../socket';
import { useDispatch } from 'react-redux';
import { refreshAccessToken } from '../../store/features/auth/authSession';
import { authUnauthorized } from '../../store/features/auth/authEvents';

export const MessengerPage = () => {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = (reason: string) => {
      setIsConnected(false);
      console.log('Socket disconnected:', reason);
    };

    const restoreConnection = async () => {
      const result = await refreshAccessToken();
      if (!active) return;

      if (result === 'refreshed') {
        socket.connect();
      } else if (result === 'unauthorized') {
        dispatch(authUnauthorized());
      } else {
        retryTimer = setTimeout(() => void restoreConnection(), 5000);
      }
    };

    const handleConnectError = (error: Error & { data?: { code?: string } }) => {
      setIsConnected(false);
      console.error('Socket connection error:', error.message);

      if (error.data?.code === 'UNAUTHORIZED') {
        void restoreConnection();
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    socket.connect();

    return () => {
      active = false;
      clearTimeout(retryTimer);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);

      socket.disconnect();
    };
  }, [dispatch]);

  return (
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
          <ChatHeader isConnected={isConnected} />
          <MessageList />
          <MessageComposer />
        </Box>
      </Paper>
    </Box>
  );
};
