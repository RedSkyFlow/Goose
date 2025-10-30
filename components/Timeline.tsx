
import React from 'react';
import type { TimelineEvent } from '../types';
import { TimelineItem } from './TimelineItem';

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div className="mt-6">
      {events.map((event, index) => (
        <TimelineItem 
          key={event.id} 
          event={event} 
          isLast={index === events.length - 1} 
        />
      ))}
    </div>
  );
};
