import React, { useState } from 'react';
import type { Interaction } from '../types';
import { InteractionType, Sentiment } from '../types';
import { EmailIcon, MeetingIcon, CallIcon, ProposalIcon, NoteIcon, SparklesIcon, UserIcon } from './icons';
import { summarizeText } from '../services/geminiService';

interface TimelineItemProps {
  interaction: Interaction;
  isLast: boolean;
}

const EventIcon: React.FC<{ type: InteractionType }> = ({ type }) => {
  const iconClass = "w-8 h-8 p-1.5 rounded-full bg-background text-secondary";
  switch (type) {
    case InteractionType.EMAIL:
      return <EmailIcon className={iconClass} />;
    case InteractionType.MEETING:
      return <MeetingIcon className={iconClass} />;
    case InteractionType.CALL_LOG:
      return <CallIcon className={iconClass} />;
    case InteractionType.PROPOSAL_VIEW:
      return <ProposalIcon className={iconClass} />;
    case InteractionType.NOTE:
      return <NoteIcon className={iconClass} />;
    default:
      return null;
  }
};

const getSentimentClasses = (sentiment?: Sentiment) => {
    switch(sentiment) {
        case Sentiment.POSITIVE: return 'border-accent bg-accent/10';
        case Sentiment.NEGATIVE: return 'border-red-500 bg-red-500/10';
        default: return 'border-primary/50 bg-background-light';
    }
}

const getInteractionTitle = (interaction: Interaction) => {
    const typeText = interaction.type.replace(/_/g, ' ');
    return `${typeText.charAt(0).toUpperCase() + typeText.slice(1).toLowerCase()}`;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ interaction, isLast }) => {
  const [summary, setSummary] = useState(interaction.ai_summary);
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    if (summary) return;
    setIsLoading(true);
    const generatedSummary = await summarizeText(interaction.content_raw);
    setSummary(generatedSummary);
    setIsLoading(false);
  };

  return (
    <div className="flex relative">
      <div className="flex flex-col items-center mr-4">
        <EventIcon type={interaction.type} />
        {!isLast && <div className="w-px h-full bg-primary/50 mt-2"></div>}
      </div>
      <div className={`flex-1 pb-10 ${isLast ? '' : ''}`}>
        <div className={`p-4 rounded-lg border ${getSentimentClasses(interaction.ai_sentiment)}`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="font-bold text-foreground">{getInteractionTitle(interaction)}</p>
                    <p className="text-xs text-foreground/70">{new Date(interaction.timestamp).toLocaleString()}</p>
                     {interaction.author && (
                        <div className="flex items-center text-xs text-foreground/70 mt-1">
                            <UserIcon className="w-4 h-4 mr-1.5" />
                            <span>{interaction.author.name}</span>
                        </div>
                    )}
                </div>
                {interaction.ai_sentiment && (
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        interaction.ai_sentiment === Sentiment.POSITIVE ? 'bg-accent/20 text-accent' :
                        interaction.ai_sentiment === Sentiment.NEGATIVE ? 'bg-red-500/20 text-red-300' :
                        'bg-primary/20 text-primary'
                    }`}>
                        {interaction.ai_sentiment}
                    </span>
                )}
            </div>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{interaction.content_raw}</p>

            {summary && (
                <div className="mt-4 pt-3 border-t border-primary/20">
                    <h4 className="text-sm font-semibold text-secondary flex items-center mb-1">
                        <SparklesIcon className="w-4 h-4 mr-1.5"/> AI Cliff's Notes
                    </h4>
                    <p className="text-sm text-foreground/70 italic">{summary}</p>
                </div>
            )}
            
            {(interaction.type === InteractionType.EMAIL || interaction.type === InteractionType.MEETING) && !summary && (
                <div className="mt-4 pt-3 border-t border-primary/20">
                    <button
                        onClick={handleSummarize}
                        disabled={isLoading}
                        className="text-sm text-secondary hover:opacity-80 font-semibold disabled:text-foreground/40 flex items-center transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary mr-2"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-4 h-4 mr-1.5" />
                                Generate Summary
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};