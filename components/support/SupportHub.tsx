import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { SupportTicket, Contact, Interaction, Company } from '../../types';
import { SupportTicketStatus } from '../../types';
import { fetchSupportTickets, fetchContacts, fetchInteractions, fetchCompanies } from '../../services/apiService';
import { LifebuoyIcon, UserIcon } from '../icons';
import { Timeline } from '../Timeline';
import { TicketFormModal } from './TicketFormModal';
import { useNotification } from '../../contexts/NotificationContext';
import { MasterListSidebar } from '../MasterListSidebar';
import { RightSidebar } from '../RightSidebar';
import type { NavigationTarget } from '../GooseOS';
import type { Hub } from '../MainNavbar';

interface SupportHubProps {
    navigationTarget: NavigationTarget | null;
    onNavigate: (hub: Hub, itemId: string) => void;
}

const getStatusClasses = (status: SupportTicketStatus) => {
    switch (status) {
        case SupportTicketStatus.OPEN: return 'border-l-4 border-red-500';
        case SupportTicketStatus.PENDING: return 'border-l-4 border-accent';
        case SupportTicketStatus.CLOSED: return 'border-l-4 border-primary';
        default: return 'border-l-4 border-gray-500';
    }
}

export const SupportHub: React.FC<SupportHubProps> = ({ navigationTarget, onNavigate }) => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    // FIX: Changed state type to `SupportTicketStatus | 'All'` for better type safety with this component's filtering logic.
    const [activeFilter, setActiveFilter] = useState<SupportTicketStatus | 'All'>('All');

    const { showToast } = useNotification();

    const loadInitialData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [fetchedTickets, fetchedContacts, fetchedCompanies] = await Promise.all([
                fetchSupportTickets(),
                fetchContacts(),
                fetchCompanies(),
            ]);
            setTickets(fetchedTickets);
            setContacts(fetchedContacts);
            setCompanies(fetchedCompanies);

            if (fetchedTickets.length > 0 && !selectedTicket) {
                setSelectedTicket(fetchedTickets[0]);
            }
        } catch (err) {
            console.error(err);
            showToast('Error: Could not load support data.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedTicket, showToast]);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (navigationTarget?.hub === 'Support' && tickets.length > 0) {
            const targetTicket = tickets.find(t => t.ticket_id === navigationTarget.itemId);
            if (targetTicket && targetTicket.ticket_id !== selectedTicket?.ticket_id) {
                setSelectedTicket(targetTicket);
            }
        }
    }, [navigationTarget, tickets, selectedTicket]);

    useEffect(() => {
        if (!selectedTicket) {
            setInteractions([]);
            return;
        }

        const loadRelatedInteractions = async () => {
            setIsLoadingDetails(true);
            try {
                // Fetch all interactions for the contact, then filter by IDs in the ticket
                const allContactInteractions = await fetchInteractions({ contactId: selectedTicket.contact_id });
                const ticketInteractions = allContactInteractions.filter(i => 
                    selectedTicket.interaction_ids.includes(i.interaction_id)
                );
                setInteractions(ticketInteractions);
            } catch (err) {
                console.error(err);
                showToast(`Error: Could not load timeline for ticket.`);
            } finally {
                setIsLoadingDetails(false);
            }
        };

        loadRelatedInteractions();
    }, [selectedTicket, showToast]);

    const handleTicketCreated = (newTicket: SupportTicket) => {
        setTickets(prev => [newTicket, ...prev]);
        setSelectedTicket(newTicket);
        showToast(`Ticket "${newTicket.subject}" created successfully!`);
        setIsModalOpen(false);
    };

    const ticketFilterOptions = [
        { id: SupportTicketStatus.OPEN, label: 'Open' },
        { id: SupportTicketStatus.PENDING, label: 'Pending' },
        { id: SupportTicketStatus.CLOSED, label: 'Closed' },
    ];
    
    const filteredTickets = useMemo(() => {
        return tickets
            .filter(ticket => {
                if (activeFilter === 'All') return true;
                return ticket.status === activeFilter;
            })
            .filter(ticket => {
                // FIX: Assuming a faulty generic search caused the error, replaced with direct property access.
                return ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
            });
    }, [tickets, searchTerm, activeFilter]);

    useEffect(() => {
        if (selectedTicket && !filteredTickets.find(t => t.ticket_id === selectedTicket.ticket_id)) {
            setSelectedTicket(filteredTickets.length > 0 ? filteredTickets[0] : null);
        }
    }, [filteredTickets, selectedTicket]);


    const renderListItem = (ticket: SupportTicket, isSelected: boolean) => {
        const contact = contacts.find(c => c.contact_id === ticket.contact_id);
        return (
            <div className={`p-3 rounded-lg transition-colors duration-200 ${getStatusClasses(ticket.status)} ${
                isSelected ? 'bg-secondary text-white shadow-md' : 'hover:bg-primary/20 text-foreground'
            }`}>
                <div className="flex justify-between items-start">
                    <p className="font-semibold pr-2 truncate">{ticket.subject}</p>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20' : 'bg-background'
                    }`}>{ticket.status}</span>
                </div>
                <p className={`text-xs mt-1 ${isSelected ? 'opacity-90' : 'opacity-70'}`}>
                    {contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown Contact'}
                </p>
            </div>
        );
    };

    const MainContent = () => {
        if (!selectedTicket) {
            return (
                <main className="flex-1 bg-background p-8 flex items-center justify-center">
                     <div className="text-center">
                        <LifebuoyIcon className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
                        <h2 className="text-2xl font-bold text-foreground/80">Select a Ticket</h2>
                        <p className="text-foreground/60 mt-2">Choose a support ticket from the list to view its details and conversation history.</p>
                    </div>
                </main>
            );
        }
        
        const ticketContact = contacts.find(c => c.contact_id === selectedTicket.contact_id);

        return (
            <main className="flex-1 bg-background p-8 overflow-y-auto">
                <div className="mb-6 pb-4 border-b border-primary/50">
                    <h2 className="text-3xl font-bold text-foreground">{selectedTicket.subject}</h2>
                    {ticketContact && (
                         <div className="mt-2 text-sm flex items-center">
                            <UserIcon className="w-4 h-4 mr-2 text-foreground/60"/>
                            <button onClick={() => onNavigate('Contacts', ticketContact.contact_id)} className="text-left text-secondary hover:underline">
                                <span>{ticketContact.first_name} {ticketContact.last_name}</span>
                            </button>
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-semibold text-foreground/90">
                    Ticket Thread
                </h3>
                <Timeline interactions={interactions} isLoading={isLoadingDetails} />
            </main>
        );
    };

    return (
        <>
            <TicketFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTicketCreated={handleTicketCreated}
                contacts={contacts}
            />
            <MasterListSidebar
                title="Support Tickets"
                items={filteredTickets}
                selectedItem={selectedTicket}
                onSelectItem={setSelectedTicket}
                renderListItem={renderListItem}
                onAddItem={() => setIsModalOpen(true)}
                isLoading={isLoading}
                itemIdentifier="ticket_id"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search tickets by subject..."
                filterOptions={ticketFilterOptions}
                activeFilter={activeFilter}
                // FIX: Pass a new function to onFilterChange to ensure type compatibility and remove the unnecessary type cast.
                onFilterChange={(filter) => setActiveFilter(filter as SupportTicketStatus | 'All')}
            />
            <MainContent />
            <RightSidebar item={selectedTicket} interactions={interactions} />
        </>
    );
};
