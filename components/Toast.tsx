import React from 'react';
import { CheckCircleIcon, CloseIcon } from './icons';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, show, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center w-full max-w-xs p-4 text-foreground bg-background-light rounded-lg shadow-lg border border-primary/50 animate-fade-in-down"
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-secondary bg-primary/20 rounded-lg">
        <CheckCircleIcon className="w-5 h-5" />
      </div>
      <div className="ms-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 bg-background-light text-foreground/70 hover:text-foreground rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-primary/20 inline-flex items-center justify-center h-8 w-8"
        onClick={onClose}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
