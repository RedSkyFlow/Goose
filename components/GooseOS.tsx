import React, { useState, useEffect } from 'react';
import { Toast } from './Toast';
import { FloatingGooseButton } from './FloatingGooseButton';
import { GooseChatModal } from './GooseChatModal';
import { MainNavbar, Hub } from './MainNavbar';
import { DealsHub } from './DealsHub';
import { CompaniesHub } from './companies/CompaniesHub';
import { ContactsHub } from './contacts/ContactsHub';
import { SupportHub } from './support/SupportHub';
import { MarketingHub } from './marketing/MarketingHub';
import { useNotification } from '../contexts/NotificationContext';

export interface NavigationTarget {
  hub: Hub;
  itemId: string;
}

export const GooseOS: React.FC = () => {
  const [activeHub, setActiveHub] = useState<Hub>('Deals');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState<NavigationTarget | null>(null);
  const { toast, closeToast } = useNotification();

  const handleNavigate = (hub: Hub, itemId: string) => {
    setActiveHub(hub);
    setNavigationTarget({ hub, itemId });
  };
  
  useEffect(() => {
    // Clear the navigation target after it's been sent to the hub component
    // This prevents re-triggering navigation on subsequent renders
    if (navigationTarget) {
      const timer = setTimeout(() => setNavigationTarget(null), 50);
      return () => clearTimeout(timer);
    }
  }, [navigationTarget]);


  const renderHub = () => {
    const props = { navigationTarget, onNavigate: handleNavigate };
    switch(activeHub) {
      case 'Deals':
        return <DealsHub {...props} />;
      case 'Companies':
        return <CompaniesHub {...props} />;
      case 'Contacts':
        return <ContactsHub {...props} />;
      case 'Support':
        return <SupportHub {...props} />;
      case 'Marketing':
        return <MarketingHub />;
      default:
        return <DealsHub {...props} />;
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
      <MainNavbar 
        activeHub={activeHub} 
        onHubChange={(hub) => {
          setActiveHub(hub);
          setNavigationTarget(null);
        }} 
      />
      
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