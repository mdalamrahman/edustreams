import { setSessionTokenProvider } from './lib/apiFetch';
import { supabase } from './lib/supabase';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppContextProvider } from './lib/AppContext';
import { AppRouter } from './AppRouter';
import './index.css';

setSessionTokenProvider(async () => (await supabase.auth.getSession()).data.session?.access_token);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <AppRouter />
      </AppContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
