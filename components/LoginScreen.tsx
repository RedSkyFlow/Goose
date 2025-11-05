import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleIcon } from './icons';

export const LoginScreen: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center p-8 bg-background-light rounded-lg shadow-2xl border border-primary/50">
        <div className="flex items-center justify-center mb-6">
            <img src="/Goose_logo.png" alt="Goose OS Logo" className="h-12 w-12 mr-4" />
            <h1 className="text-3xl font-bold text-foreground">Project Goose</h1>
        </div>
        <p className="text-foreground/80 mb-8">Your AI-Powered Business Co-Pilot</p>
        <button
          onClick={signIn}
          className="flex items-center justify-center w-full px-4 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200"
        >
          <GoogleIcon className="w-6 h-6 mr-3" />
          Sign in with Google
        </button>
        <p className="text-xs text-foreground/50 mt-4">
            Authorized for @flownetworks.co.za accounts only.
        </p>
      </div>
    </div>
  );
};