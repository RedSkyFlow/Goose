import React, { useState } from 'react';
import { Modal } from '../Modal';
import { NewCompany, Company } from '../../types';
import { createCompany } from '../../services/apiService';

interface CompanyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCompanyCreated: (company: Company) => void;
}

export const CompanyFormModal: React.FC<CompanyFormModalProps> = ({ isOpen, onClose, onCompanyCreated }) => {
    const [formData, setFormData] = useState<NewCompany>({
        name: '',
        domain: '',
        industry: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.domain || !formData.industry) {
            setError('All fields are required.');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            const newCompany = await createCompany(formData);
            onCompanyCreated(newCompany);
            setFormData({ name: '', domain: '', industry: '' }); // Reset form
        } catch (err) {
            console.error(err);
            setError('Failed to create company. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Company">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground/90 mb-1">Company Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-background text-foreground p-2 rounded-md border border-primary/70 focus:ring-2 focus:ring-secondary focus:outline-none"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="domain" className="block text-sm font-medium text-foreground/90 mb-1">Company Domain</label>
                    <input
                        type="text"
                        id="domain"
                        name="domain"
                        value={formData.domain}
                        onChange={handleChange}
                        className="w-full bg-background text-foreground p-2 rounded-md border border-primary/70 focus:ring-2 focus:ring-secondary focus:outline-none"
                        placeholder="example.com"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-foreground/90 mb-1">Industry</label>
                    <input
                        type="text"
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="w-full bg-background text-foreground p-2 rounded-md border border-primary/70 focus:ring-2 focus:ring-secondary focus:outline-none"
                        required
                    />
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
                        {isLoading ? 'Creating...' : 'Create Company'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};