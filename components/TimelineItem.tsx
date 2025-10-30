
import React, { useState } from 'react';
import type { TimelineEvent } from '../types';
import { TimelineEventType, Sentiment } from '../types';
import { EmailIcon, MeetingIcon, CallIcon, ProposalIcon, NoteIcon, SparklesIcon } from './icons';
import { summarizeText } from '../services/geminiService';

interface TimelineItemProps {
  event: TimelineEvent;
  isLast: boolean;
}

const EventIcon: React.FC<{ type: TimelineEventType }> = ({ type }) => {
  const iconClass = "w-8 h-8 p-1.5 rounded-full bg-brand-gray-700 text-brand-blue";
  switch (type) {
    case TimelineEventType.EMAIL:
      return <EmailIcon className={iconClass} />;
    case TimelineEventType.MEETING:
      return <MeetingIcon className={iconClass} />;
    case TimelineEventType.CALL:
      return <CallIcon className={iconClass} />;
    case TimelineEventType.PROPOSAL:
      return <ProposalIcon className={iconClass} />;
    case TimelineEventType.NOTE:
      return <NoteIcon className={iconClass} />;
    default:
      return null;
  }
};

const getSentimentClasses = (sentiment?: Sentiment) => {
    switch(sentiment) {
        case Sentiment.POSITIVE: return 'border-green-500 bg-green-500/10';
        case Sentiment.NEGATIVE: return 'border-red-500 bg-red-500/10';
        default: return 'border-brand-gray-700 bg-brand-gray-800';
    }
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ event, isLast }) => {
  const [summary, setSummary] = useState(event.summary);
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    if (summary) return;
    setIsLoading(true);
    const generatedSummary = await summarizeText(event.content);
    setSummary(generatedSummary);
    setIsLoading(false);
  };

  return (
    <div className="flex relative">
      <div className="flex flex-col items-center mr-4">
        <EventIcon type={event.type} />
        {!isLast && <div className="w-px h-full bg-brand-gray-700 mt-2"></div>}
      </div>
      <div className={`flex-1 pb-10 ${isLast ? '' : ''}`}>
        <div className={`p-4 rounded-lg border ${getSentimentClasses(event.sentiment)}`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="font-bold text-white">{event.type} with {event.author}</p>
                    <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
                </div>
                {event.sentiment && (
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        event.sentiment === Sentiment.POSITIVE ? 'bg-green-500/20 text-green-300' :
                        event.sentiment === Sentiment.NEGATIVE ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                    }`}>
                        {event.sentiment}
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{event.content}</p>

            {summary && (
                <div className="mt-4 pt-3 border-t border-brand-gray-700">
                    <h4 className="text-sm font-semibold text-brand-blue flex items-center mb-1">
                        <SparklesIcon className="w-4 h-4 mr-1.5"/> AI Cliff's Notes
                    </h4>
                    <p className="text-sm text-gray-400 italic">{summary}</p>
                </div>
            )}
            
            {(event.type === TimelineEventType.EMAIL || event.type === TimelineEventType.MEETING) && !summary && (
                <div className="mt-4 pt-3 border-t border-brand-gray-700">
                    <button
                        onClick={handleSummarize}
                        disabled={isLoading}
                        className="text-sm text-brand-blue hover:text-blue-400 font-semibold disabled:text-gray-500 flex items-center transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-blue mr-2"></div>
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
