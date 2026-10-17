import { IconAction } from '../../UI/icons/IconAction';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import type { User } from '../../store/features/users/types.ts';

interface TableUsersProps {
  users: User[];
  onDeleteUser?: (user: User) => void;
  onEditUser?: (user: User) => void;
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

export const TableUsers = ({ users, onDeleteUser, onEditUser }: TableUsersProps) => {
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
                <IconAction
                  icon="edit"
                  label="Редактировать пользователя"
                  ariaLabel={`Редактировать пользователя ${user.email}`}
                  color="primary"
                  onClick={() => onEditUser?.(user)}
                />
                <IconAction
                  icon="delete"
                  label="Удалить пользователя"
                  ariaLabel={`Удалить пользователя ${user.email}`}
                  color="error"
                  onClick={() => onDeleteUser?.(user)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
