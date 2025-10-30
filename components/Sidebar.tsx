
import React from 'react';
import type { Deal } from '../types';

interface SidebarProps {
  deals: Deal[];
  selectedDeal: Deal | null;
  onSelectDeal: (deal: Deal) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ deals, selectedDeal, onSelectDeal }) => {
  return (
    <aside className="w-1/4 xl:w-1/5 bg-brand-gray-800 p-4 border-r border-brand-gray-700 overflow-y-auto">
      <div className="flex items-center mb-6">
        <div className="bg-brand-blue rounded-full h-8 w-8 flex items-center justify-center font-bold text-white text-lg mr-3">
          G
        </div>
        <h1 className="text-xl font-bold text-white">Project Goose</h1>
      </div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Deals</h2>
      <ul className="space-y-2">
        {deals.map((deal) => (
          <li key={deal.id}>
            <button
              onClick={() => onSelectDeal(deal)}
              className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                selectedDeal?.id === deal.id
                  ? 'bg-brand-blue text-white shadow-lg'
                  : 'bg-brand-gray-700 hover:bg-brand-gray-600 text-gray-200'
              }`}
            >
              <p className="font-semibold">{deal.name}</p>
              <p className="text-sm opacity-80">${deal.value.toLocaleString()} - {deal.stage}</p>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};
