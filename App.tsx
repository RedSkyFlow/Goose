import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { GooseOS } from './components/GooseOS';

function App() {
  const { user } = useAuth();

  return user ? <GooseOS /> : <LoginScreen />;
}

export default App;