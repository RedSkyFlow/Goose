
export enum TimelineEventType {
  EMAIL = 'Email',
  MEETING = 'Meeting',
  CALL = 'Call',
  PROPOSAL = 'Proposal',
  NOTE = 'Note',
}

export enum Sentiment {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative',
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  author: string;
  content: string;
  summary?: string;
  sentiment?: Sentiment;
}

export interface HealthScoreData {
  deal: number;
  client: number;
}

export interface Deal {
  id: string;
  name: string;
  value: number;
  stage: string;
  health: HealthScoreData;
  timeline: TimelineEvent[];
}

export interface Proposal {
  introduction: string;
  clientNeeds: string;
  proposedSolution: string;
  pricing: string;
}
