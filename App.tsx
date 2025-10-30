import React, { useState, useMemo } from 'react';
import type { Deal, Company, Contact, Interaction, InteractionLink } from './types';
import { DealStage, InteractionType, Sentiment } from './types';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { RightSidebar } from './components/RightSidebar';

// --- MOCK DATABASE BASED ON CORE DATA MODEL ---

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
  {
    deal_id: 'deal-1',
    company_id: 'comp-1',
    deal_name: 'The Grand Hotel Network Upgrade',
    value: 250000,
    stage: DealStage.PROPOSAL,
    close_date_expected: '2024-03-31',
    ai_health_score: 85,
    ai_next_best_action: 'Follow up on proposal feedback by end of week.',
    created_at: '2023-10-26T10:00:00Z',
    updated_at: '2023-11-05T11:00:00Z',
  },
  {
    deal_id: 'deal-2',
    company_id: 'comp-2',
    deal_name: 'Innovate Corp Cloud Migration',
    value: 120000,
    stage: DealStage.NEGOTIATION,
    close_date_expected: '2024-02-29',
    ai_health_score: 65,
    ai_next_best_action: 'Present revised offer with phased implementation.',
    created_at: '2023-10-15T09:00:00Z',
    updated_at: '2023-10-21T10:00:00Z',
  },
  {
    deal_id: 'deal-3',
    company_id: 'comp-3',
    deal_name: 'Retail Chain POS System',
    value: 75000,
    stage: DealStage.QUALIFYING,
    close_date_expected: '2024-04-30',
    ai_health_score: 42,
    ai_next_best_action: 'Schedule a discovery call to understand requirements.',
    created_at: '2023-11-10T11:20:00Z',
    updated_at: '2023-11-10T11:20:00Z',
  },
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
    { interaction_id: 'int-3', deal_id: 'deal-1', company_id: 'comp-1', contact_id: 'cont-4' },
    { interaction_id: 'int-4', deal_id: 'deal-2', company_id: 'comp-2', contact_id: 'cont-2' },
    { interaction_id: 'int-5', deal_id: 'deal-2', company_id: 'comp-2', contact_id: 'cont-5' },
    { interaction_id: 'int-6', deal_id: 'deal-2', company_id: 'comp-2', contact_id: 'cont-5' },
    { interaction_id: 'int-7', deal_id: 'deal-3', company_id: 'comp-3', contact_id: 'cont-3' },
];

// --- APP COMPONENT ---

function App() {
  const [deals] = useState<Deal[]>(MOCK_DEALS);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(deals[0]);

  const selectedDealInteractions = useMemo(() => {
    if (!selectedDeal) return [];

    const relevantLinks = MOCK_INTERACTION_LINKS.filter(link => link.deal_id === selectedDeal.deal_id);
    const interactionIds = new Set(relevantLinks.map(link => link.interaction_id));
    
    return MOCK_INTERACTIONS
        .filter(interaction => interactionIds.has(interaction.interaction_id))
        .map(interaction => {
            const link = relevantLinks.find(l => l.interaction_id === interaction.interaction_id);
            const contact = MOCK_CONTACTS.find(c => c.contact_id === link?.contact_id);
            return {
                ...interaction,
                author: contact ? { name: `${contact.first_name} ${contact.last_name}`, role: contact.role || '' } : undefined,
            };
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  }, [selectedDeal]);

  const handleSelectDeal = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  return (
    <div className="flex h-screen w-full font-sans">
      <Sidebar deals={deals} selectedDeal={selectedDeal} onSelectDeal={handleSelectDeal} />
      <MainContent deal={selectedDeal} interactions={selectedDealInteractions} />
      <RightSidebar deal={selectedDeal} interactions={selectedDealInteractions} />
    </div>
  );
}

export default App;
