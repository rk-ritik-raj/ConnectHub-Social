import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: 'dark:bg-neutral-900 dark:text-neutral-100 dark:border dark:border-neutral-800',
                style: {
                  borderRadius: '8px',
                  fontSize: '14px',
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
