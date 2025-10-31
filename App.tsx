import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { GooseOS } from './components/GooseOS';
import { ProposalViewer } from './components/proposal/ProposalViewer';

function App() {
  const { user } = useAuth();
  
  const urlParams = new URLSearchParams(window.location.search);
  const proposalId = urlParams.get('proposal_id');

  if (proposalId) {
    return <ProposalViewer proposalId={proposalId} />;
  }

  return user ? <GooseOS /> : <LoginScreen />;
}

export default App;