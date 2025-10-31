import type { Deal, Interaction, Proposal } from '../types';
import { http } from './httpClient';

// This service acts as the interface between the frontend components
// and the backend API. This is where you would put your `fetch`
// calls to your actual API endpoints.

export const fetchDeals = async (): Promise<Deal[]> => {
    const response = await http.fetch('/api/deals');
    if (!response.ok) {
        throw new Error('Failed to fetch deals');
    }
    return response.json();
};

export const fetchInteractions = async (dealId: string): Promise<Interaction[]> => {
    const response = await http.fetch(`/api/interactions?deal_id=${dealId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch interactions');
    }
    return response.json();
};

export const fetchProposal = async (proposalId: string): Promise<Proposal> => {
    const response = await http.fetch(`/api/proposals/${proposalId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch proposal');
    }
    return response.json();
};

export const acceptProposal = async (proposalId: string, signature: string): Promise<Proposal> => {
    const response = await http.fetch(`/api/proposals/${proposalId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature }),
    });
    if (!response.ok) {
        throw new Error('Failed to accept proposal');
    }
    return response.json();
};

export const processProposalPayment = async (proposalId: string): Promise<Proposal> => {
    const response = await http.fetch(`/api/proposals/${proposalId}/pay`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error('Failed to process payment');
    }
    return response.json();
};