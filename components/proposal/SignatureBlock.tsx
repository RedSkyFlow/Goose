import React, { useState } from 'react';
import { Proposal, ProposalStatus } from '../../types';
import { SignatureIcon, CheckCircleIcon } from '../icons';
import { acceptProposal } from '../../services/apiService';

interface SignatureBlockProps {
  proposal: Proposal;
  onProposalUpdate: (updatedProposal: Proposal) => void;
  finalValue: number;
  selectedItemIds: string[];
}

export const SignatureBlock: React.FC<SignatureBlockProps> = ({ proposal, onProposalUpdate, finalValue, selectedItemIds }) => {
  const [signature, setSignature] = useState('');
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    if (!signature || !consent) {
      setError('Please type your full name and agree to the terms.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const updatedProposal = await acceptProposal(proposal.proposal_id, signature, finalValue, selectedItemIds);
      onProposalUpdate(updatedProposal);
    } catch (e) {
      setError('Could not accept the proposal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const isAccepted = proposal.status === ProposalStatus.ACCEPTED || proposal.status === ProposalStatus.PAID;

  if (isAccepted) {
    return (
        <div>
            <h2 className="text-xl font-bold flex items-center mb-4 text-foreground/90 print:text-black">
                <CheckCircleIcon className="w-6 h-6 mr-3 text-accent print:text-black" />
                Proposal Accepted
            </h2>
            <div className="bg-background/50 p-4 rounded-lg border border-accent/50 print:bg-white print:border-gray-300">
                <p className="text-foreground/80 print:text-black">Signed by: <span className="font-bold text-foreground print:text-black">{proposal.signature}</span></p>
                <p className="text-foreground/80 print:text-black">Date: <span className="font-bold text-foreground print:text-black">{new Date(proposal.signed_at!).toLocaleString()}</span></p>
                {proposal.final_accepted_value && (
                    <p className="text-foreground/80 mt-2 print:text-black">Final Agreed Value: <span className="font-bold text-accent print:text-black">${proposal.final_accepted_value.toLocaleString()}</span></p>
                )}
            </div>
        </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold flex items-center mb-4 text-foreground/90 print:text-black">
        <SignatureIcon className="w-6 h-6 mr-3 text-secondary print:text-black" />
        E-Signature & Acceptance
      </h2>
      <div className="bg-background/50 p-4 rounded-lg border border-primary/50 print:bg-white print:border-gray-300">
        <p className="text-sm text-foreground/70 mb-4 print:text-black">
          By signing below, you agree to the terms and conditions outlined in this document for the selected items totalling <span className="font-bold text-accent print:text-black">${finalValue.toLocaleString()}</span>.
        </p>
        <div className="mb-4">
          <label htmlFor="signature" className="block text-sm font-medium text-foreground/90 mb-1 print:text-black">
            Type your full name to sign
          </label>
          <input
            type="text"
            id="signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="w-full bg-background text-foreground p-2 rounded-md border border-primary/70 focus:ring-2 focus:ring-secondary focus:outline-none print:bg-white print:text-black print:border-gray-400"
            placeholder="John Doe"
          />
        </div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="h-4 w-4 rounded border-primary/70 text-secondary focus:ring-secondary"
          />
          <label htmlFor="consent" className="ml-2 block text-sm text-foreground/90 print:text-black">
            I agree to be legally bound by this document.
          </label>
        </div>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button
          onClick={handleAccept}
          disabled={isLoading || !signature || !consent}
          className="w-full bg-secondary hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 disabled:bg-secondary/50 disabled:cursor-not-allowed print:hidden"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Accept Proposal'
          )}
        </button>
      </div>
    </div>
  );
};