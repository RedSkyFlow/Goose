import React, { useState, useCallback, useMemo } from 'react';
import type { Deal, Interaction } from '../types';
import { getNextBestAction, draftEmail } from '../services/geminiService';
import { SparklesIcon, SendIcon, RefreshIcon, TaskIcon } from './icons';

interface CoPilotProps {
  deal: Deal;
  interactions: Interaction[];
  setToastMessage: (message: string) => void;
}

export const CoPilot: React.FC<CoPilotProps> = ({ deal, interactions, setToastMessage }) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [prompt, setPrompt] = useState<string>("What's my next best action?");

  const handleGetSuggestion = useCallback(async () => {
    if (!deal) return;
    setIsLoading(true);
    setSuggestion('');
    setError('');
    try {
      const result = await getNextBestAction(deal, interactions);
      setSuggestion(result);
    } catch (err) {
      console.error(err);
      setError('Sorry, I encountered an error getting a suggestion.');
      setSuggestion('');
    } finally {
      setIsLoading(false);
    }
  }, [deal, interactions]);

  // Determine action type from suggestion text
  const actionType = useMemo(() => {
    if (!suggestion) return null;
    const lowerSuggestion = suggestion.toLowerCase();
    if (lowerSuggestion.includes('email') || lowerSuggestion.includes('follow up')) {
      return 'DRAFT_EMAIL';
    }
    if (lowerSuggestion.includes('call') || lowerSuggestion.includes('schedule a meeting')) {
        return 'SCHEDULE_CALL';
    }
    if (lowerSuggestion.includes('task') || lowerSuggestion.includes('to-do')) {
        return 'CREATE_TASK';
    }
    return 'GENERIC_ACCEPT';
  }, [suggestion]);


  const handleAcceptSuggestion = async () => {
    if (!suggestion) return;

    if (actionType === 'CREATE_TASK') {
        try {
            await navigator.clipboard.writeText(suggestion);
            setToastMessage('Task copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            setError('Could not copy task to clipboard.');
        }
        return;
    }

    if (actionType === 'DRAFT_EMAIL') {
        setIsActionInProgress(true);
        setError('');
        try {
            const emailContent = await draftEmail(suggestion, deal, interactions);
            const subject = encodeURIComponent(emailContent.subject);
            const body = encodeURIComponent(emailContent.body);
            const mailtoLink = `mailto:${emailContent.to}?subject=${subject}&body=${body}`;
            window.location.href = mailtoLink;
        } catch (err) {
            console.error(err);
            setError('Could not draft the email. Please try again.');
        } finally {
            setIsActionInProgress(false);
        }
    } else if (actionType === 'SCHEDULE_CALL') {
        const recipientInteraction = interactions.find(i => i.author?.email);
        const recipient = recipientInteraction?.author;

        const calendarLink = new URL('https://calendar.google.com/calendar/render');
        calendarLink.searchParams.set('action', 'TEMPLATE');
        calendarLink.searchParams.set('text', `Call with ${deal.deal_name}`);
        calendarLink.searchParams.set('details', `Follow-up call based on Goose suggestion:\n\n"${suggestion}"`);
        
        if (recipient?.email) {
            calendarLink.searchParams.set('add', recipient.email);
        }

        // Set a default time for tomorrow at 10 AM for 30 mins
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        
        const startTime = tomorrow.toISOString().replace(/-|:|\.\d{3}/g, '');

        tomorrow.setMinutes(tomorrow.getMinutes() + 30);
        const endTime = tomorrow.toISOString().replace(/-|:|\.\d{3}/g, '');

        calendarLink.searchParams.set('dates', `${startTime}/${endTime}`);

        window.open(calendarLink.toString(), '_blank');
    }
  };

  const getAcceptButtonText = () => {
    switch(actionType) {
        case 'DRAFT_EMAIL': return 'Draft Email';
        case 'SCHEDULE_CALL': return 'Schedule Call';
        case 'CREATE_TASK': return 'Add Task';
        default: return 'Accept';
    }
  }
  
  const isActionable = actionType === 'DRAFT_EMAIL' || actionType === 'SCHEDULE_CALL' || actionType === 'CREATE_TASK';

  return (
    <div className="bg-background-light p-4 rounded-lg mt-6">
      <h3 className="text-lg font-bold flex items-center mb-4">
        <SparklesIcon className="w-6 h-6 mr-2 text-secondary" />
        Goose
      </h3>
      <div className="bg-background rounded-lg p-3 min-h-[100px] text-foreground/80 text-sm flex flex-col justify-center">
        {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
            </div>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : suggestion ? (
          <p>{suggestion}</p>
        ) : (
          <p>Ask Goose for a suggestion to get started.</p>
        )}
      </div>

      {suggestion && !isLoading && !error && (
        <div className="mt-4 flex items-center justify-end space-x-2">
            <button
                onClick={handleGetSuggestion}
                disabled={isActionInProgress}
                className="px-3 py-2 text-xs font-semibold rounded-md transition-colors bg-primary/20 text-foreground/80 hover:bg-primary/40 disabled:opacity-50 flex items-center"
                aria-label="Get another suggestion"
            >
                <RefreshIcon className="w-4 h-4 mr-1.5"/>
                Try Again
            </button>
            <button
                onClick={handleAcceptSuggestion}
                disabled={isActionInProgress || !isActionable}
                className="px-3 py-2 text-xs font-semibold rounded-md transition-colors bg-secondary text-white hover:opacity-90 disabled:bg-secondary/50 disabled:cursor-not-allowed flex items-center"
            >
                {isActionInProgress ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Working...
                    </>
                ) : (
                   <>
                     {actionType === 'CREATE_TASK' ? <TaskIcon className="w-4 h-4 mr-1.5" /> : <SendIcon className="w-4 h-4 mr-1.5"/>}
                     {getAcceptButtonText()}
                   </>
                )}
            </button>
        </div>
      )}

      {(!suggestion && !isLoading) && (
         <div className="mt-4 flex items-center space-x-2">
            <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-grow bg-background text-foreground placeholder-foreground/50 p-2 rounded-md border border-primary focus:ring-2 focus:ring-secondary focus:outline-none"
                placeholder="Ask a question..."
                disabled={true}
            />
            <button
            onClick={handleGetSuggestion}
            disabled={isLoading}
            className="bg-secondary hover:opacity-90 disabled:bg-secondary/50 text-white font-bold py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
            aria-label="Get suggestion"
            >
            {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
                <SendIcon className="w-5 h-5"/>
            )}
            </button>
        </div>
      )}
    </div>
  );
};