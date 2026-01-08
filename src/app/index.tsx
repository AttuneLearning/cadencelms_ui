/**
 * Main App component
 * Sets up routing with BrowserRouter and providers
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router';
import { Toaster } from '@/shared/ui/toaster';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster />
    </BrowserRouter>
  );
};
