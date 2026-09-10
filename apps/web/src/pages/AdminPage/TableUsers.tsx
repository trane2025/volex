import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import type { User } from '../../store/features/users/types.ts';

interface TableUsersProps {
  users: User[];
  onDeleteUser?: (user: User) => void;
}

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

export const TableUsers = ({ users, onDeleteUser }: TableUsersProps) => {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Имя</TableCell>
            <TableCell>Создан</TableCell>
            <TableCell>Обновлен</TableCell>
            <TableCell align="right">Действия</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{user.id}</TableCell>
              <TableCell sx={{ minWidth: 220 }}>{user.email}</TableCell>
              <TableCell sx={{ minWidth: 160 }}>{user.name ?? 'Без имени'}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(user.createdAt)}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(user.updatedAt)}</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                <Tooltip title="Удалить пользователя">
                  <IconButton
                    aria-label={`Удалить пользователя ${user.email}`}
                    color="error"
                    onClick={() => onDeleteUser?.(user)}
                    size="small"
                  >
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
