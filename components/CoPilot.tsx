import React from 'react';
import type { Deal, Interaction } from '../types';
import { GooseChat } from './GooseChat';
import { SparklesIcon } from './icons';

interface CoPilotProps {
  deal: Deal;
  interactions: Interaction[];
  setToastMessage: (message: string) => void;
}

export const CoPilot: React.FC<CoPilotProps> = ({ deal, interactions, setToastMessage }) => {
  return (
    <div className="bg-background-light p-4 rounded-lg mt-6">
      <h3 className="text-lg font-bold flex items-center mb-4">
        <SparklesIcon className="w-6 h-6 mr-2 text-secondary" />
        Goose
      </h3>
      <GooseChat 
        deal={deal} 
        interactions={interactions} 
        setToastMessage={setToastMessage}
      />
    </div>
  );
};