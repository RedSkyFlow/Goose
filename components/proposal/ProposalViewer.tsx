import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchProposal, fetchDeals } from '../../services/apiService';
import { Proposal, Deal, ProposalStatus, ProposalItem } from '../../types';
import { SignatureBlock } from './SignatureBlock';
import { PaymentBlock } from './PaymentBlock';
import { SparklesIcon, CheckCircleIcon } from '../icons';

interface ProposalViewerProps {
  proposalId: string;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export const ProposalViewer: React.FC<ProposalViewerProps> = ({ proposalId }) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadProposalData = async () => {
      try {
        setIsLoading(true);
        const fetchedProposal = await fetchProposal(proposalId);
        setProposal(fetchedProposal);
        setSelectedItemIds(new Set(fetchedProposal.content.solutionItems.map(item => item.id)));

        const allDeals = await fetchDeals(); // In a real app, you'd fetch by ID
        const relatedDeal = allDeals.find(d => d.deal_id === fetchedProposal.deal_id);
        setDeal(relatedDeal || null);

      } catch (err) {
        setError('Failed to load proposal. It may be invalid or expired.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProposalData();
  }, [proposalId]);

  const handleToggleItem = useCallback((itemId: string) => {
    setSelectedItemIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
            newSet.delete(itemId);
        } else {
            newSet.add(itemId);
        }
        return newSet;
    });
  }, []);

  const totalValue = useMemo(() => {
    if (!proposal) return 0;
    return proposal.content.solutionItems.reduce((acc, item) => {
        return selectedItemIds.has(item.id) ? acc + (item.price * item.quantity) : acc;
    }, 0);
  }, [proposal, selectedItemIds]);

  const handleUpdateProposal = (updatedProposal: Proposal) => {
    setProposal(updatedProposal);
  };


  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error || !proposal || !deal) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-red-400 p-8">
        <div className="text-center">
            <h1 className="text-2xl font-bold">Error Loading Proposal</h1>
            <p className="mt-2">{error || 'Could not find the requested proposal.'}</p>
        </div>
      </div>
    );
  }
  
  const content = proposal.content;
  const isAccepted = proposal.status === ProposalStatus.ACCEPTED || proposal.status === ProposalStatus.PAID;

  return (
    <div className="bg-background min-h-screen font-sans text-foreground flex justify-center p-4 sm:p-8">
      <main className="w-full max-w-5xl bg-background-light border border-primary/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="p-8 bg-background/50 border-b border-primary/50 text-center">
            <div className="flex items-center justify-center mb-4">
                 <div className="bg-secondary rounded-full h-12 w-12 flex items-center justify-center font-bold text-background text-2xl mr-4">
                    G
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{content.proposalTitle}</h1>
                    <p className="text-foreground/70">Prepared for: {content.clientName}</p>
                </div>
            </div>
        </header>
        
        <div className="p-8 space-y-10">
            {/* Executive Summary */}
            <section>
                <h2 className="text-2xl font-bold text-secondary mb-3">Executive Summary</h2>
                <p className="text-foreground/90 leading-relaxed">{content.executiveSummary}</p>
            </section>
            
            {/* Challenges */}
            <section>
                <h2 className="text-2xl font-bold text-secondary mb-3">Understanding Your Challenges</h2>
                <p className="text-foreground/90 leading-relaxed">{content.clientChallenges}</p>
            </section>

            {/* Interactive Solution */}
            <section>
                <h2 className="text-2xl font-bold text-secondary mb-4">Proposed Solution</h2>
                <div className="space-y-4">
                    {content.solutionItems.map(item => (
                        <div key={item.id} className={`p-4 rounded-lg border transition-all duration-300 ${selectedItemIds.has(item.id) ? 'bg-primary/10 border-primary/50' : 'bg-background/30 border-primary/20 opacity-60'}`}>
                            <div className="flex items-start">
                                <input 
                                    type="checkbox"
                                    checked={selectedItemIds.has(item.id)}
                                    onChange={() => handleToggleItem(item.id)}
                                    disabled={isAccepted}
                                    className="h-6 w-6 rounded border-primary/70 text-secondary focus:ring-secondary mt-1 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <div className="ml-4 flex-grow">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-lg text-foreground">{item.name}</h3>
                                        <span className="font-semibold text-foreground">{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                    <p className="text-sm text-foreground/80 mt-1">{item.description}</p>
                                    <ul className="mt-2 list-disc list-inside text-sm text-foreground/70 space-y-1">
                                        {item.features.map((feature, i) => <li key={i}>{feature}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                 {!isAccepted && <p className="text-xs text-center text-foreground/60 mt-4">You can un-check items to tailor the proposal to your needs. The total will update automatically.</p>}
            </section>

             {/* ROI Projections */}
            <section>
                <h2 className="text-2xl font-bold text-secondary mb-4">Projected Return on Investment</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {content.roiProjections.map((roi, i) => (
                        <div key={i} className="bg-background/50 p-4 rounded-lg border border-primary/30 text-center">
                            <p className="text-3xl font-bold text-accent">{roi.value}</p>
                            <p className="font-semibold text-foreground/90 mt-1">{roi.metric}</p>
                            <p className="text-xs text-foreground/70 mt-2">{roi.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Investment Summary */}
            <section className="text-center bg-background/50 p-6 rounded-lg border-2 border-accent">
                 <h2 className="text-lg font-semibold text-foreground/80 tracking-widest uppercase">Investment Summary</h2>
                 <p className="text-5xl font-bold text-accent my-2">{formatCurrency(totalValue)}</p>
                 <p className="text-foreground/70">Total for selected services</p>
            </section>

             {/* T&Cs */}
            <section>
                <h2 className="text-xl font-bold text-secondary mb-3">Terms & Conditions</h2>
                <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">{content.termsAndConditions}</p>
            </section>
        </div>

        {/* Actions */}
        <div className="p-8 bg-background/50 border-t border-primary/50 space-y-8">
            <SignatureBlock 
                proposal={proposal} 
                onProposalUpdate={handleUpdateProposal}
                finalValue={totalValue}
                selectedItemIds={Array.from(selectedItemIds)}
            />
            {isAccepted && (
                 <PaymentBlock 
                    proposal={proposal} 
                    deal={deal}
                    finalValue={proposal.final_accepted_value ?? totalValue} 
                    onProposalUpdate={handleUpdateProposal} 
                />
            )}
        </div>
      </main>
    </div>
  );
};
