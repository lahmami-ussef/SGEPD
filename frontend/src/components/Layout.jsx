import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, useMatch } from 'react-router-dom';
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
  Bell,
  ChevronDown,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, to }) => {
  const match = useMatch(to);
  const isActive = !!match;

  return (
    <NavLink
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group relative ${
        isActive
          ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
          : 'text-slate-400 hover:bg-slate-900 hover:text-white font-medium border border-transparent'
      }`}
    >
      <div className={`transition-all ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
        <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'} />
      </div>
      <span className="text-xs relative z-10">{label}</span>
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </NavLink>
  );
};

const Sidebar = ({ userRole, onLogout }) => {
  const roleLabels = {
    ADMIN: 'Administration',
    CLIENT: 'Partenaire Client',
    TECHNICIEN: 'Technicien Sup'
  };

  const currentRoleLabel = roleLabels[userRole] || userRole;

  return (
    <aside className="w-72 bg-[#05070c] h-screen border-r border-white/5 flex flex-col justify-between flex-shrink-0 sticky top-0">
      <div className="flex flex-col gap-6 p-6">
        {/* Brand Logo - Vercel / Linear Style */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-extrabold text-lg shadow-lg shadow-emerald-500/10">
            D
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight tracking-tight">Digitello</h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">SGEPD Console</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5" />

        {/* User Role Badge */}
        <div className="px-2 py-2 bg-slate-900/40 rounded-xl border border-white/5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-active" />
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{currentRoleLabel}</span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1">
          <p className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Menu Principal</p>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />

          {userRole === 'ADMIN' && (
            <>
              <p className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2">Administration</p>
              <SidebarItem icon={Users} label="Gestion Clients" to="/clients" />
              <SidebarItem icon={MapIcon} label="Localisations" to="/locations" />
              <SidebarItem icon={ShieldCheck} label="Contrôle d'Accès" to="/admin-dashboard" />
            </>
          )}

          {(userRole === 'ADMIN' || userRole === 'CLIENT' || userRole === 'TECHNICIEN') && (
            <>
              <p className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2">Opérations</p>
              <SidebarItem icon={Monitor} label="Parc d'Écrans" to="/screens" />
              <SidebarItem icon={Ticket} label="Tickets Support" to="/tickets" />
            </>
          )}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-6 border-t border-white/5 flex flex-col gap-2 bg-[#030508]/30">
        <SidebarItem icon={Settings} label="Paramètres" to="/settings" />
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-rose-400 hover:bg-rose-500/5 transition-all text-xs font-semibold w-full text-left"
        >
          <LogOut size={18} className="text-rose-400/80" />
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock Notifications
  const mockNotifications = [
    { id: 1, title: "Nouvel utilisateur enregistré", desc: "Un nouvel utilisateur a créé un compte.", time: "Il y a 5 min", unread: true },
    { id: 2, title: "Mise à jour des rôles", desc: "Vos privilèges ont été modifiés avec succès.", time: "Il y a 2 heures", unread: true },
    { id: 3, title: "Jeton API généré", desc: "Un nouveau jeton d'accès a été émis.", time: "Hier", unread: false },
    { id: 4, title: "Analytiques rafraîchies", desc: "Le tableau de bord a synchronisé de nouvelles données.", time: "Hier", unread: false },
    { id: 5, title: "Alerte de sécurité", desc: "Nouvelle connexion détectée depuis un nouvel appareil.", time: "Il y a 2 jours", unread: false }
  ];

  const userRole = user?.role || 'CLIENT';
  const username = user?.username || 'Utilisateur';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get active page name and icon
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return { title: 'Tableau de bord', icon: LayoutDashboard };
    if (path.startsWith('/clients')) return { title: 'Gestion des Clients', icon: Users };
    if (path.startsWith('/screens')) return { title: 'Parc des Écrans', icon: Monitor };
    if (path.startsWith('/locations')) return { title: 'Localisations', icon: MapIcon };
    if (path.startsWith('/tickets')) return { title: 'Support & Tickets', icon: Ticket };
    if (path.startsWith('/admin-dashboard')) return { title: "Contrôle d'Accès", icon: ShieldCheck };
    if (path.startsWith('/settings')) return { title: 'Paramètres système', icon: Settings };
    return { title: 'Digitello', icon: Home };
  };

  const pageInfo = getPageTitle();
  const PageIcon = pageInfo.icon;

  return (
    <div className="flex min-h-screen bg-[#090d16]">
      {/* Fixed Sidebar */}
      <Sidebar userRole={userRole} onLogout={handleLogout} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar: Fixed Height h-16, Clean SaaS look */}
        <header className="h-16 bg-[#05070c] border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-40">
          {/* Page Title & Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-300">
              <PageIcon size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white leading-tight">{pageInfo.title}</h2>
            </div>
          </div>

          {/* Topbar Actions */}
          <div className="flex items-center gap-4">
            {/* Notification Center */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="w-9 h-9 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-white/5 text-slate-300 flex items-center justify-center transition-all relative cursor-pointer"
              >
                <Bell size={16} />
                {mockNotifications.some(n => n.unread) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-[#0f172a]/95 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl overflow-hidden z-50 flex flex-col"
                  >
                    <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                      <h3 className="text-xs font-bold text-white">Notifications</h3>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                        {mockNotifications.filter(n => n.unread).length} nvx
                      </span>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto custom-scrollbar flex flex-col">
                      {mockNotifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-4 border-b border-white/5 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${notif.unread ? 'bg-slate-900/40' : ''}`}
                        >
                          <div className="mt-0.5">
                            <div className={`w-2 h-2 rounded-full ${notif.unread ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                          </div>
                          <div>
                            <h4 className={`text-xs font-bold ${notif.unread ? 'text-white' : 'text-slate-300'}`}>{notif.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{notif.desc}</p>
                            <span className="text-[9px] text-slate-500 font-bold uppercase mt-2 inline-block">{notif.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-2 border-t border-white/5 bg-slate-900/50">
                      <button className="w-full py-2 text-center text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer">
                        Tout marquer comme lu
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-900 transition-all cursor-pointer border border-transparent hover:border-white/5"
              >
                {/* User Avatar */}
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/10">
                  {username.slice(0, 2).toUpperCase()}
                </div>
                {/* Username */}
                <span className="text-xs font-bold text-slate-200 hidden sm:inline-block">{username}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Pure Stripe-like Dropdown Card */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-[#0f172a] rounded-xl border border-white/5 shadow-2xl overflow-hidden z-50 p-1.5"
                  >
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-xs font-bold text-white">{username}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-wider">{userRole}</p>
                    </div>
                    <div className="py-1">
                      <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-left text-xs font-medium text-slate-300 hover:text-white w-full transition-colors cursor-pointer">
                        <Settings size={14} />
                        <span>Paramètres de profil</span>
                      </button>
                    </div>
                    <div className="border-t border-white/5 pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-500/10 text-left text-xs font-bold text-rose-400 w-full transition-all cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Area with strict spacing rhythm (px-8 py-8) */}
        <main className="flex-1 p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;