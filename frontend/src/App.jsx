import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import Investigation from './pages/Investigation';
import NetworkGraph from './pages/NetworkGraph';
import PatternAnalysis from './pages/PatternAnalysis';
import Timeline from './pages/Timeline';
import Evidence from './pages/Evidence';
import { initialCases } from './data/mockData';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [cases, setCases] = useState(initialCases);
  const [currentCaseId, setCurrentCaseId] = useState(initialCases[0].id);

  // Get active case data
  const currentCase = cases.find(c => c.id === currentCaseId) || cases[0];

  // Simple Router Switcher
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard currentCase={currentCase} cases={cases} setCurrentPage={setCurrentPage} />;
      case 'cases':
        return (
          <Cases 
            cases={cases} 
            setCases={setCases} 
            currentCaseId={currentCaseId} 
            setCurrentCaseId={setCurrentCaseId} 
          />
        );
      case 'investigation':
        return <Investigation />;
      case 'network':
        return <NetworkGraph />;
      case 'patterns':
        return <PatternAnalysis />;
      case 'timeline':
        return <Timeline />;
      case 'evidence':
        return <Evidence />;
      default:
        return <Dashboard currentCase={currentCase} cases={cases} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex bg-cyber-darkest text-slate-100 min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Workspace Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Topbar */}
        <Topbar 
          cases={cases} 
          currentCaseId={currentCaseId} 
          setCurrentCaseId={setCurrentCaseId} 
        />

        {/* Dynamic Page Render */}
        <main className="flex-1 flex flex-col relative bg-cyber-darkest">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
