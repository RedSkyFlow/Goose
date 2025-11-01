import React from 'react';
import type { Deal, Interaction, Company, Contact } from '../types';
import { GooseChat } from './GooseChat';
import { SparklesIcon } from './icons';

interface CoPilotProps {
  deal?: Deal;
  company?: Company;
  contact?: Contact;
  interactions: Interaction[];
}

export const CoPilot: React.FC<CoPilotProps> = ({ deal, company, contact, interactions }) => {
  return (
    <div className="bg-background-light p-4 rounded-lg mt-6">
      <h3 className="text-lg font-bold flex items-center mb-4">
        <SparklesIcon className="w-6 h-6 mr-2 text-secondary" />
        Goose
      </h3>
      <GooseChat 
        deal={deal} 
        company={company}
        contact={contact}
        interactions={interactions} 
      />
    </div>
  );
};