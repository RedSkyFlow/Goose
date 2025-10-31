import React, { useState, useEffect, useMemo } from 'react';
import type { Deal, Interaction } from '../types';
import { DealStage } from '../types';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { RightSidebar } from './RightSidebar';
import { Toast } from './Toast';
import { fetchDeals, fetchInteractions } from '../services/apiService';

export const GooseOS: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<DealStage | 'All'>('All');

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setIsLoadingDeals(true);
        const fetchedDeals = await fetchDeals();
        setDeals(fetchedDeals);
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
    loadDeals();
  }, []);

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
        const fetchedInteractions = await fetchInteractions(selectedDeal.deal_id);
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
        const newInteractions = await fetchInteractions(selectedDeal.deal_id);
        // Only update state if there's genuinely new data to avoid re-renders
        if (newInteractions.length > interactions.length) {
          setInteractions(newInteractions);
          setShowUpdateToast(true);
        }
      } catch (err) {
        console.error('Polling for new interactions failed:', err);
      }
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(intervalId);
  }, [selectedDeal, interactions]);

  const handleSelectDeal = (deal: Deal) => {
    setSelectedDeal(deal);
  };
  
  const handleRefreshInteractions = async () => {
    if (!selectedDeal) return;
    try {
        setIsLoadingInteractions(true);
        const fetchedInteractions = await fetchInteractions(selectedDeal.deal_id);
        setInteractions(fetchedInteractions);
        setShowUpdateToast(true);
    } catch (err) {
        setError('Failed to refresh interactions.');
        console.error(err);
    } finally {
        setIsLoadingInteractions(false);
    }
  };

  if (error) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background text-red-400">
            <p>Error: {error}</p>
        </div>
    )
  }

  return (
    <div className="flex h-screen w-full font-sans">
      <Toast 
        show={showUpdateToast}
        message="Timeline updated!"
        onClose={() => setShowUpdateToast(false)}
      />
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
        interactions={interactions}
        isLoadingInteractions={isLoadingInteractions}
        onRefresh={handleRefreshInteractions}
      />
      <RightSidebar deal={selectedDeal} interactions={interactions} />
    </div>
  );
}