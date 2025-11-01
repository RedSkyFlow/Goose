import React from 'react';
import type { Deal, Interaction } from '../types';
import { GooseChat } from './GooseChat';
import { SparklesIcon, CloseIcon } from './icons';

interface GooseChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    setToastMessage: (message: string) => void;
}

export const GooseChatModal: React.FC<GooseChatModalProps> = ({ 
    isOpen, 
    onClose, 
    setToastMessage
}) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-background-light rounded-lg shadow-2xl w-full max-w-2xl border border-primary/50 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-primary/50">
                    <h3 className="text-lg font-bold flex items-center">
                        <SparklesIcon className="w-6 h-6 mr-2 text-secondary" />
                        Chat with Goose
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-primary/20 transition-colors"
                        aria-label="Close chat"
                    >
                        <CloseIcon className="w-5 h-5 text-foreground/80" />
                    </button>
                </div>
                <div className="p-4">
                    <GooseChat
                        setToastMessage={setToastMessage}
                    />
                </div>
            </div>
        </div>
    );
};