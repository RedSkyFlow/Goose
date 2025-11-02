import React, { useState } from 'react';
import { Modal } from '../Modal';
import { NewSupportTicket, SupportTicket, Contact } from '../../types';
import { createSupportTicket } from '../../services/apiService';

interface TicketFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTicketCreated: (ticket: SupportTicket) => void;
    contacts: Contact[];
}

const initialState = {
    contact_id: '',
    subject: '',
    initial_message: ''
};

export const TicketFormModal: React.FC<TicketFormModalProps> = ({ isOpen, onClose, onTicketCreated, contacts }) => {
    const [formData, setFormData] = useState<Omit<NewSupportTicket, 'interaction_ids' | 'status'>>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.contact_id || !formData.subject || !formData.initial_message) {
            setError('All fields are required.');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            const newTicket = await createSupportTicket(formData);
            onTicketCreated(newTicket);
            setFormData(initialState);
        } catch (err) {
            console.error(err);
            setError('Failed to create ticket. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Support Ticket">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="contact_id" className="block text-sm font-medium text-foreground/90 mb-1">Contact</label>
                    <select id="contact_id" name="contact_id" value={formData.contact_id} onChange={handleChange} className="w-full bg-background text-foreground p-2 rounded-md border border-primary/70 focus:ring-2 focus:ring-secondary focus:outline-none" required>
                        <option value="" disabled>Select a contact</option>
                        {contacts.map(contact => (
                            <option key={contact.contact_id} value={contact.contact_id}>{contact.first_name} {contact.last_name} ({contact.email})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground/90 mb-1">Subject</label>
                    <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} className="w-full bg-background text-foreground p-2 rounded-md border border-primary/70 focus:ring-2 focus:ring-secondary focus:outline-none" required />
                </div>
                <div>
                    <label htmlFor="initial_message" className="block text-sm font-medium text-foreground/90 mb-1">Initial Message</label>
                    <textarea id="initial_message" name="initial_message" value={formData.initial_message} onChange={handleChange} rows={4} className="w-full bg-background text-foreground p-2 rounded-md border border-primary/70 focus:ring-2 focus:ring-secondary focus:outline-none" required />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex justify-end pt-2 space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md bg-primary/20 text-foreground/80 hover:bg-primary/40 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-semibold rounded-md bg-secondary text-white hover:opacity-90 transition-colors disabled:bg-secondary/50">
                        {isLoading ? 'Creating...' : 'Create Ticket'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};