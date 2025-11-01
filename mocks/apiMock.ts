import { GoogleGenAI, Type } from "@google/genai";
import type { Company, Contact, Deal, GeneratedProposalContent, Interaction, InteractionLink, Proposal, EmailDraft } from '../types';
import { DealStage, InteractionType, PaymentStatus, ProposalStatus, Sentiment } from '../types';
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

const generateHistory = (start: number, end: number, points: number): { date: string; score: number }[] => {
    const history = [];
    for (let i = 0; i < points; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (points - 1 - i));
        const score = start + Math.round(((end - start) / (points - 1)) * i + (Math.random() - 0.5) * 10);
        history.push({ date: date.toISOString().split('T')[0], score: Math.max(0, Math.min(100, score)) });
    }
    return history;
}

const MOCK_DEALS: Deal[] = [
  { deal_id: 'deal-1', company_id: 'comp-1', deal_name: 'The Grand Hotel Network Upgrade', value: 250000, stage: DealStage.PROPOSAL, close_date_expected: '2024-03-31', ai_health_score: 85, ai_next_best_action: 'Follow up on proposal feedback by end of week.', created_at: '2023-10-26T10:00:00Z', updated_at: '2023-11-05T11:00:00Z', ai_health_score_history: generateHistory(70, 85, 30) },
  { deal_id: 'deal-2', company_id: 'comp-2', deal_name: 'Innovate Corp Cloud Migration', value: 120000, stage: DealStage.NEGOTIATION, close_date_expected: '2024-02-29', ai_health_score: 65, ai_next_best_action: 'Present revised offer with phased implementation.', created_at: '2023-10-15T09:00:00Z', updated_at: '2023-10-21T10:00:00Z', ai_health_score_history: generateHistory(80, 65, 30) },
  { deal_id: 'deal-3', company_id: 'comp-3', deal_name: 'Retail Chain POS System', value: 75000, stage: DealStage.QUALIFYING, close_date_expected: '2024-04-30', ai_health_score: 42, ai_next_best_action: 'Schedule a discovery call to understand requirements.', created_at: '2023-11-10T11:20:00Z', updated_at: '2023-11-10T11:20:00Z', ai_health_score_history: generateHistory(40, 42, 30) },
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

const MOCK_PROPOSALS: Proposal[] = [
    {
        proposal_id: 'prop-1',
        deal_id: 'deal-1',
        version: 1,
        status: ProposalStatus.SENT,
        ai_initial_draft: `**Project: Comprehensive Network Infrastructure Upgrade**\n\n**1. Introduction**\nThis document outlines a proposal for a complete network infrastructure upgrade for The Grand Hotel, designed to address the identified needs for enhanced reliability, security, and performance to elevate the guest experience.\n\n**2. Understanding Your Needs**\nBased on our discovery call, we understand The Grand Hotel's primary challenges include slow guest WiFi, unreliable connectivity in key areas like conference rooms, and outdated network security. These issues pose a risk to guest satisfaction and operational efficiency, especially with the peak season approaching.\n\n**3. Proposed Solution**\nWe propose a phased implementation of a state-of-the-art, unified network solution from Ubiquiti. This includes:\n- High-density WiFi 6 access points for superior guest coverage.\n- A robust, scalable switching infrastructure to eliminate bottlenecks.\n- A next-generation security gateway for threat protection and secure access.\n\n**4. Pricing**\nThe total investment for the proposed solution, including all hardware, installation, and configuration, is $250,000.`,
        sent_at: '2023-11-05T10:00:00Z',
        payment_status: PaymentStatus.NONE,
        created_at: '2023-11-05T09:00:00Z',
        updated_at: '2023-11-05T10:00:00Z',
    }
];


let refresh_counter = 0;
let newInteractionAdded = false;

const getDeals = (): Deal[] => {
    return MOCK_DEALS.map(deal => {
        const relevantInteractionIds = MOCK_INTERACTION_LINKS
            .filter(link => link.deal_id === deal.deal_id)
            .map(link => link.interaction_id);
        
        const latestInteraction = MOCK_INTERACTIONS
            .filter(interaction => relevantInteractionIds.includes(interaction.interaction_id))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            [0]; // Get the most recent one

        return {
            ...deal,
            last_interaction_at: latestInteraction?.timestamp,
        };
    });
};

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
                author: contact ? { name: `${contact.first_name} ${contact.last_name}`, role: contact.role || '', email: contact.email } : { name: 'System', role: 'Notification'},
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

const handleCoPilotResponse = async (prompt: string, deal?: Deal, interactions?: Interaction[]): Promise<string> => {
    let context = '';
    let systemInstruction = '';

    if (deal && interactions) {
        // Deal-specific context
        systemInstruction = `You are an expert sales co-pilot named Goose. You are assisting a sales representative with a specific deal.
Based on the provided deal information, interaction history, and the user's question, provide a helpful and concise response.
Analyze the context and the user's query to give an insightful answer. Do not just repeat the information given.
If the user asks for an action that you can help with (like drafting an email, scheduling a call, creating a task), start your response with a clear action phrase like "Send email:", "Schedule call:", or "Create task:".`;
        context = `Deal: ${deal.deal_name}\nValue: $${deal.value.toLocaleString()}\nCurrent Stage: ${deal.stage}\n\nInteraction History:\n${interactions.slice(0, 5).map(i => `[${new Date(i.timestamp).toLocaleDateString()} - ${i.type}]: ${i.ai_summary || i.content_raw.substring(0, 100)}...`).join('\n')}`;
    } else {
        // Global context
        systemInstruction = `You are "Goose", a helpful AI assistant for a business operating system. You can answer questions about how to use the application, or you can search for information across all business data.
        You have access to the following data:
        - Companies: ${MOCK_COMPANIES.map(c => c.name).join(', ')}
        - Active Deals: ${MOCK_DEALS.map(d => d.deal_name).join(', ')}
        - Contacts: ${MOCK_CONTACTS.map(c => `${c.first_name} ${c.last_name}`).join(', ')}
        
        When asked how to do something in the app, provide clear, step-by-step instructions.
        When asked to find information, query your available data and provide a concise summary.
        For example, if asked about a company, find its deal and last interaction date.`;
        context = `User is asking a question in a global context, not specific to any single deal.`;
    }

    const fullPrompt = `${context}\n\nUser Question: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: fullPrompt,
      config: {
        systemInstruction,
      },
    });
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

const handleDraftEmail = async (suggestion: string, deal: Deal, interactions: Interaction[]): Promise<EmailDraft> => {
    const recipientInteraction = interactions.find(i => i.author?.email);
    const recipient = recipientInteraction?.author;

    if (!recipient?.email) {
        throw new Error("Could not find a contact email for this deal.");
    }
    
    const context = `
        Deal Name: ${deal.deal_name}
        Client Contact: ${recipient.name}
        Suggested action to take: ${suggestion}
        Last interaction: ${interactions[0]?.content_raw || 'N/A'}
    `;

    const prompt = `You are a helpful sales assistant named Goose. Based on the following context, draft a professional and concise email to the client to action the suggestion. The email body should be ready to send and include a placeholder like "[Your Name]" for the sender's signature.
    
    Context:
    ${context}

    Return a valid JSON object with "subject" and "body" keys.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: 'A concise and relevant subject line for the email.' },
            body: { type: Type.STRING, description: "The full body of the email, formatted for clarity, including salutation and a signature placeholder." },
          },
          required: ["subject", "body"],
        },
      },
    });

    const emailContent = JSON.parse(response.text) as { subject: string; body: string };

    return {
        ...emailContent,
        to: recipient.email,
    };
}

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
    // Match proposal ID from path
    const proposalMatch = pathname.match(/^\/api\/proposals\/([a-zA-Z0-9-]+)$/);
    if (proposalMatch && init?.method !== 'POST') {
        const proposalId = proposalMatch[1];
        const proposal = MOCK_PROPOSALS.find(p => p.proposal_id === proposalId);
        if (!proposal) return new Response('Proposal not found', { status: 404 });
        return new Response(JSON.stringify(proposal), { headers: { 'Content-Type': 'application/json' } });
    }

    // --- Proposal Actions ---
    const acceptMatch = pathname.match(/^\/api\/proposals\/([a-zA-Z0-9-]+)\/accept$/);
    if (acceptMatch && init?.method === 'POST') {
        const proposalId = acceptMatch[1];
        const proposal = MOCK_PROPOSALS.find(p => p.proposal_id === proposalId);
        if (!proposal) return new Response('Proposal not found', { status: 404 });
        const { signature } = JSON.parse(init.body as string);
        proposal.status = ProposalStatus.ACCEPTED;
        proposal.signed_at = new Date().toISOString();
        proposal.signature = signature;
        return new Response(JSON.stringify(proposal), { headers: { 'Content-Type': 'application/json' } });
    }
    const payMatch = pathname.match(/^\/api\/proposals\/([a-zA-Z0-9-]+)\/pay$/);
    if (payMatch && init?.method === 'POST') {
        const proposalId = payMatch[1];
        const proposal = MOCK_PROPOSALS.find(p => p.proposal_id === proposalId);
        if (!proposal) return new Response('Proposal not found', { status: 404 });
        proposal.payment_status = PaymentStatus.PAID;
        proposal.status = ProposalStatus.PAID;
        proposal.payment_gateway_tx_id = `mock_tx_${Date.now()}`;
        return new Response(JSON.stringify(proposal), { headers: { 'Content-Type': 'application/json' } });
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
    if (pathname === '/api/copilot-response' && init?.method === 'POST') {
        const { prompt, deal, interactions } = JSON.parse(init.body as string);
        const responseText = await handleCoPilotResponse(prompt, deal, interactions);
        return new Response(JSON.stringify({ response: responseText }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (pathname === '/api/generate-proposal' && init?.method === 'POST') {
         const { deal, interactions } = JSON.parse(init.body as string);
         const proposal = await handleGenerateProposal(deal, interactions);
         return new Response(JSON.stringify(proposal), { headers: { 'Content-Type': 'application/json' } });
    }
    if (pathname === '/api/draft-email' && init?.method === 'POST') {
        const { suggestion, deal, interactions } = JSON.parse(init.body as string);
        const emailDraft = await handleDraftEmail(suggestion, deal, interactions);
        return new Response(JSON.stringify(emailDraft), { headers: { 'Content-Type': 'application/json' } });
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