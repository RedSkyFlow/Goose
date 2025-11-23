import React, { useState } from 'react';
import { Proposal, Deal, PaymentStatus } from '../../types';
import { CreditCardIcon, CheckCircleIcon } from '../icons';
import { processProposalPayment } from '../../services/apiService';

interface PaymentBlockProps {
  proposal: Proposal;
  deal: Deal;
  onProposalUpdate: (updatedProposal: Proposal) => void;
  finalValue: number;
}

export const PaymentBlock: React.FC<PaymentBlockProps> = ({ proposal, deal, onProposalUpdate, finalValue }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  
  const isPaid = proposal.payment_status === PaymentStatus.PAID;
  const depositAmount = finalValue * 0.5; // Use the final accepted value

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
            <h2 className="text-xl font-bold flex items-center mb-4 text-foreground/90 print:text-black">
                <CheckCircleIcon className="w-6 h-6 mr-3 text-accent print:text-black" />
                Payment Complete
            </h2>
            <div className="bg-background/50 p-4 rounded-lg border border-accent/50 print:bg-white print:border-gray-300">
                <p className="text-foreground/80 print:text-black">A deposit of <span className="font-bold text-foreground print:text-black">{formatCurrency(depositAmount)}</span> has been paid.</p>
                <p className="text-xs text-foreground/70 mt-1 print:text-black">Transaction ID: {proposal.payment_gateway_tx_id}</p>
            </div>
        </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold flex items-center mb-4 text-foreground/90 print:text-black">
        <CreditCardIcon className="w-6 h-6 mr-3 text-secondary print:text-black" />
        Pay Deposit
      </h2>
      <div className="bg-background/50 p-4 rounded-lg border border-primary/50 print:bg-white print:border-gray-300">
        <div className="flex justify-between items-center mb-4">
            <span className="text-foreground/80 print:text-black">Total Agreed Value:</span>
            <span className="font-bold text-lg text-foreground print:text-black">{formatCurrency(finalValue)}</span>
        </div>
        <div className="flex justify-between items-center mb-4 text-accent font-semibold print:text-black">
            <span>50% Deposit Due:</span>
            <span className="font-bold text-xl">{formatCurrency(depositAmount)}</span>
        </div>
        <p className="text-sm text-foreground/70 mb-4 print:text-black">
          Click below to securely pay the deposit via Stripe.
        </p>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button
          onClick={handlePay}
          disabled={isLoading}
          className="w-full bg-accent hover:opacity-90 text-background font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 disabled:bg-accent/50 disabled:cursor-not-allowed print:hidden"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background"></div>
          ) : (
            `Pay Deposit (${formatCurrency(depositAmount)})`
          )}
        </button>
      </div>
    </div>
  );
};