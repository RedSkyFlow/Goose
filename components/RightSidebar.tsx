
import React from 'react';
import type { Deal } from '../types';
import { HealthScore } from './HealthScore';
import { CoPilot } from './CoPilot';

interface RightSidebarProps {
  deal: Deal | null;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ deal }) => {
  if (!deal) {
    return (
      <aside className="w-1/4 xl:w-1/5 bg-brand-gray-800 p-6 border-l border-brand-gray-700 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Select a deal to see details</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-1/4 xl:w-1/5 bg-brand-gray-800 p-6 border-l border-brand-gray-700 overflow-y-auto">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-300">Predictive Scoring</h3>
        <div className="flex justify-around bg-brand-gray-900/50 p-4 rounded-lg">
          <HealthScore score={deal.health.deal} label="Deal Health" />
          <HealthScore score={deal.health.client} label="Client Health" />
        </div>
      </div>
      
      <CoPilot deal={deal} />

    </aside>
  );
};
