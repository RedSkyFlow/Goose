import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Company, Contact, Deal, Interaction } from '../../types';
import { fetchCompanies, fetchContacts, fetchDeals, fetchInteractions } from '../../services/apiService';
import { BuildingOfficeIcon, UsersIcon, BriefcaseIcon } from '../icons';
import { Timeline } from '../Timeline';
import { CompanyFormModal } from './CompanyFormModal';
import { useNotification } from '../../contexts/NotificationContext';
import { MasterDetailLayout } from '../MasterDetailLayout';

export const CompaniesHub: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [relatedData, setRelatedData] = useState<{ contacts: Contact[], deals: Deal[], interactions: Interaction[] }>({ contacts: [], deals: [], interactions: [] });
    
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const companiesForLayout = useMemo(() => companies.map(c => ({...c, id: c.company_id})), [companies]);
    const selectedCompanyForLayout = useMemo(() => selectedCompany ? {...selectedCompany, id: selectedCompany.company_id} : null, [selectedCompany]);
    
    const renderListItem = (company: Company, isSelected: boolean) => (
        <div className={`p-3 rounded-lg transition-colors duration-200 ${
            isSelected ? 'bg-secondary text-white shadow-md' : 'hover:bg-primary/20 text-foreground'
        }`}>
            <p className="font-semibold">{company.name}</p>
            <p className={`text-xs mt-1 ${isSelected ? 'opacity-90' : 'opacity-70'}`}>
                {company.industry}
            </p>
        </div>
    );

    const renderDetailView = () => selectedCompany && (
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
    );

    const detailPlaceholder = (
        <div className="flex h-full items-center justify-center text-center">
            <div>
                <BuildingOfficeIcon className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
                <h2 className="text-2xl font-bold text-foreground/80">Select a Company</h2>
                <p className="text-foreground/60 mt-2">Choose a company from the list to view its details and interaction history.</p>
            </div>
        </div>
    );

    return (
        <>
            <CompanyFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCompanyCreated={handleCompanyCreated}
            />
            <MasterDetailLayout
                title="Companies"
                items={companiesForLayout}
                selectedItem={selectedCompanyForLayout}
                onSelectItem={(item) => setSelectedCompany(companies.find(c => c.company_id === item.id) || null)}
                renderListItem={renderListItem}
                renderDetailView={renderDetailView}
                searchKeys={['name', 'industry']}
                onAddItem={() => setIsModalOpen(false)}
                isLoading={isLoading}
                detailPlaceholder={detailPlaceholder}
                detailViewKey={selectedCompany?.company_id}
            />
        </>
    );
};