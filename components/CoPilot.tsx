
import React, { useState, useCallback } from 'react';
import type { Deal } from '../types';
import { getNextBestAction } from '../services/geminiService';
import { SparklesIcon, SendIcon } from './icons';

interface CoPilotProps {
  deal: Deal;
}

export const CoPilot: React.FC<CoPilotProps> = ({ deal }) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("What's my next best action?");

  const handleGetSuggestion = useCallback(async () => {
    if (!deal) return;
    setIsLoading(true);
    setSuggestion('');
    try {
      const result = await getNextBestAction(deal);
      setSuggestion(result);
    } catch (error) {
      setSuggestion('Sorry, I encountered an error.');
    } finally {
      setIsLoading(false);
    }
  }, [deal]);

  return (
    <div className="bg-brand-gray-800 p-4 rounded-lg mt-6">
      <h3 className="text-lg font-bold flex items-center mb-4">
        <SparklesIcon className="w-6 h-6 mr-2 text-brand-blue" />
        AI Co-Pilot
      </h3>
      <div className="bg-brand-gray-900 rounded-lg p-3 min-h-[100px] text-gray-300 text-sm">
        {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
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
            className="flex-grow bg-brand-gray-700 text-white placeholder-gray-400 p-2 rounded-md border border-brand-gray-600 focus:ring-2 focus:ring-brand-blue focus:outline-none"
            placeholder="Ask a question..."
            disabled={true} // For now, only the pre-defined question is used
        />
        <button
          onClick={handleGetSuggestion}
          disabled={isLoading}
          className="bg-brand-blue hover:bg-blue-600 disabled:bg-brand-gray-600 text-white font-bold py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
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
