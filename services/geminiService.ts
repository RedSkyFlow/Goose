import type { Deal, Proposal } from '../types';
import { handleSummarize, handleGetNextBestAction, handleGenerateProposal } from '../api/gemini';

// This file now acts as a client-side service that communicates
// with our secure backend proxy (api/gemini.ts).
// No API keys or direct SDK calls are present here.

export const summarizeText = async (text: string): Promise<string> => {
  // In a real app, this would be a fetch call:
  // const response = await fetch('/api/summarize', {
  //   method: 'POST',
  //   body: JSON.stringify({ text }),
  // });
  // return response.json();
  return handleSummarize(text);
};

export const getNextBestAction = async (deal: Deal): Promise<string> => {
  return handleGetNextBestAction(deal);
};

export const generateProposal = async (deal: Deal): Promise<Proposal> => {
  return handleGenerateProposal(deal);
};
