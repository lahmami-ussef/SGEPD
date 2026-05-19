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
      const res = await api.get('/auth/users');
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
      await api.post(`/auth/approve/${id}`);
      showToast("L'utilisateur a été approuvé avec succès !");
      fetchAllUsers();
      closeModal();
    } catch (err) {
      showToast("Erreur lors de l'approbation de l'utilisateur", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/auth/reject/${id}`);
      showToast("La demande d'inscription a été rejetée.");
      fetchAllUsers();
      closeModal();
    } catch (err) {
      showToast("Erreur lors du rejet de la demande", "error");
    }
  };

  const handleChangeRole = async (id, role) => {
    try {
      await api.put(`/auth/users/${id}/role?role=${role}`);
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
      await api.delete(`/auth/users/${id}`);
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
      ADMIN: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: Shield, label: 'Admin' },
      CLIENT: { bg: 'bg-blue-50 text-blue-700 border-blue-100', icon: Briefcase, label: 'Client' },
      TECHNICIEN: { bg: 'bg-amber-50 text-amber-700 border-amber-100', icon: UserCog, label: 'Tech' },
    }[role] || { bg: 'bg-slate-50 text-slate-700 border-slate-100', icon: Info, label: role };

    const Icon = r.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${r.bg}`}>
        <Icon size={12} />
        {r.label}
      </span>
    );
  };

  const getStatusBadge = (enabled) => {
    return enabled ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-50">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Actif
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-100 bg-amber-50 text-amber-700 shadow-sm shadow-amber-50">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
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
              className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${
                toast.type === 'error' 
                  ? 'bg-red-50 border-red-100 text-red-800' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-800'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                toast.type === 'error' ? 'bg-red-100' : 'bg-emerald-100'
              }`}>
                {toast.type === 'error' ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
              </div>
              <div>
                <p className="font-extrabold text-sm leading-tight">Notification</p>
                <p className="text-xs font-medium opacity-90 mt-0.5">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="ml-4 hover:opacity-75 transition-opacity">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gestion des Utilisateurs</h1>
            <p className="text-slate-500 font-medium">Contrôlez les accès, changez les privilèges et gérez les inscriptions en attente.</p>
          </div>
          
          <button 
            onClick={fetchAllUsers} 
            className="flex flex-row items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>

        {/* Error Alert Panel */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 flex gap-3 items-center">
            <AlertTriangle className="flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* METRICS / KPI GRID */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Utilisateurs', value: totalUsers, icon: Users, color: 'border-l-indigo-500 text-indigo-600 bg-indigo-50' },
            { label: 'Actifs', value: activeUsers, icon: UserCheck, color: 'border-l-emerald-500 text-emerald-600 bg-emerald-50' },
            { label: 'En Attente', value: pendingUsers, icon: UserX, color: 'border-l-amber-500 text-amber-600 bg-amber-50' },
            { label: 'Administrateurs', value: admins, icon: Shield, color: 'border-l-teal-500 text-teal-600 bg-teal-50' },
            { label: 'Techniciens', value: techniciens, icon: UserCog, color: 'border-l-orange-500 text-orange-600 bg-orange-50' },
            { label: 'Clients', value: clients, icon: Briefcase, color: 'border-l-blue-500 text-blue-600 bg-blue-50' }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white p-4 rounded-2xl border border-slate-200 border-l-4 ${card.color.split(' ')[0]} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
                  <div className={`p-1.5 rounded-lg ${card.color.split(' ').slice(2).join(' ')}`}>
                    <Icon size={14} className={card.color.split(' ')[1]} />
                  </div>
                </div>
                <h4 className="text-2xl font-black text-slate-800 leading-none">{loading ? '...' : card.value}</h4>
              </motion.div>
            );
          })}
        </div>

        {/* DATA CONTAINER CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
          {/* SEARCH & FILTERS BAR */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/40 flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher par nom ou email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-medium"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex gap-3 w-full md:w-auto md:ml-auto">
              {/* Role filter */}
              <div className="relative flex-1 md:flex-none">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full appearance-none pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">Tous les rôles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="CLIENT">CLIENT</option>
                  <option value="TECHNICIEN">TECHNICIEN</option>
                </select>
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
              </div>

              {/* Status filter */}
              <div className="relative flex-1 md:flex-none">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="ACTIVE">Actifs uniquement</option>
                  <option value="PENDING">En attente uniquement</option>
                </select>
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
              </div>
            </div>
          </div>

          {/* TABLE / LIST COMPONENT */}
          {loading ? (
            /* Premium Shimmer Loading Skeleton */
            <div className="divide-y divide-slate-100">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-slate-100 rounded"></div>
                      <div className="w-48 h-3 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-20 h-6 bg-slate-100 rounded-full"></div>
                    <div className="w-16 h-6 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            /* Empty State */
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Users size={36} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-1">Aucun utilisateur trouvé</h3>
              <p className="text-slate-400 max-w-sm text-sm font-medium">Aucun compte ne correspond à vos filtres ou à votre recherche.</p>
            </div>
          ) : (
            /* Interactive Data Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="px-6 py-4">Utilisateur</th>
                    <th className="px-6 py-4">Rôle</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4">Date de Création</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {filteredUsers.map((u, idx) => (
                      <motion.tr 
                        key={u.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-slate-50/30 transition-colors group"
                      >
                        {/* User Identity Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            {/* Initials Avatar */}
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/50 flex items-center justify-center text-slate-600 font-extrabold text-sm shadow-sm group-hover:scale-105 transition-transform duration-300">
                              {getInitials(u.username)}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800 text-sm leading-tight flex items-center gap-1.5">
                                {u.username}
                                {u.username === 'admin' && (
                                  <span className="bg-indigo-50 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-black border border-indigo-100">SYSTEM</span>
                                )}
                              </p>
                              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                <Mail size={12} className="text-slate-300" />
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
                        <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-300" />
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
                                  className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white rounded-xl shadow-sm transition-all active:scale-90"
                                >
                                  <Check size={15} />
                                </button>
                                <button 
                                  onClick={() => openModal(u, 'reject')}
                                  title="Rejeter l'inscription"
                                  className="p-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white rounded-xl shadow-sm transition-all active:scale-90"
                                >
                                  <X size={15} />
                                </button>
                              </>
                            ) : (
                              /* If active user */
                              <>
                                <button 
                                  onClick={() => openModal(u, 'change_role')}
                                  title="Modifier le rôle"
                                  disabled={u.username === 'admin'}
                                  className={`px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                    u.username === 'admin' ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
                                  }`}
                                >
                                  Changer Rôle
                                  <ChevronDown size={12} />
                                </button>

                                <button 
                                  onClick={() => openModal(u, 'delete')}
                                  title="Supprimer définitivement"
                                  disabled={u.username === 'admin'}
                                  className={`p-2 bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm ${
                                    u.username === 'admin' ? 'opacity-40 cursor-not-allowed' : 'active:scale-90'
                                  }`}
                                >
                                  <Trash2 size={15} />
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden"
              >
                {/* Modal Header */}
                <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-800 text-lg">
                    {modalType === 'approve' && "Approuver le compte"}
                    {modalType === 'reject' && "Rejeter l'inscription"}
                    {modalType === 'delete' && "Supprimer définitivement"}
                    {modalType === 'change_role' && "Changer le rôle d'accès"}
                  </h3>
                  <button onClick={closeModal} className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {modalType === 'approve' && (
                    <div className="space-y-4">
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">
                        Êtes-vous sûr de vouloir approuver l'utilisateur <strong className="text-slate-800 font-extrabold">@{selectedUser.username}</strong> ({selectedUser.email}) ?
                      </p>
                      <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                        Une fois approuvé, son compte passera à l'état actif et il pourra immédiatement se connecter à son interface <strong>{selectedUser.role}</strong>.
                      </p>
                    </div>
                  )}

                  {modalType === 'reject' && (
                    <div className="space-y-4">
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">
                        Êtes-vous sûr de vouloir rejeter et supprimer la demande d'inscription de <strong className="text-slate-800 font-extrabold">@{selectedUser.username}</strong> ?
                      </p>
                      <p className="text-xs text-red-500 bg-red-50/50 p-3 rounded-xl border border-red-100/50 font-bold flex items-center gap-2">
                        <AlertTriangle size={14} className="flex-shrink-0" />
                        Cette opération est irréversible. Toutes ses données d'inscription seront purgées.
                      </p>
                    </div>
                  )}

                  {modalType === 'delete' && (
                    <div className="space-y-4">
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">
                        Êtes-vous sûr de vouloir supprimer définitivement le compte de <strong className="text-slate-800 font-extrabold">@{selectedUser.username}</strong> ({selectedUser.email}) ?
                      </p>
                      <p className="text-xs text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-100 font-semibold leading-relaxed">
                        ⚠️ <strong>Action Critique :</strong> Cet utilisateur sera complètement effacé de <strong>auth_db</strong> et de <strong>user_db</strong> (les deux microservices seront synchronisés). Il ne pourra plus s'authentifier.
                      </p>
                    </div>
                  )}

                  {modalType === 'change_role' && (
                    <div className="space-y-5">
                      <p className="text-slate-500 font-medium text-sm">
                        Sélectionnez le nouveau rôle d'habilitation pour <strong className="text-slate-800 font-extrabold">@{selectedUser.username}</strong> :
                      </p>
                      
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          { role: 'CLIENT', label: 'CLIENT', desc: 'Accès limité au parc d\'écrans en lecture et tickets.', icon: Briefcase, color: 'border-blue-200 text-blue-700 bg-blue-50/30' },
                          { role: 'TECHNICIEN', label: 'TECHNICIEN', desc: 'Gestion des dépannages et tickets de maintenance.', icon: UserCog, color: 'border-amber-200 text-amber-700 bg-amber-50/30' },
                          { role: 'ADMIN', label: 'ADMINISTRATEUR', desc: 'Contrôle complet de la plateforme et des terminaux.', icon: Shield, color: 'border-emerald-200 text-emerald-700 bg-emerald-50/30' }
                        ].map((choice) => {
                          const Icon = choice.icon;
                          const isSelected = newRole === choice.role;
                          return (
                            <button
                              key={choice.role}
                              type="button"
                              onClick={() => setNewRole(choice.role)}
                              className={`w-full p-4 rounded-2xl border text-left flex gap-3.5 items-center transition-all ${
                                isSelected 
                                  ? `${choice.color.split(' ')[0]} ${choice.color.split(' ')[2]} border-2 scale-[1.01] ring-4 ring-slate-100 shadow-sm` 
                                  : 'border-slate-200 hover:bg-slate-50/50'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isSelected ? choice.color.split(' ')[2] : 'bg-slate-100'
                              }`}>
                                <Icon size={18} className={isSelected ? choice.color.split(' ')[1] : 'text-slate-500'} />
                              </div>
                              <div className="flex-1">
                                <p className="font-extrabold text-slate-800 text-sm leading-tight">{choice.label}</p>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{choice.desc}</p>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-white">
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
                <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex justify-end gap-3">
                  <button 
                    onClick={closeModal} 
                    className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors"
                  >
                    Annuler
                  </button>

                  {modalType === 'approve' && (
                    <button 
                      onClick={() => handleApprove(selectedUser.id)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                    >
                      Approuver le compte
                    </button>
                  )}

                  {modalType === 'reject' && (
                    <button 
                      onClick={() => handleReject(selectedUser.id)}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-100 active:scale-95 transition-all"
                    >
                      Rejeter
                    </button>
                  )}

                  {modalType === 'delete' && (
                    <button 
                      onClick={() => handleDelete(selectedUser.id)}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 active:scale-95 transition-all"
                    >
                      Supprimer Définitivement
                    </button>
                  )}

                  {modalType === 'change_role' && (
                    <button 
                      onClick={() => handleChangeRole(selectedUser.id, newRole)}
                      disabled={newRole === selectedUser.role}
                      className={`px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all ${
                        newRole === selectedUser.role ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
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
