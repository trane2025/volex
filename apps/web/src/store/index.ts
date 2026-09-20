import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { usersQuery } from './features/users';
import { authQuery } from './features/auth';

const rootReducer = combineReducers({
  [usersQuery.reducerPath]: usersQuery.reducer,
  [authQuery.reducerPath]: authQuery.reducer,
});

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(usersQuery.middleware, authQuery.middleware),
  });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
