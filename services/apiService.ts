import type { Deal, Interaction } from '../types';
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
