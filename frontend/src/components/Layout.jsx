import React from 'react';
import { LayoutDashboard, Users, Monitor, Ticket, Map as MapIcon, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, active }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100'}`}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </div>
);

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white h-screen border-r border-slate-200 p-6 flex flex-col gap-8">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">D</div>
        <h1 className="text-xl font-bold text-slate-800">Digitello</h1>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
        <SidebarItem icon={Users} label="Clients" />
        <SidebarItem icon={Monitor} label="Écrans" />
        <SidebarItem icon={Ticket} label="Tickets" />
        <SidebarItem icon={MapIcon} label="Carte" />
      </nav>

      <div className="pt-6 border-t border-slate-100 flex flex-col gap-2">
        <SidebarItem icon={Settings} label="Paramètres" />
        <SidebarItem icon={LogOut} label="Déconnexion" />
      </div>
    </aside>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Bienvenue, Administrateur</h2>
            <p className="text-slate-500">Voici ce qui se passe sur votre parc aujourd'hui.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
          </div>
        </header>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
