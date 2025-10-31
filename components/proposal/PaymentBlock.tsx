import React, { useState } from 'react';
import { Proposal, Deal, PaymentStatus, ProposalStatus } from '../../types';
import { CreditCardIcon, CheckCircleIcon } from '../icons';
import { processProposalPayment } from '../../services/apiService';

interface PaymentBlockProps {
  proposal: Proposal;
  deal: Deal;
  onProposalUpdate: (updatedProposal: Proposal) => void;
}

export const PaymentBlock: React.FC<PaymentBlockProps> = ({ proposal, deal, onProposalUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const isPaid = proposal.payment_status === PaymentStatus.PAID;
  const depositAmount = deal.value * 0.5; // Assuming 50% deposit

  const handlePay = async () => {
    setError('');
    setIsLoading(true);
    try {
      const updatedProposal = await processProposalPayment(proposal.proposal_id);
      onProposalUpdate(updatedProposal);
    } catch (e) {
      setError('Payment processing failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPaid) {
    return (
        <div>
            <h2 className="text-xl font-bold flex items-center mb-4 text-foreground/90">
                <CheckCircleIcon className="w-6 h-6 mr-3 text-accent" />
                Payment Complete
            </h2>
            <div className="bg-background/50 p-4 rounded-lg border border-accent/50">
                <p className="text-foreground/80">A deposit of <span className="font-bold text-foreground">${depositAmount.toLocaleString()}</span> has been paid.</p>
                <p className="text-xs text-foreground/70 mt-1">Transaction ID: {proposal.payment_gateway_tx_id}</p>
            </div>
        </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold flex items-center mb-4 text-foreground/90">
        <CreditCardIcon className="w-6 h-6 mr-3 text-secondary" />
        Pay Deposit
      </h2>
      <div className="bg-background/50 p-4 rounded-lg border border-primary/50">
        <div className="flex justify-between items-center mb-4">
            <span className="text-foreground/80">Total Proposal Value:</span>
            <span className="font-bold text-lg text-foreground">${deal.value.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mb-4 text-accent font-semibold">
            <span>50% Deposit Due:</span>
            <span className="font-bold text-xl">${depositAmount.toLocaleString()}</span>
        </div>
        <p className="text-sm text-foreground/70 mb-4">
          Click below to securely pay the deposit via Stripe.
        </p>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button
          onClick={handlePay}
          disabled={isLoading}
          className="w-full bg-accent hover:opacity-90 text-background font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 disabled:bg-accent/50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background"></div>
          ) : (
            `Pay Deposit ($${depositAmount.toLocaleString()})`
          )}
        </button>
      </div>
    </div>
  );
};