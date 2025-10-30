import React, { useState, useEffect } from 'react';
import type { Deal, Interaction } from './types';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { RightSidebar } from './components/RightSidebar';
import { fetchDeals, fetchInteractions } from './services/apiService';

// --- APP COMPONENT ---

function App() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(false);
  const [error, setError] = useState<string | null>(null);

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


  const handleSelectDeal = (deal: Deal) => {
    setSelectedDeal(deal);
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
      <Sidebar 
        deals={deals} 
        selectedDeal={selectedDeal} 
        onSelectDeal={handleSelectDeal}
        isLoading={isLoadingDeals}
      />
      <MainContent 
        deal={selectedDeal} 
        interactions={interactions}
        isLoadingInteractions={isLoadingInteractions}
      />
      <RightSidebar deal={selectedDeal} interactions={interactions} />
    </div>
  );
}

export default App;
