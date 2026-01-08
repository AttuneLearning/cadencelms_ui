/**
 * Main App component
 * Sets up routing with BrowserRouter and providers
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router';
import { AppLayout } from '@/widgets/layout/AppLayout';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <AppRouter />
      </AppLayout>
    </BrowserRouter>
  );
};
