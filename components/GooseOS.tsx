import React, { useState, useEffect } from 'react';
import { Toast } from './Toast';
import { FloatingGooseButton } from './FloatingGooseButton';
import { GooseChatModal } from './GooseChatModal';
import { MainNavbar, Hub } from './MainNavbar';
import { DealsHub } from './DealsHub';
import { PlaceholderHub } from './PlaceholderHub';
import { CompaniesHub } from './companies/CompaniesHub';
import { ContactsHub } from './contacts/ContactsHub';
import { useNotification } from '../contexts/NotificationContext';

export const GooseOS: React.FC = () => {
  const [activeHub, setActiveHub] = useState<Hub>('Deals');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const { toast, closeToast } = useNotification();

  const renderHub = () => {
    switch(activeHub) {
      case 'Deals':
        return <DealsHub />;
      case 'Companies':
        return <CompaniesHub />;
      case 'Contacts':
        return <ContactsHub />;
      case 'Support':
        return <PlaceholderHub title="Support Hub" />;
      case 'Marketing':
        return <PlaceholderHub title="Marketing Hub" />;
      default:
        return <DealsHub />;
    }
  }

  return (
    <div className="flex h-screen w-full font-sans bg-background">
      <Toast 
        show={!!toast}
        message={toast?.message || ''}
        onClose={closeToast}
        key={toast?.id}
      />
      <MainNavbar activeHub={activeHub} onHubChange={setActiveHub} />
      
      <div className="flex flex-1 overflow-hidden">
        {renderHub()}
      </div>

      <FloatingGooseButton onClick={() => setIsChatModalOpen(true)} />
      <GooseChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />
    </div>
  );
}