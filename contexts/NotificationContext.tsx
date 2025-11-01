import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

interface ToastMessage {
  id: number;
  message: string;
}

interface NotificationContextType {
  showToast: (message: string) => void;
  toast: ToastMessage | null;
  closeToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000); // Hide after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = useCallback((message: string) => {
    setToast({ message, id: Date.now() });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast, toast, closeToast }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
