import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import { Plus, RefreshCw, Search, Trash2, Monitor, Building2, Calendar, AlertTriangle, Check, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AssignmentManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [assignments, setAssignments] = useState([]);
  const [screens, setScreens] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(null);

  const initialForm = {
    screenId: '', clientId: '', startDate: '', endDate: '', notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aRes, sRes, cRes] = await Promise.all([
        api.get('/api/assignments'),
        api.get('/api/screens').catch(() => ({ data: [] })),
        api.get('/api/clients').catch(() => ({ data: [] })),
      ]);
      setAssignments(aRes.data || []);
      setScreens(sRes.data || []);
      setClients(cRes.data || []);
    } catch (error) {
      console.error("Erreur récupération", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getScreenName = (id) => {
    const s = screens.find(s => s.id === id || s.id === Number(id));
    return s ? `${s.name} (#${s.id})` : `Écran #${id}`;
  };

  const getClientName = (id) => {
    const c = clients.find(c => c.id === id || c.id === Number(id));
    return c ? c.raisonSociale : `Client #${id}`;
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setConflict(null);
    setSaving(true);
    try {
      const payload = {
        screenId: Number(formData.screenId),
        clientId: Number(formData.clientId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.notes || '',
      };
      await api.post('/api/assignments', payload);
      setIsModalOpen(false);
      setFormData(initialForm);
      fetchData();
    } catch (error) {
      if (!error.response) {
        // ✅ Network Error = serveur a probablement traité
        setIsModalOpen(false);
        setFormData(initialForm);
        setTimeout(() => fetchData(), 500);
        return;
      }
      const msg = error?.response?.data?.message
               || error?.response?.data
               || "Erreur lors de la création";

      // ✅ Affiche le conflit dans le modal au lieu d'un alert
      if (String(msg).toLowerCase().includes('conflit') ||
          String(msg).toLowerCase().includes('déjà affecté')) {
        setConflict(String(msg));
      } else {
        alert("Erreur : " + msg);
      }
    } finally {
      setSaving(false);
    }
};
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette affectation ?")) return;
    try {
      await api.delete(`/api/assignments/${id}`);
      fetchData();
    } catch (error) {
      if (!error.response) {
        setTimeout(() => fetchData(), 500);
      } else {
        alert("Erreur de suppression.");
      }
    }
  };

  const getStatusBadge = (assignment) => {
    const now = new Date();
    const start = new Date(assignment.startDate);
    const end = new Date(assignment.endDate);
    if (now < start) return (
      <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] rounded-lg font-bold flex items-center gap-1.5 w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> À venir
      </span>
    );
    if (now > end) return (
      <span className="px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[10px] rounded-lg font-bold flex items-center gap-1.5 w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Terminé
      </span>
    );
    return (
      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] rounded-lg font-bold flex items-center gap-1.5 w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Actif
      </span>
    );
  };

  const filteredAssignments = assignments.filter(a =>
    getScreenName(a.screenId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientName(a.clientId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = assignments.filter(a => {
    const now = new Date();
    return new Date(a.startDate) <= now && new Date(a.endDate) >= now;
  }).length;

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Affectations des Écrans</h1>
          <p className="text-xs text-slate-400 mt-1">Associez vos écrans publicitaires à vos clients sur des périodes définies.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={fetchData} className="flex items-center justify-center gap-2 h-10 px-4 bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl text-slate-300 hover:text-white font-semibold transition-all cursor-pointer text-xs">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
          {isAdmin && (
            <button onClick={() => { setFormData(initialForm); setConflict(null); setIsModalOpen(true); }} className="flex items-center justify-center gap-2 h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer text-xs">
              <Plus size={16} />
              <span>Nouvelle affectation</span>
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total affectations', value: assignments.length, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', icon: Calendar },
          { label: 'Actives', value: activeCount, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: Check },
          { label: 'Écrans occupés', value: [...new Set(assignments.filter(a => { const n = new Date(); return new Date(a.startDate) <= n && new Date(a.endDate) >= n; }).map(a => a.screenId))].length, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Monitor },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 shadow-md flex justify-between items-center">
              <div className="flex flex-col space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{k.label}</p>
                <h4 className="text-2xl font-bold text-white tracking-tight leading-none">{k.value}</h4>
              </div>
              <div className={`w-9 h-9 rounded-lg border ${k.color} flex items-center justify-center`}>
                <Icon size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="p-5 border-b border-white/5 bg-slate-950/20">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Rechercher par écran ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <RefreshCw size={36} className="text-emerald-500 animate-spin mb-4" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chargement des affectations...</span>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-800/40 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
              <Calendar size={28} className="text-slate-500" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Aucune affectation</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6">Associez vos écrans à des clients pour commencer.</p>
            {isAdmin && (
              <button onClick={() => setIsModalOpen(true)} className="h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer">
                <Plus size={16} /><span>Créer une affectation</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-white/5">
                  <th className="px-6 py-4">Écran</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Période</th>
                  <th className="px-6 py-4">Statut</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredAssignments.map((assignment, idx) => (
                    <motion.tr
                      key={assignment.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className="hover:bg-white/[0.01] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center">
                            <Monitor size={14} className="text-slate-400" />
                          </div>
                          <span className="font-bold text-white">{getScreenName(assignment.screenId)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-xs text-slate-300">
                            {getClientName(assignment.clientId)?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-300">{getClientName(assignment.clientId)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-300 font-semibold text-[11px]">
                            {new Date(assignment.startDate).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="text-slate-500 font-semibold text-[10px]">
                            → {new Date(assignment.endDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(assignment)}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(assignment.id)}
                            className="p-1.5 bg-slate-900 border border-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/20 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal création */}
      <AnimatePresence>
        {isModalOpen && (
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
              className="bg-[#0f172a] rounded-2xl border border-white/5 shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-sm">Nouvelle affectation</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Associer un écran à un client sur une période</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Conflit alert */}
                {conflict && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5">
                    <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                    <p className="text-xs text-rose-400 font-semibold">{conflict}</p>
                  </div>
                )}

                {/* Écran */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Écran</label>
                  <div className="relative">
                    <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <select
                      value={formData.screenId}
                      onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
                      required
                      className="w-full h-10 pl-9 pr-8 bg-slate-900 border border-white/5 text-white rounded-xl text-xs font-semibold outline-none focus:border-emerald-500/50 transition-all cursor-pointer appearance-none"
                    >
                      <option value="">— Sélectionner un écran —</option>
                      {screens.map(s => (
                        <option key={s.id} value={s.id}>{s.name} — {s.city} (#{s.id})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Client */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Client</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <select
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      required
                      className="w-full h-10 pl-9 pr-8 bg-slate-900 border border-white/5 text-white rounded-xl text-xs font-semibold outline-none focus:border-emerald-500/50 transition-all cursor-pointer appearance-none"
                    >
                      <option value="">— Sélectionner un client —</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.raisonSociale} — {c.nomContact}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Période */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Date de début</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className="w-full h-10 px-3 bg-slate-900 border border-white/5 text-white rounded-xl text-xs font-semibold outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Date de fin</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                      min={formData.startDate}
                      className="w-full h-10 px-3 bg-slate-900 border border-white/5 text-white rounded-xl text-xs font-semibold outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notes (optionnel)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Informations complémentaires..."
                    rows={2}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-white/5 text-white rounded-xl text-xs font-semibold outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-500 resize-none"
                  />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 h-10 border border-white/5 hover:border-white/10 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer">
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 h-10 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                  >
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                    <span>{saving ? 'Enregistrement...' : 'Affecter'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default AssignmentManagement;