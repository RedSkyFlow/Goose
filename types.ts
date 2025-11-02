// Core CRM Entities

export type ItemStatus = 'hot' | 'at_risk' | 'key_decision_maker';

export interface Company {
  company_id: string; // UUID (PK)
  name: string;
  domain: string;
  industry: string;
  ai_summary: string;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  status?: ItemStatus;
}

export type NewCompany = Omit<Company, 'company_id' | 'created_at' | 'updated_at' | 'ai_summary' | 'status'>;

export interface Contact {
  contact_id: string; // UUID (PK)
  company_id: string; // UUID (FK)
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role?: string;
  ai_persona_summary?: string;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  status?: ItemStatus;
}

export type NewContact = Omit<Contact, 'contact_id' | 'created_at' | 'updated_at' | 'ai_persona_summary' | 'status'>;

export enum DealStage {
  PROSPECTING = 'Prospecting',
  QUALIFYING = 'Qualifying',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed-Won',
  CLOSED_LOST = 'Closed-Lost',
}

export interface Deal {
  deal_id: string; // UUID (PK)
  company_id: string; // UUID (FK)
  deal_name: string;
  stage: DealStage;
  value: number; // DECIMAL
  close_date_expected: string; // DATE
  ai_health_score: number; // INTEGER (0-100)
  ai_next_best_action: string;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  last_interaction_at?: string; // TIMESTAMPTZ
  ai_health_score_history?: { date: string; score: number }[];
}

// The AI Context Engine

export enum InteractionType {
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  CALL_LOG = 'CALL_LOG',
  NOTE = 'NOTE',
  PROPOSAL_VIEW = 'PROPOSAL_VIEW',
}

export enum Sentiment {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE',
}

export interface Interaction {
  interaction_id: string; // UUID (PK)
  type: InteractionType;
  source_identifier: string;
  timestamp: string; // TIMESTAMPTZ
  content_raw: string;
  ai_summary?: string;
  ai_sentiment?: Sentiment;
  created_at: string; // TIMESTAMPTZ
  // For UI purposes, we'll add author info
  author?: {
    name: string;
    role: string;
    email?: string;
  }
}

export interface InteractionLink {
  interaction_id: string; // UUID (FK)
  contact_id?: string; // UUID (FK, Nullable)
  deal_id?: string; // UUID (FK, Nullable)
  company_id: string; // UUID (FK)
}

// Proposal Generator Module

export enum ProposalStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    VIEWED = 'VIEWED',
    ACCEPTED = 'ACCEPTED',
    PAID = 'PAID',
    EXPIRED = 'EXPIRED',
}

export enum PaymentStatus {
    NONE = 'NONE',
    PENDING = 'PENDING',
    PAID = 'PAID',
}

export interface Proposal {
    proposal_id: string; // UUID (PK)
    deal_id: string; // UUID (FK)
    version: number;
    status: ProposalStatus;
    public_share_url?: string;
    content: GeneratedProposalContent; // Replaces ai_initial_draft
    final_content?: string; // Could store the state upon acceptance
    sent_at?: string; // TIMESTAMPTZ
    signed_at?: string; // TIMESTAMPTZ
    signature?: string; // Name of the signer
    payment_status: PaymentStatus;
    payment_gateway_tx_id?: string;
    final_accepted_value?: number;
    created_at: string; // TIMESTAMPTZ
    updated_at: string; // TIMESTAMPTZ
}

export enum ProposalTrackEvent {
    VIEW = 'VIEW',
    COMMENT = 'COMMENT',
    FORWARD = 'FORWARD',
    SIGNATURE_ATTEMPT = 'SIGNATURE_ATTEMPT',
    PAYMENT_ATTEMPT = 'PAYMENT_ATTEMPT',
}

export interface ProposalTracking {
    track_id: string; // UUID (PK)
    proposal_id: string; // UUID (FK)
    timestamp: string; // TIMESTAMPTZ
    event_type: ProposalTrackEvent;
    viewer_email?: string;
    viewer_ip_address?: string;
}

// For AI Generation of Interactive Proposals

export interface ProposalItem {
    id: string; // e.g., 'item-1'
    name: string; // e.g., "High-Density WiFi 6 Access Points"
    description: string;
    features: string[]; // List of key features
    price: number;
    type: 'one-time' | 'recurring';
    quantity: number;
}

export interface ROIProjection {
    metric: string; // e.g., "Reduction in Guest Complaints"
    value: string; // e.g., "Up to 40%"
    description: string;
}

export interface GeneratedProposalContent {
    proposalTitle: string;
    clientName: string;
    executiveSummary: string;
    clientChallenges: string;
    solutionItems: ProposalItem[];
    roiProjections: ROIProjection[];
    termsAndConditions: string;
}

export interface EmailDraft {
    subject: string;
    body: string;
    to: string;
}

// Support Hub Module

export enum SupportTicketStatus {
    OPEN = 'OPEN',
    PENDING = 'PENDING',
    CLOSED = 'CLOSED',
}

export interface SupportTicket {
    ticket_id: string; // UUID (PK)
    contact_id: string; // UUID (FK)
    status: SupportTicketStatus;
    subject: string;
    interaction_ids: string[]; // Array of interaction UUIDs
    created_at: string; // TIMESTAMPTZ
    updated_at: string; // TIMESTAMPTZ
}

export type NewSupportTicket = Omit<SupportTicket, 'ticket_id' | 'created_at' | 'updated_at' | 'status' | 'interaction_ids'> & { initial_message: string };

// Marketing Hub Module

export interface TechStackItem {
    name: string;
    category: 'CMS' | 'Analytics' | 'Marketing Automation' | 'CRM' | 'Other';
    description: string;
}

export interface ProspectContact {
    name: string;
    role: string;
    linkedin_url?: string;
    ai_outreach_suggestion: string;
}

export interface RecentNews {
    title: string;
    url: string;
    published_date: string; // DATE
    summary: string;
}

export interface ProspectProfile {
    domain: string;
    company_name: string;
    summary: string;
    industry: string;
    talking_points: string[];
    tech_stack: TechStackItem[];
    key_contacts: ProspectContact[];
    recent_news: RecentNews[];
}

export interface GeneratedLead {
    company_name: string;
    domain: string;
}
