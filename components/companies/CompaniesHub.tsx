import React, { useState, useEffect, useMemo } from 'react';
import type { Company, Contact, Deal, Interaction } from '../../types';
import { fetchCompanies, fetchContacts, fetchDeals, fetchInteractions, createCompany } from '../../services/apiService';
// FIX: Import the `UsersIcon` component.
import { SearchIcon, BuildingOfficeIcon, UserIcon, UsersIcon, BriefcaseIcon, PlusIcon } from '../icons';
import { Timeline } from '../Timeline';
import { CompanyFormModal } from './CompanyFormModal';
import { UserProfile } from '../UserProfile';

interface CompaniesHubProps {
  setToastMessage: (message: string) => void;
}

const SidebarSkeleton: React.FC = () => (
    <div className="space-y-2 animate-pulse">
        {[...Array(8)].map((_, i) => <div key={i} className="w-full h-12 bg-primary/10 rounded-lg" />)}
    </div>
);

export const CompaniesHub: React.FC<CompaniesHubProps> = ({ setToastMessage }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [relatedData, setRelatedData] = useState<{ contacts: Contact[], deals: Deal[], interactions: Interaction[] }>({ contacts: [], deals: [], interactions: [] });
    
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadCompanies = async () => {
        try {
            setIsLoading(true);
            const fetchedCompanies = await fetchCompanies();
            setCompanies(fetchedCompanies);
            if (fetchedCompanies.length > 0 && !selectedCompany) {
                setSelectedCompany(fetchedCompanies[0]);
            }
        } catch (err) {
            console.error(err);
            setToastMessage('Error: Could not load companies.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        if (!selectedCompany) {
            setRelatedData({ contacts: [], deals: [], interactions: [] });
            return;
        }

        const loadRelatedData = async () => {
            setIsLoadingDetails(true);
            try {
                const [contacts, deals, interactions] = await Promise.all([
                    fetchContacts(selectedCompany.company_id),
                    fetchDeals({ companyId: selectedCompany.company_id }),
                    fetchInteractions({ companyId: selectedCompany.company_id })
                ]);
                setRelatedData({ contacts, deals, interactions });
            } catch (err) {
                console.error(err);
                setToastMessage(`Error: Could not load details for ${selectedCompany.name}.`);
            } finally {
                setIsLoadingDetails(false);
            }
        };

        loadRelatedData();
    }, [selectedCompany]);

    const filteredCompanies = useMemo(() => {
        return companies.filter(company => 
            company.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [companies, searchTerm]);
    
    const handleCompanyCreated = (newCompany: Company) => {
        setCompanies(prev => [newCompany, ...prev]);
        setSelectedCompany(newCompany);
        setToastMessage(`Company "${newCompany.name}" created successfully!`);
        setIsModalOpen(false);
    }

    return (
        <>
            <CompanyFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCompanyCreated={handleCompanyCreated}
            />
            <aside className="w-full max-w-xs xl:max-w-sm bg-background-light p-4 border-r border-primary/50 flex flex-col">
                <div className="flex justify-between items-center mb-3 mt-2">
                    <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Companies</h2>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center text-sm bg-secondary hover:opacity-90 text-white font-semibold py-1.5 px-3 rounded-md transition-colors"
                        title="Add a new company"
                    >
                        <PlusIcon className="w-4 h-4 mr-1.5" />
                        Add New
                    </button>
                </div>
                <div className="relative mb-4">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-background text-foreground placeholder-foreground/50 pl-10 pr-4 py-2 rounded-md border border-primary/50 focus:ring-2 focus:ring-secondary focus:outline-none"
                        aria-label="Search companies"
                    />
                </div>
                <div className="flex-grow overflow-y-auto">
                    {isLoading ? <SidebarSkeleton /> : (
                        <ul className="space-y-1">
                            {filteredCompanies.map(company => (
                                <li key={company.company_id}>
                                    <button
                                        onClick={() => setSelectedCompany(company)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                                            selectedCompany?.company_id === company.company_id
                                            ? 'bg-secondary text-white shadow-md'
                                            : 'hover:bg-primary/20 text-foreground'
                                        }`}
                                    >
                                        <p className="font-semibold">{company.name}</p>
                                        <p className={`text-xs mt-1 ${selectedCompany?.company_id === company.company_id ? 'opacity-90' : 'opacity-70'}`}>
                                            {company.industry}
                                        </p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="mt-auto pt-4 border-t border-primary/50">
                    <UserProfile />
                </div>
            </aside>
            <main className="flex-1 bg-background p-8 overflow-y-auto">
                {selectedCompany ? (
                    <>
                        <div className="mb-6 pb-4 border-b border-primary/50">
                            <h2 className="text-3xl font-bold text-foreground">{selectedCompany.name}</h2>
                            <p className="text-foreground/80">{selectedCompany.industry} | <a href={`http://${selectedCompany.domain}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">{selectedCompany.domain}</a></p>
                            <p className="text-sm text-foreground/70 mt-2 italic">{selectedCompany.ai_summary}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-xl font-semibold text-foreground/90 mb-3 flex items-center"><UsersIcon className="w-5 h-5 mr-2 text-secondary"/>Contacts</h3>
                                <div className="space-y-2">
                                    {relatedData.contacts.length > 0 ? relatedData.contacts.map(c => (
                                        <div key={c.contact_id} className="bg-background-light p-3 rounded-md">
                                            <p className="font-semibold">{c.first_name} {c.last_name}</p>
                                            <p className="text-sm text-foreground/70">{c.role}</p>
                                        </div>
                                    )) : <p className="text-foreground/60">No contacts found.</p>}
                                </div>
                            </div>
                             <div>
                                <h3 className="text-xl font-semibold text-foreground/90 mb-3 flex items-center"><BriefcaseIcon className="w-5 h-5 mr-2 text-secondary"/>Deals</h3>
                                <div className="space-y-2">
                                    {relatedData.deals.length > 0 ? relatedData.deals.map(d => (
                                        <div key={d.deal_id} className="bg-background-light p-3 rounded-md">
                                            <p className="font-semibold">{d.deal_name}</p>
                                            <p className="text-sm text-foreground/70">${d.value.toLocaleString()} - {d.stage}</p>
                                        </div>
                                    )) : <p className="text-foreground/60">No deals found.</p>}
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold text-foreground/90">
                            Master Timeline
                        </h3>
                        <Timeline interactions={relatedData.interactions} isLoading={isLoadingDetails} />
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center text-center">
                        <div>
                            <BuildingOfficeIcon className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
                            <h2 className="text-2xl font-bold text-foreground/80">Select a Company</h2>
                            <p className="text-foreground/60 mt-2">Choose a company from the list to view its details and interaction history.</p>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
};