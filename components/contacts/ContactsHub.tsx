import React, { useState, useEffect, useMemo } from 'react';
import type { Company, Contact, Interaction } from '../../types';
import { fetchContacts, fetchCompanies, fetchInteractions } from '../../services/apiService';
import { SearchIcon, UsersIcon, UserIcon, BuildingOfficeIcon, PlusIcon } from '../icons';
import { Timeline } from '../Timeline';
import { ContactFormModal } from './ContactFormModal';
import { UserProfile } from '../UserProfile';

interface ContactsHubProps {
  setToastMessage: (message: string) => void;
}

const SidebarSkeleton: React.FC = () => (
    <div className="space-y-2 animate-pulse">
        {[...Array(8)].map((_, i) => <div key={i} className="w-full h-12 bg-primary/10 rounded-lg" />)}
    </div>
);

export const ContactsHub: React.FC<ContactsHubProps> = ({ setToastMessage }) => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadInitialData = async () => {
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
            setToastMessage('Error: Could not load data.');
        } finally {
            setIsLoading(false);
        }
    };

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
                setToastMessage(`Error: Could not load timeline for ${selectedContact.first_name}.`);
            } finally {
                setIsLoadingDetails(false);
            }
        };

        loadInteractions();
    }, [selectedContact]);

    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => 
            `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [contacts, searchTerm]);

    const selectedContactCompany = useMemo(() => {
        if (!selectedContact) return null;
        return companies.find(c => c.company_id === selectedContact.company_id);
    }, [selectedContact, companies]);
    
    const handleContactCreated = (newContact: Contact) => {
        setContacts(prev => [newContact, ...prev]);
        setSelectedContact(newContact);
        setToastMessage(`Contact "${newContact.first_name}" created successfully!`);
        setIsModalOpen(false);
    };

    return (
        <>
            <ContactFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onContactCreated={handleContactCreated}
                companies={companies}
            />
            <aside className="w-full max-w-xs xl:max-w-sm bg-background-light p-4 border-r border-primary/50 flex flex-col">
                <div className="flex justify-between items-center mb-3 mt-2">
                    <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Contacts</h2>
                     <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center text-sm bg-secondary hover:opacity-90 text-white font-semibold py-1.5 px-3 rounded-md transition-colors"
                        title="Add a new contact"
                    >
                        <PlusIcon className="w-4 h-4 mr-1.5" />
                        Add New
                    </button>
                </div>
                <div className="relative mb-4">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-background text-foreground placeholder-foreground/50 pl-10 pr-4 py-2 rounded-md border border-primary/50 focus:ring-2 focus:ring-secondary focus:outline-none"
                        aria-label="Search contacts"
                    />
                </div>
                <div className="flex-grow overflow-y-auto">
                    {isLoading ? <SidebarSkeleton /> : (
                        <ul className="space-y-1">
                            {filteredContacts.map(contact => (
                                <li key={contact.contact_id}>
                                    <button
                                        onClick={() => setSelectedContact(contact)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                                            selectedContact?.contact_id === contact.contact_id
                                            ? 'bg-secondary text-white shadow-md'
                                            : 'hover:bg-primary/20 text-foreground'
                                        }`}
                                    >
                                        <p className="font-semibold">{contact.first_name} {contact.last_name}</p>
                                        <p className={`text-xs mt-1 ${selectedContact?.contact_id === contact.contact_id ? 'opacity-90' : 'opacity-70'}`}>
                                            {companies.find(c => c.company_id === contact.company_id)?.name || 'No Company'}
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
                {selectedContact ? (
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
                ) : (
                     <div className="flex h-full items-center justify-center text-center">
                        <div>
                            <UsersIcon className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
                            <h2 className="text-2xl font-bold text-foreground/80">Select a Contact</h2>
                            <p className="text-foreground/60 mt-2">Choose a contact from the list to view their details and interaction history.</p>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
};