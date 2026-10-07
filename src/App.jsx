import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Import Pages
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transfers from './pages/Transfers';
import Transactions from './pages/Transactions';
import AIAssistant from './pages/AIAssistant';
import AICashFlowOracle from './pages/AICashFlowOracle';
import AIFraudGuardian from './pages/AIFraudGuardian';
import AISubscriptionHunter from './pages/AISubscriptionHunter';
import AIReceiptScanner from './pages/AIReceiptScanner';
import AIFinancialHealth from './pages/AIFinancialHealth';
import Investments from './pages/Investments';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentRoute, setCurrentRoute] = useState('home'); // default is landing page
  const [title, setTitle] = useState('');

  useEffect(() => {
    // Check if user session exists in localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setCurrentRoute('dashboard');
    }
  }, []);

  useEffect(() => {
    // Dynamically update the header title based on currentRoute
    switch (currentRoute) {
      case 'dashboard':
        setTitle(`Good Morning, ${user ? user.firstName : 'User'}`);
        break;
      case 'accounts':
        setTitle('My Accounts Directory');
        break;
      case 'transfers':
        setTitle('Funds Transfer');
        break;
      case 'transactions':
        setTitle('Historical Records');
        break;
      case 'ai-assistant':
        setTitle('Copilot Intelligence Workspace');
        break;
      case 'ai-cashflow':
        setTitle('AI CashFlow Oracle & Balance Forecaster');
        break;
      case 'ai-fraud':
        setTitle('AI Fraud Guardian & Risk Console');
        break;
      case 'ai-subscriptions':
        setTitle('AI Subscription Vampire Hunter');
        break;
      case 'ai-receipts':
        setTitle('AI Receipt OCR & Auto-Ledger');
        break;
      case 'ai-health':
        setTitle('360° AI Financial Health Diagnostics');
        break;
      case 'investments':
        setTitle('Wealth Portfolio');
        break;
      case 'contact':
        setTitle('Support Help Desk');
        break;
      case 'about':
        setTitle('About SmartBank plc');
        break;
      case 'features':
        setTitle('Core Features Overview');
        break;
      case 'admin':
        setTitle('Administrator Panel');
        break;
      default:
        setTitle('');
    }
  }, [currentRoute, user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentRoute('dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setCurrentRoute('home');
  };

  const renderPage = () => {
    switch (currentRoute) {
      case 'home':
        return <Home setCurrentRoute={setCurrentRoute} />;
      case 'about':
        return <About />;
      case 'features':
        return <Features />;
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} setCurrentRoute={setCurrentRoute} />;
      case 'register':
        return <Register onLoginSuccess={handleLoginSuccess} setCurrentRoute={setCurrentRoute} />;
      case 'dashboard':
        return <Dashboard user={user} setCurrentRoute={setCurrentRoute} />;
      case 'accounts':
        return <Accounts user={user} />;
      case 'transfers':
        return <Transfers user={user} />;
      case 'transactions':
        return <Transactions user={user} />;
      case 'ai-assistant':
        return <AIAssistant user={user} />;
      case 'ai-cashflow':
        return <AICashFlowOracle user={user} />;
      case 'ai-fraud':
        return <AIFraudGuardian user={user} />;
      case 'ai-subscriptions':
        return <AISubscriptionHunter user={user} />;
      case 'ai-receipts':
        return <AIReceiptScanner user={user} />;
      case 'ai-health':
        return <AIFinancialHealth user={user} />;
      case 'investments':
        return <Investments />;
      case 'contact':
        return <Contact />;
      case 'admin':
        return <Admin user={user} />;
      default:
        return <Home setCurrentRoute={setCurrentRoute} />;
    }
  };

  const isPlainPage = ['home', 'login', 'register'].includes(currentRoute);

  if (isPlainPage) {
    return (
      <div style={{ padding: '24px 40px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {renderPage()}
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar 
        currentRoute={currentRoute} 
        setCurrentRoute={setCurrentRoute} 
        user={user} 
        onLogout={handleLogout} 
      />
      
      <main className="main-workspace">
        <Header user={user} title={title} />
        <div style={{ marginTop: '24px' }}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
