// Core CRM Entities

export interface Company {
  company_id: string; // UUID (PK)
  name: string;
  domain: string;
  industry: string;
  ai_summary: string;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

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
}

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
    google_doc_id?: string;
    public_share_url?: string;
    ai_initial_draft: string;
    final_content?: string;
    sent_at?: string; // TIMESTAMPTZ
    signed_at?: string; // TIMESTAMPTZ
    payment_status: PaymentStatus;
    payment_gateway_tx_id?: string;
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

// For AI Generation
export interface GeneratedProposalContent {
    introduction: string;
    clientNeeds: string;
    proposedSolution: string;
    pricing: string;
}
