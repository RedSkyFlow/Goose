import type { Deal, GeneratedProposalContent, Interaction, EmailDraft } from '../types';
import { http } from './httpClient';

// This file now acts as a client-side service that makes fetch calls
// to our secure backend proxy endpoints.

export const summarizeText = async (text: string): Promise<string> => {
  const response = await http.fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  return data.summary;
};

export const getNextBestAction = async (deal: Deal, interactions: Interaction[]): Promise<string> => {
  const response = await http.fetch('/api/next-best-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deal, interactions }),
  });
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  return data.action;
};

export const getCoPilotResponse = async (prompt: string, deal?: Deal, interactions?: Interaction[]): Promise<string> => {
  const response = await http.fetch('/api/copilot-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, deal, interactions }),
  });
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  return data.response;
};

export const generateProposal = async (deal: Deal, interactions: Interaction[]): Promise<string> => {
  const response = await http.fetch('/api/generate-proposal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deal, interactions }),
  });
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  return data.proposalId;
};

export const draftEmail = async (suggestion: string, deal: Deal, interactions: Interaction[]): Promise<EmailDraft> => {
    const response = await http.fetch('/api/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion, deal, interactions }),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
}
