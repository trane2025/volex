import { TextField } from '@mui/material';
import {
  TextFieldsDialog,
  type TextFieldsDialogProps,
} from '../../UI/dialogs/TextFieldsDialog/TextFieldsDialog';

type EditProfileDialogProps = Pick<
  TextFieldsDialogProps<'name'>,
  'open' | 'onClose' | 'onSubmit' | 'isSubmitting' | 'errorText'
> & {
  name: string | null;
};

export const EditProfileDialog = ({ name, ...dialogProps }: EditProfileDialogProps) => (
  <TextFieldsDialog
    {...dialogProps}
    title="Изменить имя"
    description="Укажите, как вас называть. Имя можно оставить пустым."
    submitText="Сохранить"
  >
    <TextField
      name="name"
      label="Имя"
      defaultValue={name ?? ''}
      autoComplete="name"
      autoFocus
      fullWidth
      helperText="Это имя будет отображаться в вашем профиле."
    />
  </TextFieldsDialog>
);
