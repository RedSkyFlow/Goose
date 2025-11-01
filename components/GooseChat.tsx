import React, { useState, useCallback, useMemo } from 'react';
import type { Deal, Interaction } from '../types';
import { getNextBestAction, draftEmail, getCoPilotResponse } from '../services/geminiService';
import { SendIcon, RefreshIcon, TaskIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';

interface GooseChatProps {
  deal?: Deal;
  interactions?: Interaction[];
}

export const GooseChat: React.FC<GooseChatProps> = ({ deal, interactions }) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const { showToast } = useNotification();
  
  const isDealContext = !!deal;

  const handleFetch = useCallback(async (currentPrompt: string) => {
    setIsLoading(true);
    setSuggestion('');
    setError('');

    try {
      let result: string;
      if (isDealContext && currentPrompt === "What's my next best action?") {
        result = await getNextBestAction(deal, interactions!);
      } else {
        result = await getCoPilotResponse(currentPrompt, deal, interactions);
      }
      setSuggestion(result);
    } catch (err) {
      console.error(err);
      setError('Sorry, I encountered an error getting a response.');
      setSuggestion('');
    } finally {
      setIsLoading(false);
    }
  }, [deal, interactions, isDealContext]);

  const defaultQuery = isDealContext ? "What's my next best action?" : "How can I help you today?";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = prompt.trim() || defaultQuery;
    setPrompt(''); // Clear input after sending
    handleFetch(query);
  };

  const handleTryAgain = useCallback(() => {
    handleFetch("What's my next best action?");
  }, [handleFetch]);

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
    if (!suggestion || !deal || !interactions) return;

    if (actionType === 'CREATE_TASK') {
        try {
            await navigator.clipboard.writeText(suggestion);
            showToast('Task copied to clipboard!');
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

  const getAcceptButtonTextAndTitle = () => {
    switch(actionType) {
        case 'DRAFT_EMAIL': return { text: 'Draft Email', title: 'Open a pre-filled email draft in your default mail client' };
        case 'SCHEDULE_CALL': return { text: 'Schedule Call', title: 'Open a pre-filled Google Calendar invite' };
        case 'CREATE_TASK': return { text: 'Add Task', title: 'Copy the task description to your clipboard' };
        default: return { text: 'Accept', title: 'Accept the suggestion' };
    }
  }
  
  const isActionable = (actionType === 'DRAFT_EMAIL' || actionType === 'SCHEDULE_CALL' || actionType === 'CREATE_TASK') && isDealContext;
  const { text: acceptButtonText, title: acceptButtonTitle } = getAcceptButtonTextAndTitle();

  const initialMessage = isDealContext 
    ? "Ask a question or send an empty message for your next best action."
    : "How can I help you navigate the app or find information?";

  return (
    <>
      <div className="bg-background rounded-lg p-3 min-h-[120px] text-foreground/80 text-sm flex flex-col justify-center">
        {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
            </div>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : suggestion ? (
          <div className="flex flex-col h-full justify-between">
            <p className="flex-grow whitespace-pre-wrap">{suggestion}</p>
            {isDealContext && (
                <div className="mt-4 flex items-center justify-end space-x-2 border-t border-primary/20 pt-3">
                <button
                    onClick={handleTryAgain}
                    disabled={isActionInProgress}
                    className="px-3 py-2 text-xs font-semibold rounded-md transition-colors bg-primary/20 text-foreground/80 hover:bg-primary/40 disabled:opacity-50 flex items-center"
                    aria-label="Get another suggestion"
                    title="Ask Goose for another suggestion"
                >
                    <RefreshIcon className="w-4 h-4 mr-1.5"/>
                    Try Again
                </button>
                <button
                    onClick={handleAcceptSuggestion}
                    disabled={isActionInProgress || !isActionable}
                    className="px-3 py-2 text-xs font-semibold rounded-md transition-colors bg-secondary text-white hover:opacity-90 disabled:bg-secondary/50 disabled:cursor-not-allowed flex items-center"
                    title={acceptButtonTitle}
                >
                    {isActionInProgress ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Working...
                        </>
                    ) : (
                        <>
                        {actionType === 'CREATE_TASK' ? <TaskIcon className="w-4 h-4 mr-1.5" /> : <SendIcon className="w-4 h-4 mr-1.5"/>}
                        {acceptButtonText}
                        </>
                    )}
                </button>
                </div>
            )}
          </div>
        ) : (
          <p>{initialMessage}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
        <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-grow bg-background text-foreground placeholder-foreground/50 p-2 rounded-md border border-primary/50 focus:ring-2 focus:ring-secondary focus:outline-none disabled:opacity-50"
            placeholder={isDealContext ? "Ask about this deal..." : "Ask Goose anything..."}
            disabled={isLoading}
        />
        <button
            type="submit"
            disabled={isLoading}
            className="bg-secondary hover:opacity-90 disabled:bg-secondary/50 text-white font-bold py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
            aria-label="Get suggestion"
            title="Send your message to Goose"
        >
            <SendIcon className="w-5 h-5"/>
        </button>
      </form>
    </>
  );
};