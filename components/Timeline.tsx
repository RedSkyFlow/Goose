import React from 'react';
import type { Interaction } from '../types';
import { TimelineItem } from './TimelineItem';

interface TimelineProps {
  interactions: Interaction[];
}

export const Timeline: React.FC<TimelineProps> = ({ interactions }) => {
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
