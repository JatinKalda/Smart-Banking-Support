import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  History, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  PhoneCall, 
  LogOut,
  ShieldCheck,
  Info,
  Layers,
  Home as HomeIcon
} from 'lucide-react';

export default function Sidebar({ currentRoute, setCurrentRoute, user, onLogout }) {
  const menuItems = [
    { id: 'home', label: 'Home Page', icon: HomeIcon, roles: [] },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['user', 'admin'] },
    { id: 'accounts', label: 'My Accounts', icon: Wallet, roles: ['user'] },
    { id: 'transfers', label: 'Funds Transfer', icon: ArrowLeftRight, roles: ['user'] },
    { id: 'transactions', label: 'Transactions', icon: History, roles: ['user'] },
    { id: 'ai-assistant', label: 'AI Assistant', icon: MessageSquare, roles: ['user', 'admin'] },
    { id: 'investments', label: 'Investments', icon: TrendingUp, roles: ['user'] },
    { id: 'contact', label: 'Contact Us', icon: PhoneCall, roles: ['user', 'admin'] },
    { id: 'about', label: 'About Us', icon: Info, roles: ['user', 'admin'] },
    { id: 'features', label: 'Features', icon: Layers, roles: ['user', 'admin'] },
    { id: 'admin', label: 'Admin Panel', icon: ShieldCheck, roles: ['admin'] },
  ];

  const allowedItems = menuItems.filter(item => {
    if (!user) {
      // If not logged in, only show public pages including Home Page and Contact Us
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
          return (
            <li key={item.id}>
              <a 
                onClick={() => setCurrentRoute(item.id)}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Icon />
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {user && (
        <a onClick={onLogout} className="sidebar-item" style={{ marginTop: 'auto', border: 'none', background: 'none', color: '#ef4444' }}>
          <LogOut />
          <span>Logout</span>
        </a>
      )}
    </aside>
  );
}
