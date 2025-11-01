import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { startApiMock } from './mocks/apiMock';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Start the mock API to intercept fetch calls in this development environment.
// In production, this line would be removed.
startApiMock();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <NotificationProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </NotificationProvider>
);