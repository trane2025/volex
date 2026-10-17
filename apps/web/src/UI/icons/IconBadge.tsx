import { Avatar } from '@mui/material';
import { AppIcon, type AppIconName } from './AppIcon';

export const IconBadge = ({ name }: { name: AppIconName }) => (
  <Avatar sx={{ bgcolor: 'primary.main' }}>
    <AppIcon name={name} />
  </Avatar>
);
