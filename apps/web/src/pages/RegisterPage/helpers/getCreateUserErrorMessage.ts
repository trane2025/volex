export const getCreateUserErrorMessage = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('data' in error)) {
    return 'Не удалось создать пользователя';
  }

  const { data } = error;

  if (!data || typeof data !== 'object' || !('message' in data)) {
    return 'Не удалось создать пользователя';
  }

  const { message } = data;

  if (typeof message !== 'string' || message.trim().length === 0) {
    return 'Не удалось создать пользователя';
  }

  return message;
};
