import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import PersonOutlineRounded from '@mui/icons-material/PersonOutlineRounded';
import AdminPanelSettingsRounded from '@mui/icons-material/AdminPanelSettingsRounded';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import LockOutlined from '@mui/icons-material/LockOutlined';
import LoginRounded from '@mui/icons-material/LoginRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import PeopleAltRounded from '@mui/icons-material/PeopleAltRounded';
import PersonAddAltRounded from '@mui/icons-material/PersonAddAltRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import type { SvgIconProps } from '@mui/material';

const icons = {
  chat: ChatBubbleOutlineRounded,
  profile: PersonOutlineRounded,
  admin: AdminPanelSettingsRounded,
  darkMode: DarkModeRounded,
  delete: DeleteRounded,
  edit: EditRounded,
  lightMode: LightModeRounded,
  lock: LockOutlined,
  login: LoginRounded,
  logout: LogoutRounded,
  users: PeopleAltRounded,
  register: PersonAddAltRounded,
  refresh: RefreshRounded,
};

export type AppIconName = keyof typeof icons;

interface AppIconProps {
  name: AppIconName;
  color?: SvgIconProps['color'];
  fontSize?: SvgIconProps['fontSize'];
}

export const AppIcon = ({ name, ...props }: AppIconProps) => {
  const Icon = icons[name];
  return <Icon {...props} />;
};
