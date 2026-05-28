import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ScreenFormModal from '../components/ScreenFormModal';
import api from '../api';
import { Pencil, Trash2, Plus, Monitor, RefreshCw, Signal, Wifi, Search, Smartphone, Layers, MapPin, Building2, ChevronDown, X, Check, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ScreenManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isTechnicien = user?.role === 'TECHNICIEN';

  const [screens, setScreens] = useState([]);
  const [clients, setClients] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMenuId, setStatusMenuId] = useState(null);

  // Modal affectation rapide
  const [assignModalScreenId, setAssignModalScreenId] = useState(null);
  const [assignForm, setAssignForm] = useState({ clientId: '', startDate: '', endDate: '', description: '' });
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignConflict, setAssignConflict] = useState(null);

  const initialFormState = {
    name: '', brand: '', model: '', size: '', resolution: '',
    os: '', city: '', address: '', status: 'ACTIF'
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [screensRes, clientsRes, assignRes] = await Promise.all([
        api.get('/api/screens'),
        api.get('/api/clients').catch(() => ({ data: [] })),
        api.get('/api/assignments').catch(() => ({ data: [] })),
      ]);
      setScreens(screensRes.data || []);
      setClients(clientsRes.data || []);
      setAssignments(assignRes.data || []);
    } catch (error) {
      console.error("Erreur récupération", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ✅ Récupère l'affectation active d'un écran
  const getActiveAssignment = (screenId) => {
    const now = new Date();
    return assignments.find(a =>
      a.screenId === screenId &&
      new Date(a.startDate) <= now &&
      new Date(a.endDate) >= now
    );
  };

  const getClientName = (clientId) => {
    const c = clients.find(c => c.id === clientId || c.id === Number(clientId));
    return c ? c.raisonSociale : `Client #${clientId}`;
  };

  const handleStatusChange = async (screenId, newStatus) => {
    try {
      await api.patch(`/api/screens/${screenId}/status`, { status: newStatus });
      setStatusMenuId(null);
      fetchData();
    } catch (error) {
      if (!error.response) {
        setStatusMenuId(null);
        setTimeout(() => fetchData(), 500);
      } else {
        alert("Erreur changement de statut.");
      }
    }
  };

  // ✅ Affectation rapide depuis la carte écran
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignConflict(null);
    setAssignSaving(true);
    try {
      await api.post('/api/assignments', {
        screenId: Number(assignModalScreenId),
        clientId: Number(assignForm.clientId),
        startDate: assignForm.startDate,
        endDate: assignForm.endDate,
        description: assignForm.description || '',
      });
      setAssignModalScreenId(null);
      setAssignForm({ clientId: '', startDate: '', endDate: '', description: '' });
      fetchData();
    } catch (error) {
      if (!error.response) {
        setAssignModalScreenId(null);
        setTimeout(() => fetchData(), 500);
        return;
      }
      const msg = error?.response?.data?.message || error?.response?.data || "Erreur";
      if (String(msg).toLowerCase().includes('conflit') || String(msg).toLowerCase().includes('affecté')) {
        setAssignConflict(String(msg));
      } else {
        alert("Erreur : " + msg);
      }
    } finally {
      setAssignSaving(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setCurrentScreen(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (screen) => {
    setFormData(screen);
    setIsEditing(true);
    setCurrentScreen(screen);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet écran ?")) {
      try {
        await api.delete(`/api/screens/${id}`);
        fetchData();
      } catch (error) {
        if (!error.response) setTimeout(() => fetchData(), 500);
        else alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && currentScreen) {
        await api.put(`/api/screens/${currentScreen.id}`, formData);
      } else {
        await api.post('/api/screens', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      if (!error.response) {
        setIsModalOpen(false);
        setTimeout(() => fetchData(), 500);
        return;
      }
      alert(`Erreur: ${error?.response?.data?.message || 'inconnue'}`);
    }
  };

  const statusOptions = [
    { value: 'ACTIF', label: 'Opérationnel', color: 'text-emerald-400' },
    { value: 'EN_PANNE', label: 'En panne', color: 'text-rose-400' },
    { value: 'EN_MAINTENANCE', label: 'Maintenance', color: 'text-amber-400' },
  ];

  const getStatusBadge = (status) => {
    const s = {
      ACTIF:          { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Opérationnel' },
      EN_PANNE:       { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/20',    label: 'En panne' },
      EN_MAINTENANCE: { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20',   label: 'Maintenance' },
    }[status] || { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', label: status };

    return (
      <span className={`px-2.5 py-1 ${s.bg} ${s.text} border ${s.border} text-[10px] rounded-lg font-bold flex items-center gap-1.5 w-fit`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {s.label}
      </span>
    );
  };

  const filteredScreens = screens.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Parc des Écrans</h1>
          <p className="text-xs text-slate-400 mt-1">
            {isTechnicien ? "Consultez l'état du parc et mettez à jour les statuts." : "Supervisez et gérez vos terminaux d'affichage."}
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={fetchData} className="flex items-center justify-center gap-2 h-10 px-4 bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl text-slate-300 hover:text-white font-semibold transition-all cursor-pointer text-xs">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
          {isAdmin && (
            <button onClick={handleOpenCreate} className="flex items-center justify-center gap-2 h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer text-xs">
              <Plus size={16} /><span>Ajouter un terminal</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Écrans', value: screens.length, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
          { label: 'En ligne', value: screens.filter(s => s.status === 'ACTIF').length, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'En panne', value: screens.filter(s => s.status === 'EN_PANNE').length, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
          { label: 'Affectés', value: [...new Set(assignments.filter(a => { const n = new Date(); return new Date(a.startDate) <= n && new Date(a.endDate) >= n; }).map(a => a.screenId))].length, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        ].map((card, idx) => (
          <div key={idx} className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 shadow-md flex justify-between items-center">
            <div className="flex flex-col space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</p>
              <h4 className="text-2xl font-bold text-white tracking-tight leading-none">{card.value}</h4>
            </div>
            <div className={`w-9 h-9 rounded-lg border ${card.color} flex items-center justify-center`}>
              <Monitor size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="p-5 border-b border-white/5 bg-slate-950/20">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Rechercher par nom, marque, ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <RefreshCw size={36} className="text-emerald-500 animate-spin mb-4" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Récupération du parc...</span>
          </div>
        ) : filteredScreens.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <Monitor size={28} className="text-slate-500 mb-4" />
            <h3 className="text-sm font-bold text-white mb-1">Aucun terminal trouvé</h3>
            {isAdmin && (
              <button onClick={handleOpenCreate} className="mt-4 h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer">
                <Plus size={16} /><span>Ajouter un écran</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-950/20">
            <AnimatePresence>
              {filteredScreens.map(screen => {
                const activeAssignment = getActiveAssignment(screen.id);
                const clientName = activeAssignment ? getClientName(activeAssignment.clientId) : null;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    key={screen.id}
                    className="bg-[#0f172a]/60 rounded-2xl border border-white/5 shadow-md overflow-hidden hover:border-emerald-500/30 transition-all duration-300 group relative p-6 flex flex-col justify-between"
                    onClick={() => statusMenuId && setStatusMenuId(null)}
                  >
                    <div>
                      {/* Status + actions */}
                      <div className="flex justify-between items-start mb-3">
                        {(isAdmin || isTechnicien) ? (
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setStatusMenuId(statusMenuId === screen.id ? null : screen.id); }}
                              className="flex items-center gap-1.5 cursor-pointer"
                            >
                              {getStatusBadge(screen.status)}
                              <ChevronDown size={12} className="text-slate-500" />
                            </button>
                            {statusMenuId === screen.id && (
                              <div className="absolute top-8 left-0 z-20 bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[160px]">
                                {statusOptions.map(opt => (
                                  <button
                                    key={opt.value}
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(screen.id, opt.value); }}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-white/5 transition-colors flex items-center gap-2 ${opt.color} ${screen.status === opt.value ? 'bg-white/5' : ''}`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {opt.label}
                                    {screen.status === opt.value && <span className="ml-auto">✓</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          getStatusBadge(screen.status)
                        )}

                        {isAdmin && (
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenEdit(screen)} className="p-1.5 bg-slate-900 border border-white/5 text-slate-400 hover:text-white rounded-lg hover:border-white/10 transition-all cursor-pointer">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => handleDelete(screen.id)} className="p-1.5 bg-slate-900 border border-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/20 rounded-lg transition-all cursor-pointer">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* ✅ Badge client affecté */}
                      <div className="mb-3">
                        {activeAssignment ? (
                          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg w-fit">
                            <Building2 size={11} className="text-blue-400 shrink-0" />
                            <span className="text-[10px] font-bold text-blue-400 truncate max-w-[160px]">{clientName}</span>
                            <span className="text-[9px] text-blue-400/60 font-semibold">
                              jusqu'au {new Date(activeAssignment.endDate).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        ) : isAdmin ? (
                          <button
                            onClick={() => { setAssignModalScreenId(screen.id); setAssignConflict(null); setAssignForm({ clientId: '', startDate: '', endDate: '', description: '' }); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/60 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-emerald-400 transition-all cursor-pointer"
                          >
                            <Plus size={11} />
                            <span>Affecter à un client</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-600 italic">Non affecté</span>
                        )}
                      </div>

                      {/* Infos écran */}
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-12 h-12 bg-slate-800/80 border border-white/5 rounded-xl flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform duration-300 shadow-sm shrink-0">
                          <Monitor size={22} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm truncate">{screen.name}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 truncate">{screen.brand} • {screen.model}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 text-slate-300">
                          <Signal size={13} className="text-slate-500 shrink-0" />
                          <span className="text-[11px] font-semibold">{screen.resolution || 'N/A'} • {screen.size || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300">
                          <Smartphone size={13} className="text-slate-500 shrink-0" />
                          <span className="text-[11px] font-semibold">{screen.os || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300">
                          <MapPin size={13} className="text-slate-500 shrink-0" />
                          <span className="text-[11px] font-semibold truncate">{screen.city} ({screen.address || 'Sans adresse'})</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg border border-white/5 flex items-center justify-center text-slate-400">
                          <Layers size={10} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">ID: {screen.id}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Wifi size={13} />
                        <span className="text-[9px] font-mono font-bold">{screen.macAddress?.slice(-8) || '00:00:00'}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal affectation rapide */}
      <AnimatePresence>
        {assignModalScreenId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0f172a] rounded-2xl border border-white/5 shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-sm">Affecter l'écran #{assignModalScreenId}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Choisir un client et une période</p>
                </div>
                <button onClick={() => setAssignModalScreenId(null)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
                {assignConflict && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5">
                    <span className="text-xs text-rose-400 font-semibold">{assignConflict}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Client</label>
                  <select
                    value={assignForm.clientId}
                    onChange={(e) => setAssignForm({ ...assignForm, clientId: e.target.value })}
                    required
                    className="w-full h-10 px-3 bg-slate-900 border border-white/5 text-white rounded-xl text-xs font-semibold outline-none focus:border-emerald-500/50 transition-all cursor-pointer"
                  >
                    <option value="">— Sélectionner un client —</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.raisonSociale} — {c.nomContact}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Début</label>
                    <input
                      type="date"
                      value={assignForm.startDate}
                      onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })}
                      required
                      className="w-full h-10 px-3 bg-slate-900 border border-white/5 text-white rounded-xl text-xs font-semibold outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Fin</label>
                    <input
                      type="date"
                      value={assignForm.endDate}
                      onChange={(e) => setAssignForm({ ...assignForm, endDate: e.target.value })}
                      required
                      min={assignForm.startDate}
                      className="w-full h-10 px-3 bg-slate-900 border border-white/5 text-white rounded-xl text-xs font-semibold outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notes (optionnel)</label>
                  <input
                    type="text"
                    value={assignForm.description}
                    onChange={(e) => setAssignForm({ ...assignForm, description: e.target.value })}
                    placeholder="Description de l'affectation..."
                    className="w-full h-10 px-3 bg-slate-900 border border-white/5 text-white rounded-xl text-xs font-semibold outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                  <button type="button" onClick={() => setAssignModalScreenId(null)} className="px-4 h-10 border border-white/5 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer">
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={assignSaving}
                    className="px-5 h-10 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    {assignSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                    <span>{assignSaving ? 'Enregistrement...' : 'Affecter'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScreenFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </Layout>
  );
};

export default ScreenManagement;