export const getLoginErrorMessage = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('data' in error)) {
    return 'Не удалось войти';
  }

  const { data } = error;

  if (!data || typeof data !== 'object' || !('message' in data)) {
    return 'Не удалось войти';
  }

  const { message } = data;

  if (typeof message !== 'string' || message.trim().length === 0) {
    return 'Не удалось войти';
  }

  return message;
};
