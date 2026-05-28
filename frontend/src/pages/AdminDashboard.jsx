import React, { useState, useEffect } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import { 
  Users, UserCheck, UserX, Shield, UserCog, Briefcase, 
  Search, Filter, Trash2, Check, X, ChevronDown, 
  RefreshCw, AlertTriangle, ShieldCheck, Mail, Calendar, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modals & Active Actions
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null); // 'delete', 'change_role', 'approve', 'reject'
  const [newRole, setNewRole] = useState('');
  
  // Success/Error Toast Notifications
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/auth/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les utilisateurs. Assurez-vous d'être connecté avec un compte administrateur.");
      showToast("Erreur lors de la récupération des utilisateurs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/api/auth/approve/${id}`);
      showToast("L'utilisateur a été approuvé avec succès !");
      fetchAllUsers();
      closeModal();
    } catch (err) {
      showToast("Erreur lors de l'approbation de l'utilisateur", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/api/auth/reject/${id}`);
      showToast("La demande d'inscription a été rejetée.");
      fetchAllUsers();
      closeModal();
    } catch (err) {
      showToast("Erreur lors du rejet de la demande", "error");
    }
  };

  const handleChangeRole = async (id, role) => {
    try {
      await api.put(`/api/auth/users/${id}/role?role=${role}`);
      showToast(`Le rôle de l'utilisateur a été mis à jour vers ${role} !`);
      fetchAllUsers();
      closeModal();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Erreur de synchronisation avec user-service.";
      showToast(errMsg, "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/auth/users/${id}`);
      showToast("L'utilisateur a été supprimé définitivement des deux services.");
      fetchAllUsers();
      closeModal();
    } catch (err) {
      showToast("Erreur lors de la suppression de l'utilisateur", "error");
    }
  };

  const openModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
    if (type === 'change_role') {
      setNewRole(user.role);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
    setNewRole('');
  };

  // KPI Calculations
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.enabled).length;
  const pendingUsers = users.filter(u => !u.enabled).length;
  const admins = users.filter(u => u.role === 'ADMIN').length;
  const clients = users.filter(u => u.role === 'CLIENT').length;
  const techniciens = users.filter(u => u.role === 'TECHNICIEN').length;

  // Real-time Search & Filter matching
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    
    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && u.enabled) || 
      (statusFilter === 'PENDING' && !u.enabled);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getInitials = (username) => {
    if (!username) return 'U';
    return username.slice(0, 2).toUpperCase();
  };

  const getRoleBadge = (role) => {
    const r = {
      ADMIN: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: Shield, label: 'Admin' },
      CLIENT: { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Briefcase, label: 'Client' },
      TECHNICIEN: { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: UserCog, label: 'Tech' },
    }[role] || { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: Info, label: role };

    const Icon = r.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${r.bg}`}>
        <Icon size={12} />
        {r.label}
      </span>
    );
  };

  const getStatusBadge = (enabled) => {
    return enabled ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-active"></span>
        Actif
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-amber-500/20 bg-amber-500/5 text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 pulse-active"></span>
        En attente
      </span>
    );
  };

  return (
    <Layout>
      <div className="relative">
        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border ${
                toast.type === 'error' 
                  ? 'bg-slate-900 border-rose-500/20 text-rose-400' 
                  : 'bg-slate-900 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                toast.type === 'error' ? 'bg-rose-500/10' : 'bg-emerald-500/10'
              }`}>
                {toast.type === 'error' ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
              </div>
              <div>
                <p className="font-bold text-xs text-white leading-tight">Notification</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="ml-4 hover:opacity-75 transition-opacity text-slate-500 hover:text-slate-300">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Gestion des Utilisateurs</h1>
            <p className="text-xs text-slate-400 mt-1">Contrôlez les accès, changez les privilèges et gérez les inscriptions en attente.</p>
          </div>
          
          <button 
            onClick={fetchAllUsers} 
            className="flex items-center justify-center gap-2 h-10 px-4 bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl text-slate-300 hover:text-white font-semibold transition-all cursor-pointer text-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Error Alert Panel */}
        {error && (
          <div className="mb-8 p-4 bg-rose-500/5 border border-rose-500/10 text-rose-300 rounded-2xl flex items-center gap-3 shadow-md text-xs font-medium">
            <AlertTriangle className="flex-shrink-0 text-rose-500" size={16} />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}

        {/* METRICS / KPI GRID */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-8">
          {[
            { label: 'Utilisateurs', value: totalUsers, icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
            { label: 'Actifs', value: activeUsers, icon: UserCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'En Attente', value: pendingUsers, icon: UserX, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            { label: 'Administrateurs', value: admins, icon: Shield, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
            { label: 'Techniciens', value: techniciens, icon: UserCog, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
            { label: 'Clients', value: clients, icon: Briefcase, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 shadow-md flex justify-between items-center group relative overflow-hidden"
              >
                <div className="flex flex-col space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</span>
                  <h4 className="text-2xl font-bold text-white tracking-tight leading-none">{loading ? '...' : card.value}</h4>
                </div>
                <div className={`w-9 h-9 rounded-lg border ${card.color} flex items-center justify-center z-10 transition-transform group-hover:scale-105`}>
                  <Icon size={16} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* DATA CONTAINER CARD */}
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* SEARCH & FILTERS BAR */}
          <div className="p-5 border-b border-white/5 bg-slate-950/20 flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher par nom ou email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex gap-3 w-full md:w-auto md:ml-auto">
              {/* Role filter */}
              <div className="relative flex-1 md:flex-none">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full md:w-44 appearance-none h-10 pl-10 pr-8 bg-slate-900 border border-white/5 text-slate-300 rounded-xl text-xs font-bold outline-none focus:border-emerald-500/50 transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">Tous les rôles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="CLIENT">CLIENT</option>
                  <option value="TECHNICIEN">TECHNICIEN</option>
                </select>
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
              </div>

              {/* Status filter */}
              <div className="relative flex-1 md:flex-none">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-48 appearance-none h-10 pl-10 pr-8 bg-slate-900 border border-white/5 text-slate-300 rounded-xl text-xs font-bold outline-none focus:border-emerald-500/50 transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="ACTIVE">Actifs uniquement</option>
                  <option value="PENDING">En attente uniquement</option>
                </select>
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
              </div>
            </div>
          </div>

          {/* TABLE / LIST COMPONENT */}
          {loading ? (
            /* Premium Shimmer Loading Skeleton */
            <div className="divide-y divide-white/5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-slate-800 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-slate-800 rounded"></div>
                      <div className="w-48 h-3 bg-slate-800 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-20 h-6 bg-slate-800 rounded-full"></div>
                    <div className="w-16 h-6 bg-slate-800 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            /* Empty State */
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-800/40 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                <Users size={28} className="text-slate-500" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Aucun utilisateur trouvé</h3>
              <p className="text-xs text-slate-500 max-w-sm font-medium">Aucun compte ne correspond à vos filtres ou à votre recherche.</p>
            </div>
          ) : (
            /* Interactive Data Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/40 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-white/5">
                    <th className="px-6 py-4">Utilisateur</th>
                    <th className="px-6 py-4">Rôle</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4">Date de Création</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {filteredUsers.map((u, idx) => (
                      <motion.tr 
                        key={u.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-white/[0.01] transition-colors group"
                      >
                        {/* User Identity Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            {/* Initials Avatar */}
                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-300 font-bold text-xs shadow-sm group-hover:scale-105 transition-transform duration-350">
                              {getInitials(u.username)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs flex items-center gap-1.5">
                                {u.username}
                                {u.username === 'admin' && (
                                  <span className="bg-emerald-500/10 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded font-bold border border-emerald-500/20">SYSTEM</span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 mt-1">
                                <Mail size={12} className="text-slate-600" />
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* User Role Badge */}
                        <td className="px-6 py-4">
                          {getRoleBadge(u.role)}
                        </td>

                        {/* User Account Status */}
                        <td className="px-6 py-4">
                          {getStatusBadge(u.enabled)}
                        </td>

                        {/* Creation Date */}
                        <td className="px-6 py-4 text-[11px] font-semibold text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-600" />
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            }) : 'N/A'}
                          </div>
                        </td>

                        {/* Dynamic Action Buttons */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end items-center opacity-90 group-hover:opacity-100 transition-opacity">
                            {/* If pending registration */}
                            {!u.enabled ? (
                              <>
                                <button 
                                  onClick={() => openModal(u, 'approve')}
                                  title="Approuver l'inscription"
                                  className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 rounded-lg shadow-sm transition-all cursor-pointer"
                                >
                                  <Check size={14} className="stroke-[2.5]" />
                                </button>
                                <button 
                                  onClick={() => openModal(u, 'reject')}
                                  title="Rejeter l'inscription"
                                  className="w-8 h-8 flex items-center justify-center bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-lg shadow-sm transition-all cursor-pointer"
                                >
                                  <X size={14} className="stroke-[2.5]" />
                                </button>
                              </>
                            ) : (
                              /* If active user */
                              <>
                                <button 
                                  onClick={() => openModal(u, 'change_role')}
                                  title="Modifier le rôle"
                                  disabled={u.username === 'admin'}
                                  className={`h-8 px-3 bg-slate-900 text-slate-300 border border-white/5 hover:border-white/10 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                    u.username === 'admin' ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'active:scale-95'
                                  }`}
                                >
                                  <span>Changer Rôle</span>
                                  <ChevronDown size={10} />
                                </button>

                                <button 
                                  onClick={() => openModal(u, 'delete')}
                                  title="Supprimer définitivement"
                                  disabled={u.username === 'admin'}
                                  className={`w-8 h-8 flex items-center justify-center bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm cursor-pointer ${
                                    u.username === 'admin' ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'active:scale-90'
                                  }`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DYNAMIC CONFIRMATION MODALS WITH BACKDROP BLUR & FRAMER MOTION */}
        <AnimatePresence>
          {modalType && selectedUser && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-[#0f172a] rounded-2xl border border-white/5 shadow-2xl w-full max-w-md overflow-hidden"
              >
                {/* Modal Header */}
                <div className="px-6 py-5 bg-slate-950/40 border-b border-white/5 flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm">
                    {modalType === 'approve' && "Approuver le compte"}
                    {modalType === 'reject' && "Rejeter l'inscription"}
                    {modalType === 'delete' && "Supprimer définitivement"}
                    {modalType === 'change_role' && "Changer le rôle d'accès"}
                  </h3>
                  <button onClick={closeModal} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {modalType === 'approve' && (
                    <div className="space-y-4">
                      <p className="text-slate-300 font-medium text-xs leading-relaxed">
                        Êtes-vous sûr de vouloir approuver l'utilisateur <strong className="text-white">@{selectedUser.username}</strong> ({selectedUser.email}) ?
                      </p>
                      <p className="text-[11px] text-slate-400 bg-slate-950 p-3.5 rounded-xl border border-white/5 font-semibold">
                        Une fois approuvé, son compte passera à l'état actif et il pourra immédiatement se connecter à son interface <strong>{selectedUser.role}</strong>.
                      </p>
                    </div>
                  )}

                  {modalType === 'reject' && (
                    <div className="space-y-4">
                      <p className="text-slate-300 font-medium text-xs leading-relaxed">
                        Êtes-vous sûr de vouloir rejeter et supprimer la demande d'inscription de <strong className="text-white">@{selectedUser.username}</strong> ?
                      </p>
                      <p className="text-[11px] text-rose-400 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 font-semibold flex items-center gap-2">
                        <AlertTriangle size={14} className="flex-shrink-0" />
                        Cette opération est irréversible. Toutes ses données d'inscription seront purgées.
                      </p>
                    </div>
                  )}

                  {modalType === 'delete' && (
                    <div className="space-y-4">
                      <p className="text-slate-300 font-medium text-xs leading-relaxed">
                        Êtes-vous sûr de vouloir supprimer définitivement le compte de <strong className="text-white">@{selectedUser.username}</strong> ({selectedUser.email}) ?
                      </p>
                      <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-2">
                        <p className="text-[11px] text-rose-400 font-bold leading-relaxed flex items-center gap-2">
                          <AlertTriangle size={14} /> Action critique de synchronisation
                        </p>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                          Cet utilisateur sera complètement effacé de <strong>auth_db</strong> et de <strong>user_db</strong> (les deux microservices seront synchronisés). Il ne pourra plus s'authentifier.
                        </p>
                      </div>
                    </div>
                  )}

                  {modalType === 'change_role' && (
                    <div className="space-y-4">
                      <p className="text-slate-300 font-medium text-xs">
                        Sélectionnez le nouveau rôle d'habilitation pour <strong className="text-white">@{selectedUser.username}</strong> :
                      </p>
                      
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          { role: 'CLIENT', label: 'CLIENT', desc: 'Accès limité au parc d\'écrans en lecture et tickets.', icon: Briefcase, color: 'border-blue-500/20 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10' },
                          { role: 'TECHNICIEN', label: 'TECHNICIEN', desc: 'Gestion des dépannages et tickets de maintenance.', icon: UserCog, color: 'border-amber-500/20 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10' },
                          { role: 'ADMIN', label: 'ADMINISTRATEUR', desc: 'Contrôle complet de la plateforme et des terminaux.', icon: Shield, color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10' }
                        ].map((choice) => {
                          const Icon = choice.icon;
                          const isSelected = newRole === choice.role;
                          return (
                            <button
                              key={choice.role}
                              type="button"
                              onClick={() => setNewRole(choice.role)}
                              className={`w-full p-4 rounded-xl border text-left flex gap-3.5 items-center transition-all cursor-pointer ${
                                isSelected 
                                  ? `${choice.color.split(' ')[0]} ${choice.color.split(' ')[2]} border-2 scale-[1.01] ring-4 ring-emerald-500/5 shadow-sm` 
                                  : 'border-white/5 bg-slate-900/40 text-slate-400 hover:text-white'
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-slate-800' : 'bg-slate-950'
                              }`}>
                                <Icon size={16} className={isSelected ? choice.color.split(' ')[1] : 'text-slate-500'} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-xs leading-tight">{choice.label}</p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-1 truncate">{choice.desc}</p>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shrink-0">
                                  <Check size={12} className="stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Actions Footer */}
                <div className="px-6 py-4 bg-slate-950/20 border-t border-white/5 flex justify-end gap-3">
                  <button 
                    onClick={closeModal} 
                    className="px-4 h-10 border border-white/5 hover:border-white/10 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>

                  {modalType === 'approve' && (
                    <button 
                      onClick={() => handleApprove(selectedUser.id)}
                      className="px-5 h-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                    >
                      Approuver le compte
                    </button>
                  )}

                  {modalType === 'reject' && (
                    <button 
                      onClick={() => handleReject(selectedUser.id)}
                      className="px-5 h-10 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/10 cursor-pointer"
                    >
                      Rejeter
                    </button>
                  )}

                  {modalType === 'delete' && (
                    <button 
                      onClick={() => handleDelete(selectedUser.id)}
                      className="px-5 h-10 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/10 cursor-pointer"
                    >
                      Supprimer Définitivement
                    </button>
                  )}

                  {modalType === 'change_role' && (
                    <button 
                      onClick={() => handleChangeRole(selectedUser.id, newRole)}
                      disabled={newRole === selectedUser.role}
                      className={`px-5 h-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer ${
                        newRole === selectedUser.role ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                      }`}
                    >
                      Sauvegarder le rôle
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
