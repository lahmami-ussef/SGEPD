import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TicketFormModal from '../components/TicketFormModal';
import api from '../api';
import { RefreshCw, Ticket, CheckCircle, Clock, AlertTriangle, UserCheck, Search, MoreVertical, Play, Check, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jwtDecode from 'jwt-decode';

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const initialFormState = {
    screenId: '', problemType: '', description: '', priority: 'MEDIUM', createdByUserId: 1
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, screensRes] = await Promise.all([
        api.get('/api/tickets'),
        api.get('/api/screens').catch(() => ({ data: [] }))
      ]);
      setTickets(ticketsRes.data || []);
      setScreens(screensRes.data || []);
    } catch (error) {
      console.error("Erreur de récupération des données", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        if (decoded.userId) {
          setFormData(prev => ({ ...prev, createdByUserId: decoded.userId }));
        }
      }
    } catch(e) {}
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        screenId: Number(formData.screenId),
        createdByUserId: Number(formData.createdByUserId),
      };
      await api.post('/api/tickets', payload);
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Erreur de création", error);
      alert("Erreur lors de la déclaration.");
    }
  };

  const updateStatus = async (id, action) => {
    try {
      await api.put(`/api/tickets/${id}/${action}`, {});
      fetchData();
    } catch (error) {
      console.error(`Erreur action ${action}`, error);
      alert("Impossible de changer le statut de ce ticket.");
    }
  };

  const resolveTicket = async (id) => {
    const report = window.prompt("Veuillez saisir votre rapport d'intervention de résolution :");
    if (report === null) return;
    try {
      await api.put(`/api/tickets/${id}/resolve`, { interventionReport: report });
      fetchData();
    } catch (error) {
      console.error("Erreur resolve", error);
      alert("Impossible de résoudre ce ticket.");
    }
  };

  const getPriorityBadge = (priority) => {
    const p = {
      LOW: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Basse' },
      MEDIUM: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Moyenne' },
      HIGH: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Haute' },
      CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critique' },
    }[priority] || { bg: 'bg-slate-100', text: 'text-slate-700', label: priority };
    return <span className={`px-2 py-0.5 inline-block text-[10px] rounded uppercase font-black tracking-widest ${p.bg} ${p.text}`}>{p.label}</span>;
  };

  const getStatusBadge = (status) => {
    const s = {
      OPEN: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Ouvert', dot: 'bg-amber-400' },
      IN_PROGRESS: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', label: 'En cours', dot: 'bg-blue-400' },
      RESOLVED: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Résolu', dot: 'bg-emerald-400' },
      CLOSED: { color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200', label: 'Fermé', dot: 'bg-slate-400' },
    }[status] || { color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200', label: status, dot: 'bg-slate-400' };
    
    return (
      <span className={`${s.bg} ${s.color} ${s.border} border px-3 py-1 text-[11px] rounded-full font-bold inline-flex items-center gap-2 shadow-sm`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
        {s.label}
      </span>
    );
  };

  const filteredTickets = tickets.filter(t => 
    t.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.problemType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Centre de Support</h1>
          <p className="text-slate-500 font-medium">Gérez les pannes, les interventions et assurez la maintenance du parc.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={fetchData} className="flex flex-row items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button onClick={handleOpenCreate} className="flex flex-row items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 active:scale-95">
            <Ticket size={20} />
            Ouvrir un ticket
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-amber-600 uppercase mb-1">À traiter</p>
            <h3 className="text-2xl font-black text-slate-800">{tickets.filter(t => t.status === 'OPEN').length}</h3>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-blue-600 uppercase mb-1">En cours</p>
            <h3 className="text-2xl font-black text-slate-800">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</h3>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Résolus</p>
            <h3 className="text-2xl font-black text-slate-800">{tickets.filter(t => t.status === 'RESOLVED').length}</h3>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Moy. Résolution</p>
            <h3 className="text-2xl font-black text-slate-800">4.2h</h3>
         </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un ticket ou un problème..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <RefreshCw size={40} className="text-amber-500 animate-spin mb-4" />
            <span className="text-slate-500 font-medium">Récupération des interventions...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-amber-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun ticket en attente</h3>
            <p className="text-slate-500 max-w-sm mb-8 font-medium">Félicitations ! Tous les problèmes signalés ont été traités ou la base est vide.</p>
            <button onClick={handleOpenCreate} className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all">
              Déclarer un incident
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Référence</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Problème / Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Écran</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded w-fit">{ticket.ticketNumber}</span>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{ticket.problemType}</span>
                        <span className="text-xs text-slate-500 mt-1 max-w-[300px] truncate" title={ticket.description}>
                          {ticket.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                          #{ticket.screenId}
                        </div>
                        <span className="text-xs font-bold text-slate-600">Terminal {ticket.screenId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        {ticket.status === 'OPEN' && (
                          <button 
                            onClick={() => updateStatus(ticket.id, 'start')} 
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <Play size={12} /> Démarrer
                          </button>
                        )}
                        {ticket.status === 'IN_PROGRESS' && (
                          <button 
                            onClick={() => resolveTicket(ticket.id)} 
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <Check size={12} /> Résoudre
                          </button>
                        )}
                        {ticket.status === 'RESOLVED' && (
                          <button 
                            onClick={() => updateStatus(ticket.id, 'close')} 
                            className="px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <XCircle size={12} /> Clôturer
                          </button>
                        )}
                        {ticket.status === 'CLOSED' && (
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">Archivé</span>
                        )}
                        <button className="p-2 text-slate-300 hover:text-slate-600 rounded-lg">
                           <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TicketFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        screens={screens}
      />
    </Layout>
  );
};

export default TicketManagement;
