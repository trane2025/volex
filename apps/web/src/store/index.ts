import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { usersQuery } from './features/users';

const rootReducer = combineReducers({
  [usersQuery.reducerPath]: usersQuery.reducer,
});

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(usersQuery.middleware),
  });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
