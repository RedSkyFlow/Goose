import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Company, Contact, Interaction } from '../../types';
import { fetchContacts, fetchCompanies, fetchInteractions } from '../../services/apiService';
import { UsersIcon, UserIcon, BuildingOfficeIcon } from '../icons';
import { Timeline } from '../Timeline';
import { ContactFormModal } from './ContactFormModal';
import { useNotification } from '../../contexts/NotificationContext';
import { MasterDetailLayout } from '../MasterDetailLayout';

export const ContactsHub: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { showToast } = useNotification();

    const loadInitialData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [fetchedContacts, fetchedCompanies] = await Promise.all([
                fetchContacts(),
                fetchCompanies()
            ]);
            setContacts(fetchedContacts);
            setCompanies(fetchedCompanies);
            if (fetchedContacts.length > 0 && !selectedContact) {
                setSelectedContact(fetchedContacts[0]);
            }
        } catch (err) {
            console.error(err);
            showToast('Error: Could not load data.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedContact, showToast]);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!selectedContact) {
            setInteractions([]);
            return;
        }

        const loadInteractions = async () => {
            setIsLoadingDetails(true);
            try {
                const fetchedInteractions = await fetchInteractions({ contactId: selectedContact.contact_id });
                setInteractions(fetchedInteractions);
            } catch (err) {
                console.error(err);
                showToast(`Error: Could not load timeline for ${selectedContact.first_name}.`);
            } finally {
                setIsLoadingDetails(false);
            }
        };

        loadInteractions();
    }, [selectedContact, showToast]);

    const handleContactCreated = (newContact: Contact) => {
        setContacts(prev => [newContact, ...prev]);
        setSelectedContact(newContact);
        showToast(`Contact "${newContact.first_name}" created successfully!`);
        setIsModalOpen(false);
    };

    const contactsForLayout = useMemo(() => contacts.map(c => ({...c, id: c.contact_id})), [contacts]);
    const selectedContactForLayout = useMemo(() => selectedContact ? {...selectedContact, id: selectedContact.contact_id} : null, [selectedContact]);
    
    const renderListItem = (contact: Contact, isSelected: boolean) => (
        <div className={`p-3 rounded-lg transition-colors duration-200 ${
            isSelected ? 'bg-secondary text-white shadow-md' : 'hover:bg-primary/20 text-foreground'
        }`}>
            <p className="font-semibold">{contact.first_name} {contact.last_name}</p>
            <p className={`text-xs mt-1 ${isSelected ? 'opacity-90' : 'opacity-70'}`}>
                {companies.find(c => c.company_id === contact.company_id)?.name || 'No Company'}
            </p>
        </div>
    );
    
    const renderDetailView = () => {
        if (!selectedContact) return null;
        const selectedContactCompany = companies.find(c => c.company_id === selectedContact.company_id);

        return (
            <>
                <div className="mb-6 pb-4 border-b border-primary/50">
                    <h2 className="text-3xl font-bold text-foreground">{selectedContact.first_name} {selectedContact.last_name}</h2>
                    <p className="text-foreground/80">{selectedContact.role || 'No role specified'}</p>
                    <div className="mt-2 text-sm space-y-1">
                        <p className="text-secondary hover:underline flex items-center"><UserIcon className="w-4 h-4 mr-2 text-foreground/60"/>{selectedContact.email}</p>
                        {selectedContactCompany && (
                            <p className="flex items-center"><BuildingOfficeIcon className="w-4 h-4 mr-2 text-foreground/60"/>{selectedContactCompany.name}</p>
                        )}
                    </div>
                </div>

                <h3 className="text-xl font-semibold text-foreground/90">
                    Interaction History
                </h3>
                <Timeline interactions={interactions} isLoading={isLoadingDetails} />
            </>
        )
    };

    const detailPlaceholder = (
         <div className="flex h-full items-center justify-center text-center">
            <div>
                <UsersIcon className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
                <h2 className="text-2xl font-bold text-foreground/80">Select a Contact</h2>
                <p className="text-foreground/60 mt-2">Choose a contact from the list to view their details and interaction history.</p>
            </div>
        </div>
    );

    return (
        <>
            <ContactFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onContactCreated={handleContactCreated}
                companies={companies}
            />
            <MasterDetailLayout
                title="Contacts"
                items={contactsForLayout}
                selectedItem={selectedContactForLayout}
                onSelectItem={(item) => setSelectedContact(contacts.find(c => c.contact_id === item.id) || null)}
                renderListItem={renderListItem}
                renderDetailView={renderDetailView}
                searchKeys={['first_name', 'last_name', 'email']}
                onAddItem={() => setIsModalOpen(true)}
                isLoading={isLoading}
                detailPlaceholder={detailPlaceholder}
                detailViewKey={selectedContact?.contact_id}
            />
        </>
    );
};