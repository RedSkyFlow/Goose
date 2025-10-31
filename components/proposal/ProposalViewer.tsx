import React, { useState, useEffect } from 'react';
import { fetchProposal, fetchDeals } from '../../services/apiService';
import { Proposal, Deal, Company, ProposalStatus, PaymentStatus } from '../../types';
import { SignatureBlock } from './SignatureBlock';
import { PaymentBlock } from './PaymentBlock';
import { ProposalIcon } from '../icons';

interface ProposalViewerProps {
  proposalId: string;
}

export const ProposalViewer: React.FC<ProposalViewerProps> = ({ proposalId }) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProposalData = async () => {
      try {
        setIsLoading(true);
        const fetchedProposal = await fetchProposal(proposalId);
        setProposal(fetchedProposal);

        // In a real app, you'd fetch the deal and company directly.
        // Here, we fetch all deals and find the matching one.
        const allDeals = await fetchDeals();
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

  const isAccepted = proposal.status === ProposalStatus.ACCEPTED || proposal.status === ProposalStatus.PAID;
  const isPaid = proposal.status === ProposalStatus.PAID;

  return (
    <div className="bg-background min-h-screen font-sans text-foreground flex justify-center p-4 sm:p-8">
      <main className="w-full max-w-4xl bg-background-light border border-primary/50 rounded-2xl shadow-2xl overflow-hidden">
        <header className="p-8 bg-background/50 border-b border-primary/50">
            <div className="flex items-center mb-4">
                 <div className="bg-secondary rounded-full h-10 w-10 flex items-center justify-center font-bold text-background text-xl mr-4">
                    G
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Proposal for {deal.deal_name}</h1>
                    <p className="text-foreground/70">Prepared for: {deal.company_id}</p>
                </div>
            </div>
             <div className="flex justify-between items-center text-sm text-foreground/80 mt-6">
                <span>Version: {proposal.version}</span>
                <span>Sent: {new Date(proposal.sent_at!).toLocaleDateString()}</span>
                <span>Value: <span className="font-bold text-accent">${deal.value.toLocaleString()}</span></span>
            </div>
        </header>
        
        <div className="p-8 prose prose-invert prose-headings:text-secondary max-w-none">
            <div dangerouslySetInnerHTML={{ __html: proposal.ai_initial_draft.replace(/\n/g, '<br />') }} />
        </div>

        <div className="p-8 bg-background/50 border-t border-primary/50 space-y-8">
            <SignatureBlock proposal={proposal} onProposalUpdate={handleUpdateProposal} />
            {isAccepted && (
                 <PaymentBlock proposal={proposal} deal={deal} onProposalUpdate={handleUpdateProposal} />
            )}
        </div>
      </main>
    </div>
  );
};