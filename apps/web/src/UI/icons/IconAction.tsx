import { IconButton, type IconButtonProps, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AppIcon, type AppIconName } from './AppIcon';

interface IconActionProps {
  icon: AppIconName;
  label: string;
  ariaLabel?: string;
  variant?: 'header' | 'table';
  active?: boolean;
  color?: IconButtonProps['color'];
  disabled?: boolean;
  onClick?: IconButtonProps['onClick'];
  to?: string;
}

export const IconAction = ({
  icon,
  label,
  ariaLabel = label,
  variant = 'table',
  active = false,
  color = 'inherit',
  disabled,
  onClick,
  to,
}: IconActionProps) => {
  const isHeader = variant === 'header';

  return (
    <Tooltip title={label}>
      <IconButton
        {...(to ? { component: RouterLink, to } : {})}
        aria-label={ariaLabel}
        color={active ? 'primary' : color}
        disabled={disabled}
        onClick={onClick}
        size={isHeader ? 'medium' : 'small'}
        sx={
          isHeader
            ? {
                width: 44,
                height: 44,
                border: '1px solid',
                borderColor: active ? 'primary.main' : 'divider',
                bgcolor: 'background.paper',
                boxShadow: 2,
                pointerEvents: 'auto',
                '&:hover': { bgcolor: 'action.hover' },
              }
            : undefined
        }
      >
        <AppIcon name={icon} fontSize={isHeader ? 'medium' : 'small'} />
      </IconButton>
    </Tooltip>
  );
};
