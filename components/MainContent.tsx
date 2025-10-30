
import React, { useState } from 'react';
import type { Deal, Proposal } from '../types';
import { Timeline } from './Timeline';
import { generateProposal } from '../services/geminiService';
import { ProposalIcon, SparklesIcon } from './icons';

interface MainContentProps {
  deal: Deal | null;
}

const ProposalModal: React.FC<{ proposal: Proposal; onClose: () => void }> = ({ proposal, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-brand-gray-800 rounded-lg shadow-2xl p-8 max-w-2xl w-full border border-brand-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center"><ProposalIcon className="w-6 h-6 mr-3 text-brand-blue" /> AI Generated Proposal Draft</h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <h3 className="font-semibold text-brand-blue">Introduction</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{proposal.introduction}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-brand-blue">Understanding Your Needs</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{proposal.clientNeeds}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-brand-blue">Proposed Solution</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{proposal.proposedSolution}</p>
                </div>
                 <div>
                    <h3 className="font-semibold text-brand-blue">Pricing</h3>
                    <p className="text-gray-300">{proposal.pricing}</p>
                </div>
            </div>
            <button onClick={onClose} className="mt-6 bg-brand-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full transition-colors">
                Close
            </button>
        </div>
    </div>
);


export const MainContent: React.FC<MainContentProps> = ({ deal }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedProposal, setGeneratedProposal] = useState<Proposal | null>(null);

    const handleGenerateProposal = async () => {
        if (!deal) return;
        setIsGenerating(true);
        const proposal = await generateProposal(deal);
        setGeneratedProposal(proposal);
        setIsGenerating(false);
    }

  if (!deal) {
    return (
      <main className="flex-1 bg-brand-gray-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400">Welcome to Project Goose</h2>
          <p className="text-gray-500 mt-2">Select a deal from the left to view its timeline and insights.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-brand-gray-900 p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">{deal.name}</h2>
          <p className="text-gray-400">
            ${deal.value.toLocaleString()} | {deal.stage}
          </p>
        </div>
        <button
            onClick={handleGenerateProposal}
            disabled={isGenerating}
            className="bg-brand-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-200 disabled:bg-brand-gray-600"
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
      </div>

      <h3 className="text-xl font-semibold text-gray-200 border-b border-brand-gray-700 pb-2">
        Customer Timeline
      </h3>
      <Timeline events={deal.timeline} />
      {generatedProposal && (
          <ProposalModal proposal={generatedProposal} onClose={() => setGeneratedProposal(null)} />
      )}
    </main>
  );
};
