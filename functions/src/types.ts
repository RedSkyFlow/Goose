// Backend types mirroring the frontend for Type Safety
export enum DealStage {
  PROSPECTING = 'Prospecting',
  QUALIFYING = 'Qualifying',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed-Won',
  CLOSED_LOST = 'Closed-Lost',
}

export interface Interaction {
  interaction_id: string;
  type: string;
  source_identifier: string;
  timestamp: string;
  content_raw: string;
  ai_summary?: string;
  ai_sentiment?: string;
  author?: {
      name: string;
      role: string;
      email?: string;
  };
}

export interface Deal {
  deal_id: string;
  company_id: string;
  deal_name: string;
  stage: DealStage;
  value: number;
  close_date_expected: string;
  ai_health_score: number;
  ai_next_best_action: string;
}
