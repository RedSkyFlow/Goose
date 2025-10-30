import React from 'react';
import type { Interaction } from '../types';
import { TimelineItem } from './TimelineItem';

interface TimelineProps {
  interactions: Interaction[];
  isLoading: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ interactions, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
        <div className="text-center py-16 text-foreground/60">
            <p>No interactions found for this deal.</p>
        </div>
    )
  }

  return (
    <div className="mt-6">
      {interactions.map((interaction, index) => (
        <TimelineItem 
          key={interaction.interaction_id} 
          interaction={interaction} 
          isLast={index === interactions.length - 1} 
        />
      ))}
    </div>
  );
};
