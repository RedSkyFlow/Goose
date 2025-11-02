import React, { useState, useEffect, useCallback } from 'react';
import type { ProspectProfile } from '../../types';
import { researchProspect } from '../../services/apiService';
import { SearchIcon, SparklesIcon, UsersIcon, LifebuoyIcon } from '../icons';

interface ProspectResearcherProps {
    initialDomain?: string | null;
    onProspectResearched: (prospect: ProspectProfile | null) => void;
}

export const ProspectResearcher: React.FC<ProspectResearcherProps> = ({ initialDomain, onProspectResearched }) => {
    const [domain, setDomain] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState<ProspectProfile | null>(null);

    const handleResearch = useCallback(async (domainToResearch: string) => {
        if (!domainToResearch) return;
        
        setIsLoading(true);
        setError('');
        setProfile(null);
        onProspectResearched(null);

        try {
            const result = await researchProspect(domainToResearch);
            setProfile(result);
            onProspectResearched(result);
        } catch (err) {
            console.error(err);
            setError(`Failed to research domain "${domainToResearch}". Please try again.`);
        } finally {
            setIsLoading(false);
        }
    }, [onProspectResearched]);

    useEffect(() => {
        if (initialDomain) {
            setDomain(initialDomain);
            handleResearch(initialDomain);
        }
    }, [initialDomain, handleResearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleResearch(domain);
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-foreground/90 mb-2">AI Prospect Researcher</h3>
            <p className="text-sm text-foreground/70 mb-4">Enter a company domain to generate a detailed profile, including their tech stack, key contacts, and recent news.</p>
            
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-6">
                <input
                    type="text"
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    placeholder="e.g., newhotel.com"
                    className="flex-grow bg-background text-foreground placeholder-foreground/50 p-2 rounded-md border border-primary/50 focus:ring-2 focus:ring-secondary focus:outline-none"
                    aria-label="Company domain"
                />
                <button
                    type="submit"
                    disabled={isLoading || !domain}
                    className="bg-secondary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-200 disabled:bg-secondary/50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <SearchIcon className="w-5 h-5" />
                    )}
                </button>
            </form>

            {error && <p className="text-red-400 text-center">{error}</p>}

            {isLoading && (
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
                    <p className="text-foreground/80">Researching prospect...</p>
                </div>
            )}

            {profile && (
                <div className="space-y-6 animate-fade-in-down">
                    <section className="bg-background/50 p-4 rounded-lg border border-primary/30">
                        <h4 className="text-lg font-bold text-secondary">{profile.company_name}</h4>
                        <p className="text-sm text-foreground/80">{profile.industry}</p>
                        <p className="mt-2 text-sm text-foreground/90">{profile.summary}</p>
                    </section>
                    
                     <section>
                        <h4 className="font-semibold text-foreground/90 mb-2 flex items-center"><SparklesIcon className="w-4 h-4 mr-2 text-secondary" />AI Talking Points</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80">
                            {profile.talking_points.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section>
                            <h4 className="font-semibold text-foreground/90 mb-2 flex items-center"><UsersIcon className="w-4 h-4 mr-2 text-secondary" />Key Contacts</h4>
                            <div className="space-y-2">
                                {profile.key_contacts.map((contact, i) => (
                                    <div key={i} className="bg-background/30 p-3 rounded-md text-sm">
                                        <p className="font-bold">{contact.name} <span className="text-xs font-normal text-foreground/70">- {contact.role}</span></p>
                                        <p className="text-xs text-foreground/70 italic mt-1">"{contact.ai_outreach_suggestion}"</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                         <section>
                            <h4 className="font-semibold text-foreground/90 mb-2 flex items-center"><LifebuoyIcon className="w-4 h-4 mr-2 text-secondary" />Technology Stack</h4>
                             <div className="space-y-2">
                                {profile.tech_stack.map((tech, i) => (
                                    <div key={i} className="bg-background/30 p-3 rounded-md text-sm">
                                        <p className="font-bold">{tech.name} <span className="text-xs font-normal text-foreground/70">- {tech.category}</span></p>
                                        <p className="text-xs text-foreground/70 mt-1">{tech.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                     <section>
                        <h4 className="font-semibold text-foreground/90 mb-2">Recent News</h4>
                        <div className="space-y-2">
                             {profile.recent_news.map((news, i) => (
                                <a href={news.url} key={i} target="_blank" rel="noopener noreferrer" className="block bg-background/30 p-3 rounded-md text-sm hover:bg-primary/10 transition-colors">
                                    <p className="font-bold">{news.title}</p>
                                    <p className="text-xs text-foreground/70 mt-1">{news.summary}</p>
                                    <p className="text-xs text-foreground/60 mt-2">{new Date(news.published_date).toLocaleDateString()}</p>
                                </a>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};
