import React, { useState } from 'react';
import { Modal } from '../Modal';
import { NewContact, Contact, Company } from '../../types';
import { createContact } from '../../services/apiService';

interface ContactFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContactCreated: (contact: Contact) => void;
    companies: Company[];
}

const initialState: NewContact = {
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    company_id: ''
};

export const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose, onContactCreated, companies }) => {
    const [formData, setFormData] = useState<NewContact>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.company_id) {
            setError('First name, last name, email, and company are required.');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            const newContact = await createContact(formData);
            onContactCreated(newContact);
            setFormData(initialState); // Reset form
        } catch (err) {
            console.error(err);
            setError('Failed to create contact. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Contact">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-foreground/90 mb-1">First Name</label>
                        <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full bg-background text-foreground p-2 rounded-md border border-primary/70 focus:ring-2 focus:ring-secondary focus:outline-none" required />
                    </div>
                    <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-foreground/90 mb-1">Last Name</label>
                        <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full bg-background text-foreground p-2 rounded-md border border-primary/70 focus:ring-2 focus:ring-secondary focus:outline-none" required />
                    </div>
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground/90 mb-1">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-background text-foreground p-2 rounded-md border border-primary/70 focus:ring-2 focus:ring-secondary focus:outline-none" required />
                </div>
                 <div>
                    <label htmlFor="role" className="block text-sm font-medium text-foreground/90 mb-1">Role</label>
                    <input type="text" id="role" name="role" value={formData.role} onChange={handleChange} className="w-full bg-background text-foreground p-2 rounded-md border border-primary/70 focus:ring-2 focus:ring-secondary focus:outline-none" />
                </div>
                 <div>
                    <label htmlFor="company_id" className="block text-sm font-medium text-foreground/90 mb-1">Company</label>
                    <select id="company_id" name="company_id" value={formData.company_id} onChange={handleChange} className="w-full bg-background text-foreground p-2 rounded-md border border-primary/70 focus:ring-2 focus:ring-secondary focus:outline-none" required>
                        <option value="" disabled>Select a company</option>
                        {companies.map(company => (
                            <option key={company.company_id} value={company.company_id}>{company.name}</option>
                        ))}
                    </select>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex justify-end pt-2 space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md bg-primary/20 text-foreground/80 hover:bg-primary/40 transition-colors">
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-semibold rounded-md bg-secondary text-white hover:opacity-90 transition-colors disabled:bg-secondary/50"
                    >
                        {isLoading ? 'Creating...' : 'Create Contact'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};