import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppContextProvider } from './lib/AppContext';
import { AppRouter } from './AppRouter';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <AppRouter />
      </AppContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
