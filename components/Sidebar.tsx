import React from 'react';
import type { Deal } from '../types';
import { DealStage } from '../types';
import { UserProfile } from './UserProfile';
import { SearchIcon, FireIcon, ExclamationTriangleIcon, ThumbsUpIcon, ProposalIcon, UsersIcon } from './icons';

interface SidebarProps {
  deals: Deal[];
  selectedDeal: Deal | null;
  onSelectDeal: (deal: Deal) => void;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeFilter: DealStage | 'All';
  onFilterChange: (stage: DealStage | 'All') => void;
}

const SidebarSkeleton: React.FC = () => (
    <div className="space-y-2 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full h-[76px] bg-primary/10 rounded-lg" />
        ))}
    </div>
);

const stageFilters = [
    { id: DealStage.PROSPECTING, label: 'Prospecting', icon: <SearchIcon className="w-4 h-4 mr-1.5" /> },
    { id: DealStage.QUALIFYING, label: 'Qualifying', icon: <ThumbsUpIcon className="w-4 h-4 mr-1.5" /> },
    { id: DealStage.PROPOSAL, label: 'Proposal', icon: <ProposalIcon className="w-4 h-4 mr-1.5" /> },
    { id: DealStage.NEGOTIATION, label: 'Negotiation', icon: <UsersIcon className="w-4 h-4 mr-1.5" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
    deals, 
    selectedDeal, 
    onSelectDeal, 
    isLoading,
    searchTerm,
    onSearchChange,
    activeFilter,
    onFilterChange
}) => {
  const isRecent = (timestamp?: string) => {
    if (!timestamp) return false;
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return new Date(timestamp) > threeDaysAgo;
  };

  return (
    <aside className="w-full max-w-xs xl:max-w-sm bg-background-light p-4 border-r border-primary/50 flex flex-col">
      <div>
        <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-3 mt-2">Active Deals</h2>
        
        <div className="mb-4 space-y-3">
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
                <input
                    type="text"
                    placeholder="Search deals..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-background text-foreground placeholder-foreground/50 pl-10 pr-4 py-2 rounded-md border border-primary/50 focus:ring-2 focus:ring-secondary focus:outline-none"
                    aria-label="Search deals"
                />
            </div>
            <div className="flex flex-wrap gap-2">
                 <button
                    onClick={() => onFilterChange('All')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        activeFilter === 'All'
                            ? 'bg-secondary text-white'
                            : 'bg-primary/20 text-foreground/80 hover:bg-primary/40'
                    }`}
                >
                    All
                </button>
                {stageFilters.map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center ${
                            activeFilter === filter.id
                                ? 'bg-secondary text-white'
                                : 'bg-primary/20 text-foreground/80 hover:bg-primary/40'
                        }`}
                    >
                        {filter.icon}
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {isLoading ? <SidebarSkeleton /> : (
          deals.length > 0 ? (
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
                        <div className="flex justify-between items-start">
                            <p className="font-semibold pr-2">{deal.deal_name}</p>
                            <div className="flex items-center space-x-2 flex-shrink-0 mt-0.5">
                                {isRecent(deal.last_interaction_at) && (
                                    <span 
                                        className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                                            selectedDeal?.deal_id === deal.deal_id ? 'bg-white' : 'bg-secondary'
                                        }`}
                                        title="Recent Activity"
                                    ></span>
                                )}
                                {deal.ai_health_score > 80 && (
                                    <FireIcon className="w-4 h-4 text-accent" title="Hot Deal" />
                                )}
                                {deal.ai_health_score < 50 && (
                                    <ExclamationTriangleIcon className="w-4 h-4 text-red-400" title="Needs Attention" />
                                )}
                            </div>
                        </div>
                        <p className={`text-sm mt-1 ${selectedDeal?.deal_id === deal.deal_id ? 'opacity-90' : 'opacity-80'}`}>
                            ${deal.value.toLocaleString()} - {deal.stage}
                        </p>
                    </button>
                </li>
                ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-foreground/60">
                <p>No deals match your criteria.</p>
            </div>
          )
        )}
      </div>
      <div className="mt-auto pt-4 border-t border-primary/50">
        <UserProfile />
      </div>
    </aside>
  );
};