import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Monitor, 
  Ticket, 
  Map as MapIcon, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Bell
} from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, to }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => 
      `flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isActive 
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </NavLink>
);

const Sidebar = ({ userRole, onLogout }) => {
  return (
    <aside className="w-64 bg-white h-screen border-r border-slate-200 p-6 flex flex-col justify-between flex-shrink-0 sticky top-0">
      <div className="flex flex-col gap-8">
        {/* Brand logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-emerald-600/10">
            D
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 leading-none">Digitello</h1>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">SGEPD Panel</span>
          </div>
        </div>

        {/* Dynamic menus based on role */}
        <nav className="flex flex-col gap-1.5">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
          
          {userRole === 'ADMIN' && (
            <SidebarItem icon={Users} label="Clients" to="/clients" />
          )}
          
          {(userRole === 'ADMIN' || userRole === 'CLIENT' || userRole === 'TECHNICIEN') && (
            <SidebarItem icon={Monitor} label="Écrans" to="/screens" />
          )}

          {userRole === 'ADMIN' && (
            <SidebarItem icon={MapIcon} label="Localisations" to="/locations" />
          )}

          {(userRole === 'ADMIN' || userRole === 'CLIENT' || userRole === 'TECHNICIEN') && (
            <SidebarItem icon={Ticket} label="Tickets" to="/tickets" />
          )}
          
          {userRole === 'ADMIN' && (
            <SidebarItem icon={ShieldCheck} label="Administration" to="/admin-dashboard" />
          )}
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-100 flex flex-col gap-1.5">
        <SidebarItem icon={Settings} label="Paramètres" to="/settings" />
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-red-500 hover:bg-red-50 transition-all font-medium text-sm w-full text-left"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const userRole = user?.role || 'CLIENT';
  const username = user?.username || 'Utilisateur';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get active page name from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Tableau de bord';
    if (path.startsWith('/clients')) return 'Gestion Clients';
    if (path.startsWith('/screens')) return 'Parc des Écrans';
    if (path.startsWith('/locations')) return 'Localisations';
    if (path.startsWith('/tickets')) return 'Centre de Support / Tickets';
    if (path.startsWith('/admin-dashboard')) return 'Console d\'Administration';
    if (path.startsWith('/settings')) return 'Paramètres du compte';
    return 'Portail SGEPD';
  };

  // Color mapping for roles
  const roleStyles = {
    ADMIN: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Admin' },
    CLIENT: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Client' },
    TECHNICIEN: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Technicien' },
  }[userRole] || { bg: 'bg-slate-50 text-slate-700 border-slate-200', label: userRole };

  return (
    <div className="flex bg-slate-50/50 min-h-screen">
      <Sidebar userRole={userRole} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Premium Topbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SGEPD Digitello</span>
            <h2 className="text-lg font-black text-slate-800 leading-tight">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Notification button */}
            <button className="w-10 h-10 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center relative transition-all cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Separator */}
            <div className="w-px h-6 bg-slate-200"></div>

            {/* User Profile Card */}
            <div className="flex items-center gap-3">
              {/* Info */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">{username}</p>
                <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${roleStyles.bg}`}>
                  {roleStyles.label}
                </span>
              </div>
              
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-extrabold text-base shadow-sm relative group cursor-pointer hover:border-slate-300 transition-all">
                {username.slice(0, 2).toUpperCase()}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;