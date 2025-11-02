import React, { useState } from 'react';
import { generateMarketingContent } from '../../services/apiService';
import { SparklesIcon } from '../icons';
import { MarkdownContent } from '../shared/MarkdownContent';

export const ContentCreator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) return;
        
        setIsLoading(true);
        setError('');
        setContent('');

        try {
            const result = await generateMarketingContent(prompt);
            setContent(result);
        } catch (err) {
            console.error(err);
            setError('Failed to generate content. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-foreground/90 mb-2">AI Content Creator</h3>
            <p className="text-sm text-foreground/70 mb-4">Describe the content you need, and Goose will draft it for you. Try "Write a blog post about the benefits of managed IT services for hotels" or "Generate 3 tweets about our new cloud migration product."</p>
            
            <form onSubmit={handleSubmit}>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Enter your content request..."
                    rows={3}
                    className="w-full bg-background text-foreground placeholder-foreground/50 p-2 rounded-md border border-primary/50 focus:ring-2 focus:ring-secondary focus:outline-none"
                    aria-label="Content generation prompt"
                />
                <button
                    type="submit"
                    disabled={isLoading || !prompt}
                    className="mt-2 bg-secondary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-200 disabled:bg-secondary/50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Generating...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Generate Content
                        </>
                    )}
                </button>
            </form>

            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            
            {(isLoading || content) && (
                 <div className="mt-6 border-t border-primary/50 pt-6">
                     {isLoading ? (
                        <div className="text-center p-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
                            <p className="text-foreground/80">Goose is writing...</p>
                        </div>
                     ) : (
                        <div className="bg-background/50 p-4 rounded-lg border border-primary/30">
                            <MarkdownContent content={content} />
                        </div>
                     )}
                 </div>
            )}
        </div>
    );
};