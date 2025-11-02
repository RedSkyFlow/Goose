import React, { useState, useMemo } from 'react';
import type { Deal, Interaction, Company } from '../types';
import { InteractionType, Sentiment } from '../types';
import { Timeline } from './Timeline';
import { generateProposal } from '../services/geminiService';
import { ProposalIcon, RefreshIcon, SparklesIcon, FilterIcon, ThumbsUpIcon, ThumbsDownIcon } from './icons';
import type { Hub } from './MainNavbar';

interface MainContentProps {
  deal: Deal | null;
  company?: Company | null;
  interactions: Interaction[];
  isLoadingInteractions: boolean;
  onRefresh: () => void;
  onNavigate?: (hub: Hub, itemId: string) => void;
}

export const MainContent: React.FC<MainContentProps> = ({ deal, company, interactions, isLoadingInteractions, onRefresh, onNavigate }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedProposalId, setGeneratedProposalId] = useState<string | null>(null);
    const [filters, setFilters] = useState<{ types: Set<InteractionType>, sentiments: Set<Sentiment> }>({
        types: new Set(),
        sentiments: new Set(),
    });

    const handleGenerateProposal = async () => {
        if (!deal) return;
        setIsGenerating(true);
        const proposalId = await generateProposal(deal, interactions);
        setGeneratedProposalId(proposalId);
        setIsGenerating(false);
    }

    // FIX: Refactored to handle TypeScript's inability to discriminate the Set type from a dynamic key.
    // By splitting the logic, we ensure type safety for both 'types' and 'sentiments' sets.
    const handleFilterToggle = (category: 'types' | 'sentiments', value: InteractionType | Sentiment) => {
        setFilters(prevFilters => {
            if (category === 'types') {
                const newSet = new Set(prevFilters.types);
                const typeValue = value as InteractionType;
                if (newSet.has(typeValue)) {
                    newSet.delete(typeValue);
                } else {
                    newSet.add(typeValue);
                }
                return { ...prevFilters, types: newSet };
            } else {
                const newSet = new Set(prevFilters.sentiments);
                const sentimentValue = value as Sentiment;
                if (newSet.has(sentimentValue)) {
                    newSet.delete(sentimentValue);
                } else {
                    newSet.add(sentimentValue);
                }
                return { ...prevFilters, sentiments: newSet };
            }
        });
    };

    const filteredInteractions = useMemo(() => {
        const { types, sentiments } = filters;
        if (types.size === 0 && sentiments.size === 0) {
            return interactions;
        }
        return interactions.filter(i => {
            const typeMatch = types.size === 0 || types.has(i.type);
            const sentimentMatch = sentiments.size === 0 || (i.ai_sentiment && sentiments.has(i.ai_sentiment));
            return typeMatch && sentimentMatch;
        });
    }, [interactions, filters]);

    const typeFilterOptions = [
        { id: InteractionType.EMAIL, label: 'Email' },
        { id: InteractionType.MEETING, label: 'Meeting' },
        { id: InteractionType.CALL_LOG, label: 'Call' },
        { id: InteractionType.NOTE, label: 'Note' },
    ];

    const sentimentFilterOptions = [
        { id: Sentiment.POSITIVE, label: 'Positive', icon: <ThumbsUpIcon className="w-4 h-4 mr-1.5" /> },
        { id: Sentiment.NEGATIVE, label: 'Negative', icon: <ThumbsDownIcon className="w-4 h-4 mr-1.5" /> },
    ];


  if (!deal) {
    return (
      <main className="flex-1 bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground/80">Welcome to Project Goose</h2>
          <p className="text-foreground/60 mt-2">Select a deal from the left to view its timeline and insights.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{deal.deal_name}</h2>
          {company && onNavigate ? (
              <button onClick={() => onNavigate('Companies', company.company_id)} className="text-left">
                  <p className="text-secondary hover:underline text-lg">{company.name}</p>
              </button>
          ) : company ? (
              <p className="text-foreground/80 text-lg">{company.name}</p>
          ) : null}
          <p className="text-foreground/80">
            ${deal.value.toLocaleString()} | {deal.stage}
          </p>
        </div>
        
        {generatedProposalId ? (
             <a
                href={`/?proposal_id=${generatedProposalId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent hover:opacity-90 text-background font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-200"
            >
                <ProposalIcon className="w-5 h-5 mr-2" />
                View Proposal
            </a>
        ) : (
            <button
                onClick={handleGenerateProposal}
                disabled={isGenerating || interactions.length === 0}
                className="bg-secondary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-200 disabled:bg-secondary/50 disabled:cursor-not-allowed"
                title="Uses AI to analyze the timeline and draft a starting proposal."
            >
                 {isGenerating ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating...
                    </>
                 ) : (
                    <>
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Generate Proposal
                    </>
                 )}
            </button>
        )}
      </div>

      <div className="flex justify-between items-center border-b border-primary/50 pb-2 mb-4">
        <h3 className="text-xl font-semibold text-foreground/90">
            Customer Timeline
        </h3>
        <button 
            onClick={onRefresh} 
            className="p-1.5 rounded-full hover:bg-primary/20 transition-colors"
            aria-label="Refresh timeline"
            title="Refresh timeline"
        >
            <RefreshIcon className="w-5 h-5 text-foreground/80" />
        </button>
      </div>

      <div className="bg-background-light/50 p-3 rounded-lg mb-4 space-y-2">
            <div className="flex items-center text-sm font-semibold text-foreground/80 mb-2">
                <FilterIcon className="w-4 h-4 mr-2" />
                Filter by
            </div>
            <div className="flex flex-wrap gap-2">
                {typeFilterOptions.map(option => (
                    <button
                        key={option.id}
                        onClick={() => handleFilterToggle('types', option.id)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors flex items-center ${
                            filters.types.has(option.id)
                                ? 'bg-secondary text-white'
                                : 'bg-primary/20 text-foreground/80 hover:bg-primary/40'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
                 <div className="w-px bg-primary/30 mx-2"></div>
                {sentimentFilterOptions.map(option => (
                    <button
                        key={option.id}
                        onClick={() => handleFilterToggle('sentiments', option.id)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors flex items-center ${
                            filters.sentiments.has(option.id)
                                ? 'bg-secondary text-white'
                                : 'bg-primary/20 text-foreground/80 hover:bg-primary/40'
                        }`}
                    >
                        {option.icon}
                        {option.label}
                    </button>
                ))}
            </div>
      </div>

      <Timeline interactions={filteredInteractions} isLoading={isLoadingInteractions} />
    </main>
  );
};