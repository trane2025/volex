import { Alert, type AlertProps } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

type MessageAlertPlacement = 'inline' | 'form' | 'header';

interface MessageAlertProps {
  message?: ReactNode;
  severity?: AlertProps['severity'];
  placement?: MessageAlertPlacement;
}

const placementStyles: Record<MessageAlertPlacement, SxProps<Theme>> = {
  inline: {},
  form: { mb: 3 },
  header: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    mx: 'auto',
    maxWidth: 480,
    pointerEvents: 'auto',
  },
};

export const MessageAlert = ({
  message,
  severity = 'error',
  placement = 'inline',
}: MessageAlertProps) => {
  if (!message) {
    return null;
  }

  return (
    <Alert severity={severity} sx={placementStyles[placement]}>
      {message}
    </Alert>
  );
};
