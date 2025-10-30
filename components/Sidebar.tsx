import React from 'react';
import type { Deal } from '../types';

interface SidebarProps {
  deals: Deal[];
  selectedDeal: Deal | null;
  onSelectDeal: (deal: Deal) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ deals, selectedDeal, onSelectDeal }) => {
  return (
    <aside className="w-1/4 xl:w-1/5 bg-background-light p-4 border-r border-primary/50 overflow-y-auto">
      <div className="flex items-center mb-6">
        <div className="bg-secondary rounded-full h-8 w-8 flex items-center justify-center font-bold text-background text-lg mr-3">
          G
        </div>
        <h1 className="text-xl font-bold text-foreground">Project Goose</h1>
      </div>
      <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-3">Active Deals</h2>
      <ul className="space-y-2">
        {deals.map((deal) => (
          <li key={deal.deal_id}>
            <button
              onClick={() => onSelectDeal(deal)}
              className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                selectedDeal?.deal_id === deal.deal_id
                  ? 'bg-secondary text-white shadow-lg'
                  : 'hover:bg-primary/20 text-foreground'
              }`}
            >
              <p className="font-semibold">{deal.deal_name}</p>
              <p className="text-sm opacity-80">${deal.value.toLocaleString()} - {deal.stage}</p>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};
