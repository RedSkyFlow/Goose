import React, { useState, useCallback } from 'react';
import type { Deal, Interaction } from '../types';
import { getNextBestAction } from '../services/geminiService';
import { SparklesIcon, SendIcon } from './icons';

interface CoPilotProps {
  deal: Deal;
  interactions: Interaction[];
}

export const CoPilot: React.FC<CoPilotProps> = ({ deal, interactions }) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("What's my next best action?");

  const handleGetSuggestion = useCallback(async () => {
    if (!deal) return;
    setIsLoading(true);
    setSuggestion('');
    try {
      const result = await getNextBestAction(deal, interactions);
      setSuggestion(result);
    } catch (error) {
      setSuggestion('Sorry, I encountered an error.');
    } finally {
      setIsLoading(false);
    }
  }, [deal, interactions]);

  return (
    <div className="bg-background-light p-4 rounded-lg mt-6">
      <h3 className="text-lg font-bold flex items-center mb-4">
        <SparklesIcon className="w-6 h-6 mr-2 text-secondary" />
        AI Co-Pilot
      </h3>
      <div className="bg-background rounded-lg p-3 min-h-[100px] text-foreground/80 text-sm">
        {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
            </div>
        ) : (
          suggestion || 'Ask for a suggestion to get started.'
        )}
      </div>
      <div className="mt-4 flex items-center space-x-2">
         <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-grow bg-background text-foreground placeholder-foreground/50 p-2 rounded-md border border-primary focus:ring-2 focus:ring-secondary focus:outline-none"
            placeholder="Ask a question..."
            disabled={true} // For now, only the pre-defined question is used
        />
        <button
          onClick={handleGetSuggestion}
          disabled={isLoading}
          className="bg-secondary hover:opacity-90 disabled:bg-secondary/50 text-white font-bold py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          {isLoading ? (
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <SendIcon className="w-5 h-5"/>
          )}
        </button>
      </div>
    </div>
  );
};
