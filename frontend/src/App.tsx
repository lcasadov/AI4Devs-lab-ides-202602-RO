import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { AddCandidatePage } from './pages/AddCandidatePage';

type View = 'dashboard' | 'addCandidate';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  function handleNavigateToAddCandidate() {
    setCurrentView('addCandidate');
  }

  function handleNavigateToDashboard() {
    setCurrentView('dashboard');
  }

  if (currentView === 'addCandidate') {
    return <AddCandidatePage onBack={handleNavigateToDashboard} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>LTI — Applicant Tracking System</p>
        <button
          onClick={handleNavigateToAddCandidate}
          style={styles.addCandidateButton}
        >
          + Añadir candidato
        </button>
      </header>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  addCandidateButton: {
    marginTop: '24px',
    padding: '12px 28px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.5px',
  },
};

export default App;
