import { GoogleGenAI, Type } from "@google/genai";
import type { Company, Contact, Deal, GeneratedProposalContent, Interaction, InteractionLink } from '../types';
import { DealStage, InteractionType, Sentiment } from '../types';
import { http } from '../services/httpClient';

// This file contains all the logic from the previous `api/` directory
// and sets up a mock server to intercept fetch calls.

// --- 1. MOCK DATABASE AND AI LOGIC ---

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const MOCK_COMPANIES: Company[] = [
  { company_id: 'comp-1', name: 'The Grand Hotel', domain: 'grandhotel.com', industry: 'Hospitality', ai_summary: 'Luxury hotel chain focused on premium guest experiences.', created_at: '2023-01-15T09:00:00Z', updated_at: '2023-10-20T10:00:00Z' },
  { company_id: 'comp-2', name: 'Innovate Corp', domain: 'innovatecorp.com', industry: 'Technology', ai_summary: 'SaaS company providing cloud solutions, known for being budget-conscious.', created_at: '2023-02-20T11:00:00Z', updated_at: '2023-10-21T12:00:00Z' },
  { company_id: 'comp-3', name: 'General Retail Inc.', domain: 'generalretail.com', industry: 'Retail', ai_summary: 'Large retail chain with 15 locations.', created_at: '2023-03-10T14:00:00Z', updated_at: '2023-11-10T15:00:00Z' },
];

const MOCK_CONTACTS: Contact[] = [
    { contact_id: 'cont-1', company_id: 'comp-1', first_name: 'John', last_name: 'Doe', email: 'john.doe@grandhotel.com', role: 'IT Director', created_at: '2023-10-26T10:00:00Z', updated_at: '2023-10-26T10:00:00Z' },
    { contact_id: 'cont-2', company_id: 'comp-2', first_name: 'Michael', last_name: 'Chen', email: 'm.chen@innovatecorp.com', role: 'CTO', created_at: '2023-10-15T09:00:00Z', updated_at: '2023-10-15T09:00:00Z' },
    { contact_id: 'cont-3', company_id: 'comp-3', first_name: 'David', last_name: 'Ortiz', email: 'd.ortiz@generalretail.com', role: 'Operations Manager', created_at: '2023-11-10T11:20:00Z', updated_at: '2023-11-10T11:20:00Z' },
    { contact_id: 'cont-4', company_id: 'comp-1', first_name: 'Sarah', last_name: 'Jenkins', email: 'sarah.j@flow.com', role: 'Sales Rep', created_at: '2023-01-01T10:00:00Z', updated_at: '2023-01-01T10:00:00Z' },
    { contact_id: 'cont-5', company_id: 'comp-2', first_name: 'Emily', last_name: 'White', email: 'emily.w@flow.com', role: 'Account Manager', created_at: '2023-01-01T10:00:00Z', updated_at: '2023-01-01T10:00:00Z' },
];

const MOCK_DEALS: Deal[] = [
  { deal_id: 'deal-1', company_id: 'comp-1', deal_name: 'The Grand Hotel Network Upgrade', value: 250000, stage: DealStage.PROPOSAL, close_date_expected: '2024-03-31', ai_health_score: 85, ai_next_best_action: 'Follow up on proposal feedback by end of week.', created_at: '2023-10-26T10:00:00Z', updated_at: '2023-11-05T11:00:00Z' },
  { deal_id: 'deal-2', company_id: 'comp-2', deal_name: 'Innovate Corp Cloud Migration', value: 120000, stage: DealStage.NEGOTIATION, close_date_expected: '2024-02-29', ai_health_score: 65, ai_next_best_action: 'Present revised offer with phased implementation.', created_at: '2023-10-15T09:00:00Z', updated_at: '2023-10-21T10:00:00Z' },
  { deal_id: 'deal-3', company_id: 'comp-3', deal_name: 'Retail Chain POS System', value: 75000, stage: DealStage.QUALIFYING, close_date_expected: '2024-04-30', ai_health_score: 42, ai_next_best_action: 'Schedule a discovery call to understand requirements.', created_at: '2023-11-10T11:20:00Z', updated_at: '2023-11-10T11:20:00Z' },
];

const MOCK_INTERACTIONS: Interaction[] = [
    { interaction_id: 'int-1', type: InteractionType.MEETING, source_identifier: 'gcal-1', timestamp: '2023-10-26T10:00:00Z', content_raw: 'Initial discovery call with the IT Director. Key pain points identified: slow guest WiFi, frequent outages in conference rooms, and outdated security protocols. They need a full network overhaul before the summer tourist season. Expressed strong interest in our managed services.', ai_sentiment: Sentiment.POSITIVE, created_at: '2023-10-26T10:00:00Z' },
    { interaction_id: 'int-2', type: InteractionType.EMAIL, source_identifier: 'gmail-1', timestamp: '2023-10-28T14:30:00Z', content_raw: `Subject: Following up on our call\n\nHi John,\n\nGreat speaking with you the other day. I've attached a preliminary overview of our proposed solution based on your requirements. Let me know if you have any questions before I put together the full formal proposal.\n\nBest,\nSarah`, ai_sentiment: Sentiment.NEUTRAL, created_at: '2023-10-28T14:30:00Z' },
    { interaction_id: 'int-3', type: InteractionType.PROPOSAL_VIEW, source_identifier: 'prop-1-view-1', timestamp: '2023-11-05T11:00:00Z', content_raw: 'Proposal for a complete Ubiquiti network stack, including new access points, switches, and a security gateway. Pricing is set at $250,000 for hardware and installation.', created_at: '2023-11-05T11:00:00Z' },
    { interaction_id: 'int-4', type: InteractionType.EMAIL, source_identifier: 'gmail-2', timestamp: '2023-10-15T09:00:00Z', content_raw: 'Inquiry about our cloud migration services. They are currently on-prem and facing high maintenance costs.', ai_sentiment: Sentiment.NEUTRAL, created_at: '2023-10-15T09:00:00Z' },
    { interaction_id: 'int-5', type: InteractionType.CALL_LOG, source_identifier: 'call-1', timestamp: '2023-10-20T16:00:00Z', content_raw: 'Call with Michael. He\'s concerned about the budget and the timeline. He needs the migration completed by Q1 next year. He seems hesitant about the price.', ai_sentiment: Sentiment.NEGATIVE, ai_summary: 'Client is budget-conscious and has a firm deadline of Q1. Price is a potential obstacle.', created_at: '2023-10-20T16:00:00Z' },
    { interaction_id: 'int-6', type: InteractionType.NOTE, source_identifier: 'note-1', timestamp: '2023-10-21T10:00:00Z', content_raw: 'Internal note: Need to prepare a revised offer with a phased approach to make the cost more manageable. Will highlight long-term TCO savings.', created_at: '2023-10-21T10:00:00Z' },
    { interaction_id: 'int-7', type: InteractionType.EMAIL, source_identifier: 'gmail-3', timestamp: '2023-11-10T11:20:00Z', content_raw: `Hi, \n\nWe're looking for a new Point-of-Sale system for our 15 retail locations. Can you send over some information? \n\nThanks, \nDavid`, ai_sentiment: Sentiment.NEUTRAL, created_at: '2023-11-10T11:20:00Z' },
];

const MOCK_INTERACTION_LINKS: InteractionLink[] = [
    { interaction_id: 'int-1', deal_id: 'deal-1', company_id: 'comp-1', contact_id: 'cont-1' },
    { interaction_id: 'int-2', deal_id: 'deal-1', company_id: 'comp-1', contact_id: 'cont-4' },
    { interaction_id: 'int-3', deal_id: 'deal-1', company_id: 'comp-1' },
    { interaction_id: 'int-4', deal_id: 'deal-2', company_id: 'comp-2', contact_id: 'cont-2' },
    { interaction_id: 'int-5', deal_id: 'deal-2', company_id: 'comp-2', contact_id: 'cont-5' },
    { interaction_id: 'int-6', deal_id: 'deal-2', company_id: 'comp-2', contact_id: 'cont-5' },
    { interaction_id: 'int-7', deal_id: 'deal-3', company_id: 'comp-3', contact_id: 'cont-3' },
];

let refresh_counter = 0;
let newInteractionAdded = false;

const getDeals = (): Deal[] => MOCK_DEALS;

const getInteractionsForDeal = (dealId: string): Interaction[] => {
    refresh_counter++;
    if (dealId === 'deal-1' && refresh_counter > 1 && !newInteractionAdded) {
        console.log("MOCK API: Injecting a new interaction for live update simulation.");
        const NEW_MOCK_INTERACTION: Interaction = {
            interaction_id: 'int-new-1',
            type: InteractionType.EMAIL,
            source_identifier: 'gmail-new',
            timestamp: new Date().toISOString(),
            content_raw: `Subject: RE: Following up on our call\n\nHi Sarah,\n\nThanks for the overview. This looks promising. The team and I have reviewed it and we'd like to move forward with the formal proposal.\n\nBest,\nJohn Doe`,
            ai_sentiment: Sentiment.POSITIVE,
            created_at: new Date().toISOString(),
        };
        const NEW_MOCK_LINK: InteractionLink = {
            interaction_id: 'int-new-1',
            deal_id: 'deal-1',
            company_id: 'comp-1',
            contact_id: 'cont-1'
        };
        MOCK_INTERACTIONS.unshift(NEW_MOCK_INTERACTION);
        MOCK_INTERACTION_LINKS.push(NEW_MOCK_LINK);
        newInteractionAdded = true;
    }

    const relevantLinks = MOCK_INTERACTION_LINKS.filter(link => link.deal_id === dealId);
    const interactionIds = new Set(relevantLinks.map(link => link.interaction_id));
    return MOCK_INTERACTIONS
        .filter(interaction => interactionIds.has(interaction.interaction_id))
        .map(interaction => {
            const link = relevantLinks.find(l => l.interaction_id === interaction.interaction_id);
            const contact = MOCK_CONTACTS.find(c => c.contact_id === link?.contact_id);
            return {
                ...interaction,
                author: contact ? { name: `${contact.first_name} ${contact.last_name}`, role: contact.role || '' } : { name: 'System', role: 'Notification'},
            };
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const handleSummarize = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Summarize the following text into a concise paragraph, focusing on key decisions and action items:\n\n---\n${text}\n---` });
    return response.text;
};

const handleGetNextBestAction = async (deal: Deal, interactions: Interaction[]): Promise<string> => {
    const timelineSummary = interactions.map(i => `[${i.timestamp} - ${i.type} by ${i.author?.name || 'Unknown'}]: ${i.ai_summary || i.content_raw.substring(0, 150)}...`).join('\n');
    const prompt = `You are an expert sales co-pilot. Based on the following deal information and interaction history, suggest the single, most impactful "next best action" for the sales representative to take to move this deal forward. Be concise and actionable.\n\nDeal: ${deal.deal_name}\nValue: $${deal.value.toLocaleString()}\nCurrent Stage: ${deal.stage}\n\nInteraction History:\n${timelineSummary}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

const handleGenerateProposal = async (deal: Deal, interactions: Interaction[]): Promise<GeneratedProposalContent> => {
    const timelineSummary = interactions.map(i => `On ${i.timestamp}, a ${i.type} interaction occurred. Content: ${i.ai_summary || i.content_raw}`).join('\n\n');
    const prompt = `Analyze the following interaction history for the deal "${deal.deal_name}" and generate a structured sales proposal in JSON format.\n\nInteraction History:\n---\n${timelineSummary}\n---\n\nBased on the history, identify the client's primary pain points and needs. Then, craft a compelling proposal that addresses these needs. The output must be a valid JSON object following the specified schema.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            introduction: { type: Type.STRING, description: 'A brief, engaging introduction for the proposal.' },
            clientNeeds: { type: Type.STRING, description: "A summary of the client's identified needs and pain points, written from a perspective of understanding their challenges." },
            proposedSolution: { type: Type.STRING, description: 'A description of the proposed solution that directly addresses the client needs.' },
            pricing: { type: Type.STRING, description: `A placeholder for the pricing section, set to the value of the deal which is $${deal.value.toLocaleString()}. For example: "The total investment for this solution is $${deal.value.toLocaleString()}."` },
          },
          required: ["introduction", "clientNeeds", "proposedSolution", "pricing"],
        },
      },
    });
    return JSON.parse(response.text) as GeneratedProposalContent;
};

// --- 2. MOCK FETCH IMPLEMENTATION ---

const API_LATENCY = 500; // ms
const originalFetch = window.fetch;

const mockFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(input instanceof Request ? input.url : input, window.location.origin);
    const { pathname, searchParams } = url;
    
    console.log(`Intercepted FETCH call to: ${pathname}${url.search}`);

    await new Promise(resolve => setTimeout(resolve, API_LATENCY));

    // --- Data Endpoints ---
    if (pathname === '/api/deals' && init?.method !== 'POST') {
        const data = getDeals();
        return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
    }
    if (pathname === '/api/interactions' && init?.method !== 'POST') {
        const dealId = searchParams.get('deal_id');
        if (!dealId) return new Response('Missing deal_id', { status: 400 });
        const data = getInteractionsForDeal(dealId);
        return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
    }

    // --- AI Endpoints ---
    if (pathname === '/api/summarize' && init?.method === 'POST') {
        const body = JSON.parse(init.body as string);
        const summary = await handleSummarize(body.text);
        return new Response(JSON.stringify({ summary }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (pathname === '/api/next-best-action' && init?.method === 'POST') {
        const { deal, interactions } = JSON.parse(init.body as string);
        const action = await handleGetNextBestAction(deal, interactions);
        return new Response(JSON.stringify({ action }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (pathname === '/api/generate-proposal' && init?.method === 'POST') {
         const { deal, interactions } = JSON.parse(init.body as string);
         const proposal = await handleGenerateProposal(deal, interactions);
         return new Response(JSON.stringify(proposal), { headers: { 'Content-Type': 'application/json' } });
    }

    console.warn(`No mock handler for ${pathname}. Falling back to original fetch.`);
    return originalFetch(input, init);
};

export const startApiMock = () => {
    // FIX: Instead of overwriting the read-only window.fetch, we overwrite the
    // fetch method on our own, mutable httpClient object. This resolves the
    // "Cannot set property fetch of #<Window>" TypeError.
    http.fetch = mockFetch;
};
