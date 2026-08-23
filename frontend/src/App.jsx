import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseWorkspace from './pages/CaseWorkspace';
import Settings from './pages/Settings';
import { casesData, initialCasesList } from './data/mockData';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [cases, setCases] = useState(initialCasesList);
  const [casesFullData, setCasesFullData] = useState(casesData);
  const [currentCaseId, setCurrentCaseId] = useState('CASE-2026-001');

  // Fetch full dataset for the active case, providing a safe fallback object for newly created custom cases
  const selectedCaseData = casesFullData[currentCaseId] || {
    id: currentCaseId,
    name: cases.find(c => c.id === currentCaseId)?.name || "New Case File",
    type: cases.find(c => c.id === currentCaseId)?.type || "General Investigation",
    status: "Active",
    risk: "Medium",
    riskScore: 50,
    lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
    summary: cases.find(c => c.id === currentCaseId)?.description || "New case dossier initialized.",
    primaryPOI: "None",
    stats: { persons: 0, phones: 0, vehicles: 0, locations: 0 },
    nodes: [],
    edges: [],
    patterns: [],
    timeline: [],
    evidence: [],
    suggestedQuestions: [],
    chatResponses: {}
  };

  // State action to mark a case as solved
  const handleMarkCaseAsSolved = (caseId) => {
    // 1. Update full case data dossier status
    if (casesFullData[caseId]) {
      setCasesFullData({
        ...casesFullData,
        [caseId]: {
          ...casesFullData[caseId],
          status: 'Solved'
        }
      });
    }

    // 2. Update directory list case summary status
    setCases(cases.map(c => c.id === caseId ? { ...c, status: 'Solved' } : c));
  };

  // Switch Router
  const renderMainContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            cases={cases}
            setCurrentPage={setCurrentPage} 
            setCurrentCaseId={setCurrentCaseId} 
          />
        );
      case 'cases':
        return (
          <Cases 
            cases={cases} 
            setCases={setCases} 
            setCurrentCaseId={setCurrentCaseId} 
            setCurrentPage={setCurrentPage} 
          />
        );
      case 'case-workspace':
        return (
          <CaseWorkspace 
            caseData={selectedCaseData} 
            setCurrentPage={setCurrentPage} 
            onMarkAsSolved={handleMarkCaseAsSolved}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard 
            cases={cases}
            setCurrentPage={setCurrentPage} 
            setCurrentCaseId={setCurrentCaseId} 
          />
        );
    }
  };

  // Login Gate check
  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex bg-cyber-darkest text-slate-800 min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar Header */}
        <Topbar />

        {/* Dynamic page switcher view */}
        <main className="flex-1 flex flex-col relative bg-cyber-darkest overflow-hidden">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}
