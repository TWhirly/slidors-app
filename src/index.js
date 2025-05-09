import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {BrowserRouter} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { Route, Routes } from 'react-router-dom';

// if (process.env.NODE_ENV === 'development') {
//   import('react-devtools-core').then(({ connectToDevTools }) => {
//     connectToDevTools({
//       host: 'localhost', // Ensure this matches your development environment
//       port: 8097,        // Default port for React DevTools
//       resolveSourceMaps: false, // Disable source map resolution
//     });
//   });
// }

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

