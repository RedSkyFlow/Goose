import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Company, Contact, Deal, Interaction } from '../../types';
import { fetchCompanies, fetchContacts, fetchDeals, fetchInteractions } from '../../services/apiService';
import { BuildingOfficeIcon, UsersIcon, BriefcaseIcon, FireIcon, ExclamationTriangleIcon, KeyIcon } from '../icons';
import { Timeline } from '../Timeline';
import { CompanyFormModal } from './CompanyFormModal';
import { useNotification } from '../../contexts/NotificationContext';
import { MasterListSidebar } from '../MasterListSidebar';
import { RightSidebar } from '../RightSidebar';
import type { NavigationTarget } from '../GooseOS';
import type { Hub } from '../MainNavbar';
// FIX: Import ItemStatus to use as a more specific type for the filter state.
import { ItemStatus } from '../../types';

interface CompaniesHubProps {
    navigationTarget: NavigationTarget | null;
    onNavigate: (hub: Hub, itemId: string) => void;
}

export const CompaniesHub: React.FC<CompaniesHubProps> = ({ navigationTarget, onNavigate }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [relatedData, setRelatedData] = useState<{ contacts: Contact[], deals: Deal[], interactions: Interaction[] }>({ contacts: [], deals: [], interactions: [] });
    
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    // FIX: Changed state type from `string` to the more specific `ItemStatus` union for better type safety.
    const [activeFilter, setActiveFilter] = useState<ItemStatus | 'All'>('All');

    const { showToast } = useNotification();

    const loadCompanies = useCallback(async () => {
        try {
            setIsLoading(true);
            const fetchedCompanies = await fetchCompanies();
            setCompanies(fetchedCompanies);
            if (fetchedCompanies.length > 0 && !selectedCompany) {
                setSelectedCompany(fetchedCompanies[0]);
            }
        } catch (err) {
            console.error(err);
            showToast('Error: Could not load companies.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedCompany, showToast]);

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        if (navigationTarget?.hub === 'Companies' && companies.length > 0) {
            const targetCompany = companies.find(c => c.company_id === navigationTarget.itemId);
            if (targetCompany && targetCompany.company_id !== selectedCompany?.company_id) {
                setSelectedCompany(targetCompany);
            }
        }
    }, [navigationTarget, companies, selectedCompany]);

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
                showToast(`Error: Could not load details for ${selectedCompany.name}.`);
            } finally {
                setIsLoadingDetails(false);
            }
        };

        loadRelatedData();
    }, [selectedCompany, showToast]);
    
    const handleCompanyCreated = (newCompany: Company) => {
        setCompanies(prev => [newCompany, ...prev]);
        setSelectedCompany(newCompany);
        showToast(`Company "${newCompany.name}" created successfully!`);
        setIsModalOpen(false);
    }
    
    const companyFilterOptions = [
        { id: 'hot', label: 'Hot', icon: <FireIcon className="w-4 h-4 mr-1.5" /> },
        { id: 'at_risk', label: 'At Risk', icon: <ExclamationTriangleIcon className="w-4 h-4 mr-1.5" /> },
    ];
    
    const filteredCompanies = useMemo(() => {
        return companies
            .filter(company => {
                if (activeFilter === 'All') return true;
                return company.status === activeFilter;
            })
            .filter(company => {
                const lowercasedTerm = searchTerm.toLowerCase();
                // FIX: The generic implementation for searching caused a TypeScript type error.
                // Replaced with direct property access for type safety and clarity.
                return company.name.toLowerCase().includes(lowercasedTerm) ||
                       company.industry.toLowerCase().includes(lowercasedTerm);
            });
    }, [companies, searchTerm, activeFilter]);

    useEffect(() => {
        if (selectedCompany && !filteredCompanies.find(c => c.company_id === selectedCompany.company_id)) {
            setSelectedCompany(filteredCompanies.length > 0 ? filteredCompanies[0] : null);
        }
    }, [filteredCompanies, selectedCompany]);


    const renderListItem = (company: Company, isSelected: boolean) => (
        <div className={`p-3 rounded-lg transition-colors duration-200 ${
            isSelected ? 'bg-secondary text-white shadow-md' : 'hover:bg-primary/20 text-foreground'
        }`}>
            <div className="flex justify-between items-start">
                <p className="font-semibold pr-2">{company.name}</p>
                <div className="flex items-center space-x-2 flex-shrink-0 mt-0.5">
                    {company.status === 'hot' && (
                        <FireIcon className="w-4 h-4 text-accent" title="Hot Company" />
                    )}
                    {company.status === 'at_risk' && (
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-400" title="Company At Risk" />
                    )}
                </div>
            </div>
            <p className={`text-xs mt-1 ${isSelected ? 'opacity-90' : 'opacity-70'}`}>
                {company.industry}
            </p>
        </div>
    );
    
    const MainContent = () => {
        if (!selectedCompany) {
            return (
                <main className="flex-1 bg-background p-8 flex items-center justify-center">
                    <div className="text-center">
                        <BuildingOfficeIcon className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
                        <h2 className="text-2xl font-bold text-foreground/80">Select a Company</h2>
                        <p className="text-foreground/60 mt-2">Choose a company from the list to view its details and interaction history.</p>
                    </div>
                </main>
            );
        }
        
        return (
            <main className="flex-1 bg-background p-8 overflow-y-auto">
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
                                <button key={c.contact_id} onClick={() => onNavigate('Contacts', c.contact_id)} className="w-full text-left bg-background-light p-3 rounded-md hover:bg-primary/20 transition-colors block">
                                    <p className="font-semibold">{c.first_name} {c.last_name}</p>
                                    <p className="text-sm text-foreground/70">{c.role}</p>
                                </button>
                            )) : <p className="text-foreground/60">No contacts found.</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-foreground/90 mb-3 flex items-center"><BriefcaseIcon className="w-5 h-5 mr-2 text-secondary"/>Deals</h3>
                        <div className="space-y-2">
                            {relatedData.deals.length > 0 ? relatedData.deals.map(d => (
                                <button key={d.deal_id} onClick={() => onNavigate('Deals', d.deal_id)} className="w-full text-left bg-background-light p-3 rounded-md hover:bg-primary/20 transition-colors block">
                                    <p className="font-semibold">{d.deal_name}</p>
                                    <p className="text-sm text-foreground/70">${d.value.toLocaleString()} - {d.stage}</p>
                                </button>
                            )) : <p className="text-foreground/60">No deals found.</p>}
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-semibold text-foreground/90">
                    Master Timeline
                </h3>
                <Timeline interactions={relatedData.interactions} isLoading={isLoadingDetails} />
            </main>
        )
    }

    return (
        <>
            <CompanyFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCompanyCreated={handleCompanyCreated}
            />
            <MasterListSidebar
                title="Companies"
                items={filteredCompanies}
                selectedItem={selectedCompany}
                onSelectItem={setSelectedCompany}
                renderListItem={renderListItem}
                onAddItem={() => setIsModalOpen(true)}
                isLoading={isLoading}
                itemIdentifier="company_id"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search companies..."
                filterOptions={companyFilterOptions}
                activeFilter={activeFilter}
                // FIX: Pass a new function to onFilterChange to ensure type compatibility between the prop and the state dispatcher.
                onFilterChange={(filter) => setActiveFilter(filter as ItemStatus | 'All')}
            />
            <MainContent />
            <RightSidebar item={selectedCompany} interactions={relatedData.interactions} />
        </>
    );
};
