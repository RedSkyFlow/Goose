import React from 'react';
import { SparklesIcon } from './icons';

interface FloatingGooseButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export const FloatingGooseButton: React.FC<FloatingGooseButtonProps> = ({ onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-secondary rounded-full text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-secondary/50 disabled:bg-secondary/50 disabled:cursor-not-allowed disabled:transform-none"
            aria-label="Open Goose AI Assistant"
            title="Chat with Goose"
        >
            <SparklesIcon className="w-7 h-7" />
        </button>
    )
}