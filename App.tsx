
import React, { useState } from 'react';
import type { Deal } from './types';
import { TimelineEventType, Sentiment } from './types';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { RightSidebar } from './components/RightSidebar';

const MOCK_DEALS: Deal[] = [
  {
    id: 'deal-1',
    name: 'The Grand Hotel Network Upgrade',
    value: 250000,
    stage: 'Proposal Sent',
    health: { deal: 85, client: 92 },
    timeline: [
      {
        id: 'evt-1',
        type: TimelineEventType.MEETING,
        timestamp: '2023-10-26T10:00:00Z',
        author: 'John Doe (Client)',
        content: 'Initial discovery call with the IT Director. Key pain points identified: slow guest WiFi, frequent outages in conference rooms, and outdated security protocols. They need a full network overhaul before the summer tourist season. Expressed strong interest in our managed services.',
        sentiment: Sentiment.POSITIVE,
      },
      {
        id: 'evt-2',
        type: TimelineEventType.EMAIL,
        timestamp: '2023-10-28T14:30:00Z',
        author: 'Sarah Jenkins (Sales)',
        content: `Subject: Following up on our call\n\nHi John,\n\nGreat speaking with you the other day. I've attached a preliminary overview of our proposed solution based on your requirements. Let me know if you have any questions before I put together the full formal proposal.\n\nBest,\nSarah`,
        sentiment: Sentiment.NEUTRAL,
      },
      {
        id: 'evt-3',
        type: TimelineEventType.PROPOSAL,
        timestamp: '2023-11-05T11:00:00Z',
        author: 'Sarah Jenkins (Sales)',
        content: 'Sent the full proposal document covering a complete Ubiquiti network stack, including new access points, switches, and a security gateway. Pricing is set at $250,000 for hardware and installation.',
      },
    ],
  },
  {
    id: 'deal-2',
    name: 'Innovate Corp Cloud Migration',
    value: 120000,
    stage: 'Negotiation',
    health: { deal: 65, client: 75 },
    timeline: [
      {
        id: 'evt-4',
        type: TimelineEventType.EMAIL,
        timestamp: '2023-10-15T09:00:00Z',
        author: 'Michael Chen (Client)',
        content: 'Inquiry about our cloud migration services. They are currently on-prem and facing high maintenance costs.',
        sentiment: Sentiment.NEUTRAL,
      },
      {
        id: 'evt-5',
        type: TimelineEventType.CALL,
        timestamp: '2023-10-20T16:00:00Z',
        author: 'Emily White (Account Manager)',
        content: 'Call with Michael. He\'s concerned about the budget and the timeline. He needs the migration completed by Q1 next year. He seems hesitant about the price.',
        sentiment: Sentiment.NEGATIVE,
        summary: 'Client is budget-conscious and has a firm deadline of Q1. Price is a potential obstacle.'
      },
       {
        id: 'evt-6',
        type: TimelineEventType.NOTE,
        timestamp: '2023-10-21T10:00:00Z',
        author: 'Emily White (Account Manager)',
        content: 'Internal note: Need to prepare a revised offer with a phased approach to make the cost more manageable. Will highlight long-term TCO savings.',
      },
    ],
  },
  {
    id: 'deal-3',
    name: 'Retail Chain POS System',
    value: 75000,
    stage: 'Lead',
    health: { deal: 42, client: 60 },
    timeline: [
       {
        id: 'evt-7',
        type: TimelineEventType.EMAIL,
        timestamp: '2023-11-10T11:20:00Z',
        author: 'David Ortiz (Client)',
        content: `Hi, \n\nWe're looking for a new Point-of-Sale system for our 15 retail locations. Can you send over some information? \n\nThanks, \nDavid`,
        sentiment: Sentiment.NEUTRAL,
      },
    ]
  },
];

function App() {
  const [deals] = useState<Deal[]>(MOCK_DEALS);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(deals[0]);

  const handleSelectDeal = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  return (
    <div className="flex h-screen w-full font-sans">
      <Sidebar deals={deals} selectedDeal={selectedDeal} onSelectDeal={handleSelectDeal} />
      <MainContent deal={selectedDeal} />
      <RightSidebar deal={selectedDeal} />
    </div>
  );
}

export default App;
