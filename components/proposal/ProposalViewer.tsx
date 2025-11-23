import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchProposal, fetchDeals } from '../../services/apiService';
import { Proposal, Deal, ProposalStatus } from '../../types';
import { SignatureBlock } from './SignatureBlock';
import { PaymentBlock } from './PaymentBlock';
import { ProposalHero } from './ProposalHero';
import { ExecutiveSummary } from './ExecutiveSummary';
import { SolutionBreakdown } from './SolutionBreakdown';
import { ProposalTable } from './ProposalTable';
import { CollaborationSidebar } from './CollaborationSidebar';
import { DownloadIcon, CloseIcon } from '../icons';

interface ProposalViewerProps {
  proposalId: string;
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

  const handlePrint = () => {
      window.print();
  };

  const handleExit = () => {
      // Simply redirect to home or close tab if possible, standard pattern for microsites
      window.location.href = '/';
  }


  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#1c203c]">
        <div className="flex flex-col items-center">
             <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
             <p className="text-primary font-mono">Loading Proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal || !deal) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#1c203c] text-white p-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Unable to Access Proposal</h1>
            <p className="text-gray-300">{error || 'Could not find the requested proposal.'}</p>
            <button onClick={handleExit} className="mt-8 text-primary hover:underline">Return to Dashboard</button>
        </div>
      </div>
    );
  }
  
  const content = proposal.content;
  const isAccepted = proposal.status === ProposalStatus.ACCEPTED || proposal.status === ProposalStatus.PAID;

  return (
    <div className="bg-[#1c203c] min-h-screen font-sans text-foreground overflow-x-hidden proposal-gradient">
        
        {/* Floating Navigation Header (Glassmorphism) */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-[#1c203c]/80 backdrop-blur-md border-b border-white/10 print:hidden">
             <div className="text-white font-bold tracking-wider opacity-80">PROPOSAL # {proposal.proposal_id.toUpperCase()}</div>
             <div className="flex items-center space-x-4">
                 <button 
                    onClick={handlePrint}
                    className="flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                     <DownloadIcon className="w-5 h-5 mr-2" />
                     Download PDF
                 </button>
                 <div className="h-6 w-px bg-gray-600"></div>
                 <button onClick={handleExit} className="text-gray-400 hover:text-white">
                     <CloseIcon className="w-6 h-6" />
                 </button>
             </div>
        </nav>

        {/* 1. Hero Section */}
        <ProposalHero 
            title={content.proposalTitle} 
            clientName={content.clientName}
            date={proposal.created_at}
        />

        {/* 2. Executive Summary */}
        <ExecutiveSummary 
            summary={content.executiveSummary}
            challenges={content.clientChallenges}
            roiProjections={content.roiProjections}
        />

        {/* 3. Solution Breakdown */}
        <SolutionBreakdown items={content.solutionItems} />

        {/* 4. Pricing Table */}
        <ProposalTable 
            items={content.solutionItems}
            selectedItemIds={selectedItemIds}
            onToggleItem={handleToggleItem}
            isLocked={isAccepted}
        />

        {/* 5. Acceptance & Payment */}
        <section className="py-20 bg-[#15182e] print:py-10 print:bg-white">
             <div className="max-w-3xl mx-auto px-8 space-y-12 print:px-0">
                {/* T&Cs */}
                <div className="text-xs text-gray-500 mb-12 print:text-black">
                    <h4 className="font-bold uppercase mb-2">Terms & Conditions</h4>
                    <p className="whitespace-pre-wrap">{content.termsAndConditions}</p>
                </div>

                {/* Sign-off Logic - Using existing components, but wrapped nicely */}
                <div className="bg-[#1c203c] p-8 rounded-xl border border-primary/20 shadow-lg print:bg-white print:border-black">
                     <SignatureBlock 
                        proposal={proposal} 
                        onProposalUpdate={handleUpdateProposal}
                        finalValue={totalValue}
                        selectedItemIds={Array.from(selectedItemIds)}
                    />
                </div>

                {isAccepted && (
                    <div className="bg-[#1c203c] p-8 rounded-xl border border-primary/20 shadow-lg print:bg-white print:border-black">
                        <PaymentBlock 
                            proposal={proposal} 
                            deal={deal}
                            finalValue={proposal.final_accepted_value ?? totalValue} 
                            onProposalUpdate={handleUpdateProposal} 
                        />
                    </div>
                )}
             </div>
        </section>
        
        {/* Collaboration Sidebar */}
        <CollaborationSidebar clientName={content.clientName} />

    </div>
  );
};