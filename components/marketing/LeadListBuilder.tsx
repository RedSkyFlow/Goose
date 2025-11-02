import React, { useState } from 'react';
import { generateLeadList } from '../../services/apiService';
import { SparklesIcon, BuildingOfficeIcon } from '../icons';
import type { GeneratedLead } from '../../types';

interface LeadListBuilderProps {
  onSelectLead: (domain: string) => void;
}

export const LeadListBuilder: React.FC<LeadListBuilderProps> = ({ onSelectLead }) => {
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [leads, setLeads] = useState<GeneratedLead[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description) return;
        
        setIsLoading(true);
        setError('');
        setLeads([]);

        try {
            const result = await generateLeadList(description);
            setLeads(result);
        } catch (err) {
            console.error(err);
            setError('Failed to generate leads. Please try again or refine your description.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-foreground/90 mb-2">AI Lead List Builder</h3>
            <p className="text-sm text-foreground/70 mb-4">Describe your ideal customer profile in plain English. Goose will generate a list of potential leads for you to research.</p>
            
            <form onSubmit={handleSubmit}>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g., Boutique hotels in California with recent funding, or SaaS companies in Texas that just raised a Series B..."
                    rows={3}
                    className="w-full bg-background text-foreground placeholder-foreground/50 p-2 rounded-md border border-primary/50 focus:ring-2 focus:ring-secondary focus:outline-none"
                    aria-label="Ideal customer description"
                />
                <button
                    type="submit"
                    disabled={isLoading || !description}
                    className="mt-2 bg-secondary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-200 disabled:bg-secondary/50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Generating Leads...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Generate Leads
                        </>
                    )}
                </button>
            </form>

            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            
            {(isLoading || leads.length > 0) && (
                 <div className="mt-6 border-t border-primary/50 pt-6">
                     <h4 className="font-semibold text-foreground/90 mb-2">Generated Leads</h4>
                     {isLoading ? (
                        <div className="text-center p-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
                            <p className="text-foreground/80">Goose is searching...</p>
                        </div>
                     ) : (
                        <div className="space-y-2">
                            {leads.map((lead, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSelectLead(lead.domain)}
                                    className="w-full text-left bg-background/50 p-3 rounded-lg border border-primary/30 hover:bg-primary/10 transition-colors flex items-center"
                                >
                                    <BuildingOfficeIcon className="w-5 h-5 mr-3 text-secondary" />
                                    <div>
                                        <p className="font-bold text-foreground">{lead.company_name}</p>
                                        <p className="text-sm text-foreground/70">{lead.domain}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                     )}
                 </div>
            )}
        </div>
    );
};
