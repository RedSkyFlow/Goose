import React, { ReactNode } from 'react';
import { CloseIcon } from './icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-background-light rounded-lg shadow-2xl w-full max-w-lg border border-primary/50 flex flex-col animate-fade-in-down"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-primary/50">
                    <h3 className="text-lg font-bold text-foreground">
                        {title}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-primary/20 transition-colors"
                        aria-label="Close modal"
                    >
                        <CloseIcon className="w-5 h-5 text-foreground/80" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};