export const getUpdateUserErrorMessage = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('data' in error)) {
    return 'Не удалось обновить пользователя';
  }

  const { data } = error;

  if (!data || typeof data !== 'object' || !('message' in data)) {
    return 'Не удалось обновить пользователя';
  }

  const { message } = data;

  if (typeof message !== 'string' || message.trim().length === 0) {
    return 'Не удалось обновить пользователя';
  }

  return message;
};
