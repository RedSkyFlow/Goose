import React from 'react';
import type { Deal, Interaction } from '../types';
import { HealthScore } from './HealthScore';
import { CoPilot } from './CoPilot';

interface RightSidebarProps {
  deal: Deal | null;
  interactions: Interaction[];
  setToastMessage: (message: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ deal, interactions, setToastMessage }) => {
  if (!deal) {
    return (
      <aside className="w-1/4 xl:w-1/5 bg-background-light p-6 border-l border-primary/50 flex items-center justify-center">
        <div className="text-center text-foreground/60">
          <p>Select a deal to see details</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-1/4 xl:w-1/5 bg-background-light p-6 border-l border-primary/50 overflow-y-auto">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      
      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground/90">Predictive Scoring</h3>
        <div className="flex justify-center bg-background/50 p-4 rounded-lg">
          <HealthScore 
            score={deal.ai_health_score} 
            label="Deal Health Score"
            history={deal.ai_health_score_history}
          />
        </div>
      </div>
      
      <CoPilot deal={deal} interactions={interactions} setToastMessage={setToastMessage} />

    </aside>
  );
};