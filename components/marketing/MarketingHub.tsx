import React, { useState } from 'react';
import type { ProspectProfile } from '../../types';
import { MegaphoneIcon } from '../icons';
import { ProspectResearcher } from './ProspectResearcher';
import { ContentCreator } from './ContentCreator';
import { LeadListBuilder } from './LeadListBuilder';
import { RightSidebar } from '../RightSidebar';

type Tool = 'builder' | 'researcher' | 'creator';

export const MarketingHub: React.FC = () => {
    const [activeTool, setActiveTool] = useState<Tool>('builder');
    const [researchedProspect, setResearchedProspect] = useState<ProspectProfile | null>(null);
    const [domainToResearch, setDomainToResearch] = useState<string | null>(null);
    
    const handleSelectLead = (domain: string) => {
        setDomainToResearch(domain);
        setActiveTool('researcher');
    };
    
    // When switching away from researcher, clear the transient domain state
    const handleToolChange = (tool: Tool) => {
        if (tool !== 'researcher') {
            setDomainToResearch(null);
        }
        setActiveTool(tool);
    };

    const renderTool = () => {
        switch(activeTool) {
            case 'builder':
                return <LeadListBuilder onSelectLead={handleSelectLead} />;
            case 'researcher':
                return <ProspectResearcher initialDomain={domainToResearch} onProspectResearched={setResearchedProspect} />;
            case 'creator':
                return <ContentCreator />;
            default:
                return null;
        }
    };

    return (
        <div className="flex w-full h-full">
            <main className="flex-1 bg-background p-8 overflow-y-auto">
                <div className="mb-6 pb-4 border-b border-primary/50">
                    <h2 className="text-3xl font-bold text-foreground flex items-center">
                        <MegaphoneIcon className="w-8 h-8 mr-3 text-secondary" />
                        Marketing Hub: Acquisition Engine
                    </h2>
                    <p className="text-foreground/80 mt-1">AI-powered tools to find and engage your next best customers.</p>
                </div>
                
                <div className="mb-6">
                    <div className="flex border-b border-primary/50">
                         <TabButton
                            label="Lead List Builder"
                            isActive={activeTool === 'builder'}
                            onClick={() => handleToolChange('builder')}
                        />
                        <TabButton
                            label="AI Prospect Researcher"
                            isActive={activeTool === 'researcher'}
                            onClick={() => handleToolChange('researcher')}
                        />
                        <TabButton
                            label="AI Content Creator"
                            isActive={activeTool === 'creator'}
                            onClick={() => handleToolChange('creator')}
                        />
                    </div>
                </div>

                <div className="bg-background-light p-6 rounded-lg">
                    {renderTool()}
                </div>
            </main>
            <RightSidebar item={researchedProspect} />
        </div>
    );
};

interface TabButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 -mb-px text-sm font-semibold border-b-2 transition-colors ${
            isActive
                ? 'border-secondary text-secondary'
                : 'border-transparent text-foreground/60 hover:text-foreground'
        }`}
    >
        {label}
    </button>
);
