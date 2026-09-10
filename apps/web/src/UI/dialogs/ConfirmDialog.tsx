import {
  Button,
  type ButtonProps,
  CircularProgress,
  Dialog,
  type DialogProps,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useId } from 'react';
import type { ReactNode } from 'react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  prompt?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: ButtonProps['color'];
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  prompt,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  confirmColor = 'primary',
  isLoading = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) => {
  const titleId = useId();
  const promptId = useId();

  const handleClose: DialogProps['onClose'] = () => {
    if (isLoading) {
      return;
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby={titleId}
      aria-describedby={prompt ? promptId : undefined}
      aria-busy={isLoading}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>

      {prompt ? (
        <DialogContent>
          <DialogContentText id={promptId}>{prompt}</DialogContentText>
        </DialogContent>
      ) : null}

      <DialogActions>
        <Button disabled={isLoading} onClick={onClose}>
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress color="inherit" size={16} /> : undefined}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
