import React, { useState, useEffect } from 'react';
import { Toast } from './Toast';
import { FloatingGooseButton } from './FloatingGooseButton';
import { GooseChatModal } from './GooseChatModal';
import { MainNavbar, Hub } from './MainNavbar';
import { DealsHub } from './DealsHub';
import { PlaceholderHub } from './PlaceholderHub';
import { CompaniesHub } from './companies/CompaniesHub';
import { ContactsHub } from './contacts/ContactsHub';

export const GooseOS: React.FC = () => {
  const [activeHub, setActiveHub] = useState<Hub>('Deals');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Auto-hide toast after a delay
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 4000); // Hide after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const renderHub = () => {
    switch(activeHub) {
      case 'Deals':
        return <DealsHub setToastMessage={setToastMessage} />;
      case 'Companies':
        return <CompaniesHub setToastMessage={setToastMessage} />;
      case 'Contacts':
        return <ContactsHub setToastMessage={setToastMessage} />;
      case 'Support':
        return <PlaceholderHub title="Support Hub" />;
      case 'Marketing':
        return <PlaceholderHub title="Marketing Hub" />;
      default:
        return <DealsHub setToastMessage={setToastMessage} />;
    }
  }

  return (
    <div className="flex h-screen w-full font-sans bg-background">
      <Toast 
        show={!!toastMessage}
        message={toastMessage}
        onClose={() => setToastMessage('')}
      />
      <MainNavbar activeHub={activeHub} onHubChange={setActiveHub} />
      
      <div className="flex flex-1 overflow-hidden">
        {renderHub()}
      </div>

      <FloatingGooseButton onClick={() => setIsChatModalOpen(true)} />
      <GooseChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        setToastMessage={setToastMessage}
      />
    </div>
  );
}