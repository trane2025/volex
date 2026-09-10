import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { Provider } from 'react-redux';
import { setupStore } from './store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={setupStore()}>
      <App />
    </Provider>
  </StrictMode>,
);
