import type { Deal, Interaction, Proposal, Company, Contact, NewCompany, NewContact } from '../types';
import { http } from './httpClient';

// This service acts as the interface between the frontend components
// and the backend API.

// --- CRM Functions ---

export const fetchCompanies = async (): Promise<Company[]> => {
    const response = await http.fetch('/api/companies');
    return response.json();
};

export const createCompany = async (company: NewCompany): Promise<Company> => {
    const response = await http.fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
    });
    return response.json();
};

export const fetchContacts = async (companyId?: string): Promise<Contact[]> => {
    const url = companyId ? `/api/contacts?company_id=${companyId}` : '/api/contacts';
    const response = await http.fetch(url);
    return response.json();
};

export const createContact = async (contact: NewContact): Promise<Contact> => {
    const response = await http.fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
    });
    return response.json();
}

export const fetchDeals = async ({ companyId }: { companyId?: string } = {}): Promise<Deal[]> => {
    const url = companyId ? `/api/deals?company_id=${companyId}` : '/api/deals';
    const response = await http.fetch(url);
    return response.json();
};

interface FetchInteractionsParams {
    dealId?: string;
    companyId?: string;
    contactId?: string;
}

export const fetchInteractions = async (params: FetchInteractionsParams): Promise<Interaction[]> => {
    const query = new URLSearchParams();
    if (params.dealId) query.set('deal_id', params.dealId);
    if (params.companyId) query.set('company_id', params.companyId);
    if (params.contactId) query.set('contact_id', params.contactId);
    
    const response = await http.fetch(`/api/interactions?${query.toString()}`);
    return response.json();
};

// --- Proposal Functions ---

export const fetchProposal = async (proposalId: string): Promise<Proposal> => {
    const response = await http.fetch(`/api/proposals/${proposalId}`);
    return response.json();
};

export const acceptProposal = async (proposalId: string, signature: string, finalValue: number, selectedItemIds: string[]): Promise<Proposal> => {
    const response = await http.fetch(`/api/proposals/${proposalId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature, finalValue, selectedItemIds }),
    });
    return response.json();
};

export const processProposalPayment = async (proposalId: string): Promise<Proposal> => {
    const response = await http.fetch(`/api/proposals/${proposalId}/pay`, {
        method: 'POST',
    });
    return response.json();
};