import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {BrowserRouter} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { Route, Routes } from 'react-router-dom';

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     <QueryClientProvider client={queryClient}>
     <BrowserRouter>
          <App />
      </BrowserRouter>
      </QueryClientProvider>
  </React.StrictMode>
);

