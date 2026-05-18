import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Monitor, Ticket, Map as MapIcon, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: Monitor, label: 'Écrans', path: '/ecrans' },
  { icon: Ticket, label: 'Tickets', path: '/tickets' },
  { icon: MapIcon, label: 'Carte', path: '/carte' },
];

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium
      ${active
        ? 'bg-white/15 text-white border-l-2 border-emerald-300'
        : 'text-white/60 hover:bg-white/8 hover:text-white/90 border-l-2 border-transparent'
      }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside
      className="flex flex-col h-screen"
      style={{ width: '200px', flexShrink: 0, background: '#0F6E56' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
          D
        </div>
        <span className="text-white font-semibold text-base tracking-wide">Digitello</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 pt-4 flex-1">
        <p className="text-white/35 text-[10px] font-semibold uppercase tracking-widest px-3 mb-1">Principal</p>
        {NAV_ITEMS.map(({ icon, label, path }) => (
          <SidebarItem
            key={path}
            icon={icon}
            label={label}
            active={pathname === path || (path === '/dashboard' && pathname === '/')}
            onClick={() => navigate(path)}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3 flex flex-col gap-1">
        <SidebarItem icon={Settings} label="Paramètres" active={pathname === '/parametres'} onClick={() => navigate('/parametres')} />
        <SidebarItem icon={LogOut} label="Déconnexion" onClick={() => navigate('/login')} />
      </div>
    </aside>
  );
};

const Layout = ({ children }) => (
  <div className="flex min-h-screen" style={{ background: '#F4F7F5' }}>
    <Sidebar />
    <main className="flex-1 flex flex-col min-w-0">
      {/* Top header */}
      <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Bienvenue, Administrateur</h2>
          <p className="text-xs text-slate-400">Voici ce qui se passe sur votre parc aujourd'hui.</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
          AD
        </div>
      </header>

      {/* Page content */}
      <motion.div
        className="flex-1 px-8 py-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {children}
      </motion.div>
    </main>
  </div>
);

export default Layout;