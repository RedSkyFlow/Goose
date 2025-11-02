import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { Deal, Interaction, Company, Contact, SupportTicket, ProspectProfile } from '../types';
import { getCoPilotResponse, draftEmail } from '../services/geminiService';
import { SendIcon, TaskIcon, LightBulbIcon, EmailIcon, NoteIcon } from './icons';
import { useNotification } from '../contexts/NotificationContext';
import { MarkdownContent } from './shared/MarkdownContent';

interface GooseChatProps {
  deal?: Deal;
  company?: Company;
  contact?: Contact;
  ticket?: SupportTicket;
  prospect?: ProspectProfile;
  interactions?: Interaction[];
}

type View = 'summary' | 'chat';

const Spinner: React.FC = () => (
    <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
    </div>
);

const QuickActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; title?: string }> = ({ onClick, children, title }) => (
    <button
        onClick={onClick}
        title={title}
        className="flex items-center text-left w-full p-2.5 rounded-md bg-primary/20 text-foreground/80 hover:bg-primary/40 transition-colors text-sm"
    >
        {children}
    </button>
);

export const GooseChat: React.FC<GooseChatProps> = ({ deal, company, contact, ticket, prospect, interactions }) => {
    const [view, setView] = useState<View>('summary');
    const [summary, setSummary] = useState('');
    const [chatResponse, setChatResponse] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);
    const [isLoadingResponse, setIsLoadingResponse] = useState(false);
    const [isActionInProgress, setIsActionInProgress] = useState(false);
    const [error, setError] = useState('');
    const [prompt, setPrompt] = useState('');
    const { showToast } = useNotification();

    const contextObject = useMemo(() => ({ deal, company, contact, ticket, prospect }), [deal, company, contact, ticket, prospect]);

    const handleApiResponse = useCallback(async (currentPrompt: string, context: any) => {
        try {
            const result = await getCoPilotResponse(currentPrompt, context);
            return { data: result, error: null };
        } catch (err) {
            console.error(err);
            const errorMessage = `Sorry, I encountered an error. Please try again.`;
            setError(errorMessage);
            return { data: null, error: errorMessage };
        }
    }, []);

    useEffect(() => {
        const generateSummary = async () => {
            if (!contextObject.deal && !contextObject.company && !contextObject.contact && !contextObject.ticket && !contextObject.prospect) {
                setSummary('Select an item to see an AI-powered summary and quick actions.');
                setIsLoadingSummary(false);
                return;
            }

            setIsLoadingSummary(true);
            setError('');
            setChatResponse('');
            setView('summary');
            
            const contextType = deal ? 'DEAL' : company ? 'COMPANY' : contact ? 'CONTACT' : ticket ? 'TICKET' : prospect ? 'PROSPECT' : null;
            if (!contextType) {
                setIsLoadingSummary(false);
                return;
            }
            const summaryPrompt = `GENERATE_SUMMARY:${contextType}`;
            
            const { data } = await handleApiResponse(summaryPrompt, { ...contextObject, interactions });
            if (data) {
                setSummary(data);
            }
            setIsLoadingSummary(false);
        };

        generateSummary();
    }, [contextObject, interactions, handleApiResponse, deal, company, contact, ticket, prospect]);

    const handleQuickAction = useCallback(async (actionPrompt: string) => {
        setView('chat');
        setIsLoadingResponse(true);
        setChatResponse('');
        setError('');

        const { data } = await handleApiResponse(actionPrompt, { ...contextObject, interactions });
        if (data) {
            setChatResponse(data);
        }
        setIsLoadingResponse(false);
    }, [handleApiResponse, contextObject, interactions]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const query = prompt.trim();
        if (!query) return;

        setView('chat');
        setIsLoadingResponse(true);
        setChatResponse('');
        setPrompt('');
        setError('');

        handleApiResponse(query, { ...contextObject, interactions }).then(({ data }) => {
            if (data) setChatResponse(data);
            setIsLoadingResponse(false);
        });
    };
    
    const actionType = useMemo(() => {
        if (!chatResponse) return null;
        const lowerResponse = chatResponse.toLowerCase();
        if (lowerResponse.includes('email') || lowerResponse.includes('follow up')) return 'DRAFT_EMAIL';
        if (lowerResponse.includes('task') || lowerResponse.includes('to-do')) return 'CREATE_TASK';
        return 'GENERIC';
    }, [chatResponse]);

    const handleExecuteAction = async () => {
        if (!chatResponse || !deal || !interactions) return;
    
        setIsActionInProgress(true);
        setError('');
        try {
            if (actionType === 'DRAFT_EMAIL') {
                const email = await draftEmail(chatResponse, deal, interactions);
                const mailto = `mailto:${email.to}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
                window.location.href = mailto;
            } else if (actionType === 'CREATE_TASK') {
                await navigator.clipboard.writeText(chatResponse);
                showToast('Task copied to clipboard!');
            }
        } catch (err) {
            console.error(err);
            setError(`Could not execute action. Please try again.`);
        } finally {
            setIsActionInProgress(false);
        }
    };

    const getQuickActions = () => {
        if (prospect) return [
            { icon: <EmailIcon className="w-5 h-5 mr-3 text-secondary"/>, label: 'Draft Cold Email', prompt: "Draft a personalized cold outreach email to this prospect based on their profile.", title: "Generate a draft email to the prospect" },
            { icon: <LightBulbIcon className="w-5 h-5 mr-3 text-secondary"/>, label: 'Generate Content Idea', prompt: "Suggest a blog post title that would appeal to this prospect.", title: "Get a content idea tailored to this prospect" },
        ];
        if (deal) return [
            { icon: <LightBulbIcon className="w-5 h-5 mr-3 text-secondary"/>, label: 'Smart Suggestion', prompt: "What is the single best action I can take right now?", title: "Get an AI-powered suggestion for your next best action" },
            { icon: <EmailIcon className="w-5 h-5 mr-3 text-secondary"/>, label: 'Draft Follow-up Email', prompt: "Draft a follow-up email based on the last interaction.", title: "Generate a draft email to the client" },
            { icon: <NoteIcon className="w-5 h-5 mr-3 text-secondary"/>, label: 'Summarize Timeline', prompt: "Summarize the key events in this deal's timeline.", title: "Get a bulleted summary of all interactions" },
        ];
        if (ticket) return [
            { icon: <EmailIcon className="w-5 h-5 mr-3 text-secondary"/>, label: 'Draft a Reply', prompt: "Draft a helpful and empathetic reply to the customer.", title: "Generate a draft reply to send to the customer" },
            { icon: <NoteIcon className="w-5 h-5 mr-3 text-secondary"/>, label: 'Summarize Thread', prompt: "Summarize this support thread in 3 bullet points.", title: "Get a quick summary of the support conversation" },
            { icon: <TaskIcon className="w-5 h-5 mr-3 text-secondary"/>, label: 'Suggest KB Article', prompt: "Based on the issue, suggest a relevant knowledgebase article title I could send them.", title: "Get a suggestion for a helpful article" },
        ];
        if (company || contact) return [
             { icon: <LightBulbIcon className="w-5 h-5 mr-3 text-secondary"/>, label: 'Identify Key People', prompt: "Based on the interactions, who are the key decision-makers and influencers at this company?", title: "Find the most important contacts" },
             { icon: <EmailIcon className="w-5 h-5 mr-3 text-secondary"/>, label: 'Draft Outreach Email', prompt: "Draft a concise outreach email to this person or company.", title: "Generate a cold outreach email draft" },
        ];
        return [];
    };

    const contextName = deal ? 'deal' : company ? 'company' : contact ? 'contact' : ticket ? 'ticket' : prospect ? 'prospect' : null;

    return (
        <div className="flex flex-col h-full">
            <div className="bg-background rounded-lg p-3 text-foreground/80 text-sm flex-grow flex flex-col min-h-[150px]">
                {error ? (
                    <div className="text-red-400 p-2">{error}</div>
                ) : view === 'summary' ? (
                    isLoadingSummary ? <Spinner /> : (
                        <div className="flex flex-col justify-between h-full">
                            <div className="flex-grow overflow-y-auto pr-2">
                                <MarkdownContent content={summary} />
                            </div>
                            <div className="space-y-2 mt-4 pt-3 border-t border-primary/20">
                                {getQuickActions().map(action => (
                                    <QuickActionButton key={action.label} onClick={() => handleQuickAction(action.prompt)} title={action.title}>
                                        {action.icon} {action.label}
                                    </QuickActionButton>
                                ))}
                            </div>
                        </div>
                    )
                ) : ( // Chat view
                    isLoadingResponse ? <Spinner /> : (
                        <div className="flex flex-col justify-between h-full">
                           <div className="flex-grow overflow-y-auto pr-2">
                                <MarkdownContent content={chatResponse} />
                           </div>
                           <div className="mt-4 flex items-center justify-end space-x-2 border-t border-primary/20 pt-3">
                                <button onClick={() => setView('summary')} className="px-3 py-2 text-xs font-semibold rounded-md transition-colors bg-primary/20 text-foreground/80 hover:bg-primary/40">
                                    Back to Summary
                                </button>
                                {deal && (actionType === 'DRAFT_EMAIL' || actionType === 'CREATE_TASK') && (
                                    <button onClick={handleExecuteAction} disabled={isActionInProgress} className="px-3 py-2 text-xs font-semibold rounded-md transition-colors bg-secondary text-white hover:opacity-90 disabled:bg-secondary/50 flex items-center">
                                        {isActionInProgress ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Working...</> : (
                                            actionType === 'DRAFT_EMAIL' ? 'Draft Email' : 'Copy Task'
                                        )}
                                    </button>
                                )}
                           </div>
                        </div>
                    )
                )}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
                <input 
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-grow bg-background text-foreground placeholder-foreground/50 p-2 rounded-md border border-primary/50 focus:ring-2 focus:ring-secondary focus:outline-none disabled:opacity-50"
                    placeholder={contextName ? `Ask about this ${contextName}...` : "Ask Goose anything..."}
                    disabled={isLoadingSummary || isLoadingResponse}
                />
                <button
                    type="submit"
                    disabled={isLoadingSummary || isLoadingResponse || !prompt}
                    className="bg-secondary hover:opacity-90 disabled:bg-secondary/50 text-white font-bold py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
                    aria-label="Send message to Goose"
                >
                    <SendIcon className="w-5 h-5"/>
                </button>
            </form>
        </div>
    );
};
