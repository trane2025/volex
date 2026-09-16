import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  type DialogProps,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from '@mui/material';
import { useId } from 'react';
import type { ComponentProps, ReactNode } from 'react';

export type TextFieldsDialogValues<FieldName extends string = string> = Record<FieldName, string>;

export interface TextFieldsDialogProps<FieldName extends string = string> {
  open: boolean;
  title: string;
  cancelText?: string;
  children: ReactNode;
  description?: ReactNode;
  errorText?: ReactNode;
  isSubmitting?: boolean;
  maxWidth?: DialogProps['maxWidth'];
  submitText?: string;
  onClose: () => void;
  onSubmit: (values: TextFieldsDialogValues<FieldName>) => void | Promise<void>;
}

/**
 * Usage:
 *
 * <TextFieldsDialog
 *   open={Boolean(user)}
 *   title="Редактировать пользователя"
 *   onClose={handleClose}
 *   onSubmit={(values) => updateUser(values)}
 * >
 *   <TextField name="name" label="Имя" defaultValue={user.name} fullWidth />
 *   <TextField name="email" label="Email" defaultValue={user.email} fullWidth required />
 * </TextFieldsDialog>
 */
export const TextFieldsDialog = <FieldName extends string = string>({
  open,
  title,
  cancelText = 'Отмена',
  children,
  description,
  errorText,
  isSubmitting = false,
  maxWidth = 'xs',
  submitText = 'Сохранить',
  onClose,
  onSubmit,
}: TextFieldsDialogProps<FieldName>) => {
  const titleId = useId();
  const descriptionId = useId();

  const handleClose: DialogProps['onClose'] = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const values = {} as TextFieldsDialogValues<FieldName>;

    for (const [name, value] of formData.entries()) {
      if (typeof value !== 'string') {
        continue;
      }

      values[name as FieldName] = value;
    }

    void onSubmit(values);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={isSubmitting}
      fullWidth
      maxWidth={maxWidth}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle id={titleId}>{title}</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {description ? (
              <DialogContentText id={descriptionId}>{description}</DialogContentText>
            ) : null}

            {errorText ? <Alert severity="error">{errorText}</Alert> : null}

            <Box
              component="fieldset"
              disabled={isSubmitting}
              sx={{
                border: 0,
                display: 'contents',
                m: 0,
                p: 0,
              }}
            >
              {children}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button disabled={isSubmitting} onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress color="inherit" size={16} /> : undefined}
          >
            {submitText}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
