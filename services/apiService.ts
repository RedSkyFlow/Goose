import { getDeals, getInteractionsForDeal } from '../api/data';
import type { Deal, Interaction } from '../types';

// This service acts as the interface between the frontend components
// and the backend API. In a real app, this is where you would put
// your `fetch` calls to your actual API endpoints.

export const fetchDeals = async (): Promise<Deal[]> => {
    return getDeals();
};

export const fetchInteractions = async (dealId: string): Promise<Interaction[]> => {
    return getInteractionsForDeal(dealId);
};
