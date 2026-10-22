import { createListenerMiddleware } from '@reduxjs/toolkit';
import { authQuery } from '../store/features/auth';
import { authUnauthorized } from '../store/features/auth/authEvents';

export const authListener = createListenerMiddleware();

authListener.startListening({
  actionCreator: authUnauthorized,
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(authQuery.util.invalidateTags(['Auth']));
  },
});
