import React, { useState, useEffect, useMemo } from 'react';
import type { Deal, Interaction, Company } from '../types';
import { DealStage } from '../types';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { RightSidebar } from './RightSidebar';
import { fetchDeals, fetchInteractions, fetchCompanies } from '../services/apiService';
import { useNotification } from '../contexts/NotificationContext';
import type { NavigationTarget } from './GooseOS';
import type { Hub } from './MainNavbar';

interface DealsHubProps {
  navigationTarget: NavigationTarget | null;
  onNavigate: (hub: Hub, itemId: string) => void;
}

export const DealsHub: React.FC<DealsHubProps> = ({ navigationTarget, onNavigate }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<DealStage | 'All'>('All');
  const { showToast } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingDeals(true);
        const [fetchedDeals, fetchedCompanies] = await Promise.all([fetchDeals({}), fetchCompanies()]);
        setDeals(fetchedDeals);
        setCompanies(fetchedCompanies);

        if (fetchedDeals.length > 0) {
          setSelectedDeal(fetchedDeals[0]);
        }
      } catch (err) {
        setError('Failed to load deals.');
        console.error(err);
      } finally {
        setIsLoadingDeals(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (navigationTarget?.hub === 'Deals' && deals.length > 0) {
      const targetDeal = deals.find(d => d.deal_id === navigationTarget.itemId);
      if (targetDeal && targetDeal.deal_id !== selectedDeal?.deal_id) {
        setSelectedDeal(targetDeal);
      }
    }
  }, [navigationTarget, deals, selectedDeal]);

  const filteredDeals = useMemo(() => {
    return deals
      .filter(deal => {
        if (activeFilter === 'All') return true;
        return deal.stage === activeFilter;
      })
      .filter(deal => {
        return deal.deal_name.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [deals, searchTerm, activeFilter]);

  const selectedCompany = useMemo(() => {
    if (!selectedDeal) return null;
    return companies.find(c => c.company_id === selectedDeal.company_id) || null;
  }, [selectedDeal, companies]);


  useEffect(() => {
    // If a deal is selected but it gets filtered out by search/filter,
    // automatically select the first deal in the new filtered list.
    if (selectedDeal && !isLoadingDeals && !filteredDeals.find(d => d.deal_id === selectedDeal.deal_id)) {
        setSelectedDeal(filteredDeals.length > 0 ? filteredDeals[0] : null);
    }
  }, [filteredDeals, selectedDeal, isLoadingDeals]);

  useEffect(() => {
    if (!selectedDeal) {
      setInteractions([]);
      return;
    }

    const loadInteractions = async () => {
      try {
        setIsLoadingInteractions(true);
        const fetchedInteractions = await fetchInteractions({dealId: selectedDeal.deal_id});
        setInteractions(fetchedInteractions);
      } catch (err) {
        setError('Failed to load interactions for the selected deal.');
        console.error(err);
      } finally {
        setIsLoadingInteractions(false);
      }
    };

    loadInteractions();
  }, [selectedDeal]);

  // Polling effect for live updates
  useEffect(() => {
    if (!selectedDeal) return;

    const intervalId = setInterval(async () => {
      try {
        const newInteractions = await fetchInteractions({dealId: selectedDeal.deal_id});
        // Only update state if there's genuinely new data to avoid re-renders
        if (newInteractions.length > interactions.length) {
          setInteractions(newInteractions);
          showToast("Timeline updated!");
        }
      } catch (err) {
        console.error('Polling for new interactions failed:', err);
      }
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(intervalId);
  }, [selectedDeal, interactions, showToast]);

  const handleSelectDeal = (deal: Deal) => {
    setSelectedDeal(deal);
  };
  
  const handleRefreshInteractions = async () => {
    if (!selectedDeal) return;
    try {
        setIsLoadingInteractions(true);
        const fetchedInteractions = await fetchInteractions({dealId: selectedDeal.deal_id});
        setInteractions(fetchedInteractions);
        showToast("Timeline updated!");
    } catch (err) {
        setError('Failed to refresh interactions.');
        console.error(err);
    } finally {
        setIsLoadingInteractions(false);
    }
  };

  if (error) {
    return (
        <div className="flex h-full w-full items-center justify-center bg-background text-red-400">
            <p>Error: {error}</p>
        </div>
    )
  }

  return (
    <>
      <Sidebar 
        deals={filteredDeals} 
        selectedDeal={selectedDeal} 
        onSelectDeal={handleSelectDeal}
        isLoading={isLoadingDeals}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <MainContent 
        deal={selectedDeal} 
        company={selectedCompany}
        interactions={interactions}
        isLoadingInteractions={isLoadingInteractions}
        onRefresh={handleRefreshInteractions}
        onNavigate={onNavigate}
      />
      <RightSidebar 
        item={selectedDeal} 
        interactions={interactions} 
      />
    </>
  );
}