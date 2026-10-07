import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  History, 
  MessageSquare, 
  TrendingUp, 
  PhoneCall, 
  LogOut,
  ShieldCheck,
  Info,
  Layers,
  Home as HomeIcon,
  Sparkles,
  ShieldAlert,
  Zap,
  FileText,
  Activity
} from 'lucide-react';

export default function Sidebar({ currentRoute, setCurrentRoute, user, onLogout }) {
  const menuItems = [
    { id: 'home', label: 'Home Page', icon: HomeIcon, roles: [] },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['user', 'admin'] },
    { id: 'accounts', label: 'My Accounts', icon: Wallet, roles: ['user'] },
    { id: 'transfers', label: 'Funds Transfer', icon: ArrowLeftRight, roles: ['user'] },
    { id: 'transactions', label: 'Transactions', icon: History, roles: ['user'] },
    { id: 'ai-assistant', label: 'AI Copilot Chat', icon: MessageSquare, roles: ['user', 'admin'] },
    { id: 'ai-cashflow', label: 'AI CashFlow Oracle', icon: Sparkles, roles: ['user'] },
    { id: 'ai-fraud', label: 'AI Fraud Guardian', icon: ShieldAlert, roles: ['user'] },
    { id: 'ai-subscriptions', label: 'AI Vampire Hunter', icon: Zap, roles: ['user'] },
    { id: 'ai-receipts', label: 'AI Receipt Scanner', icon: FileText, roles: ['user'] },
    { id: 'ai-health', label: 'AI Health 360°', icon: Activity, roles: ['user'] },
    { id: 'investments', label: 'Investments', icon: TrendingUp, roles: ['user'] },
    { id: 'contact', label: 'Contact Us', icon: PhoneCall, roles: ['user', 'admin'] },
    { id: 'about', label: 'About Us', icon: Info, roles: ['user', 'admin'] },
    { id: 'features', label: 'Features', icon: Layers, roles: ['user', 'admin'] },
    { id: 'admin', label: 'Admin Panel', icon: ShieldCheck, roles: ['admin'] },
  ];

  const allowedItems = menuItems.filter(item => {
    if (!user) {
      return ['home', 'about', 'features', 'contact'].includes(item.id);
    }
    return item.roles.includes(user.role);
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/images/hsbc.png" alt="SmartBank" />
        <span>SMARTBANK</span>
      </div>
      
      <ul className="sidebar-menu">
        {allowedItems.map(item => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          const isAiFeature = item.id.startsWith('ai-');
          return (
            <li key={item.id}>
              <a 
                onClick={() => setCurrentRoute(item.id)}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={isAiFeature && !isActive ? { color: 'var(--accent)' } : {}}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {user && (
        <a onClick={onLogout} className="sidebar-item" style={{ marginTop: 'auto', border: 'none', background: 'none', color: '#ef4444' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </a>
      )}
    </aside>
  );
}
