import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogoutIcon } from './icons';

export const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-white mr-3">
          {user.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{user.name}</p>
          <p className="text-xs text-foreground/70">{user.email}</p>
        </div>
      </div>
      <button 
        onClick={signOut} 
        className="p-2 rounded-full hover:bg-primary/20 text-foreground/80 transition-colors"
        aria-label="Sign out"
      >
        <LogoutIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
