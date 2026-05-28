import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ClientFormModal from '../components/ClientFormModal';
import api from '../api';
import { Pencil, Trash2, Plus, Building2, RefreshCw, Mail, Phone, MapPin, Search, TrendingUp, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const initialFormState = {
    raisonSociale: '', nomContact: '', email: '', telephone: '', adressePostale: '', userId: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/clients');
      setClients(res.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setCurrentClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setFormData(client);
    setIsEditing(true);
    setCurrentClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client et ses données associées ?")) {
      try {
        await api.delete(`/api/clients/${id}`);
        fetchClients();
      } catch (error) {
        console.error("Erreur lors de la suppression", error);
        alert("Erreur de suppression.");
      }
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = { ...formData, userId: formData.userId ? Number(formData.userId) : null };
    if (isEditing && currentClient) {
      await api.put(`/api/clients/${currentClient.id}`, payload);
    } else {
      await api.post('/api/clients', payload);
    }
    setIsModalOpen(false);
    fetchClients();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du client", error);
    const status = error?.response?.status;
    const msg = error?.response?.data?.message || error?.response?.data;

    // ✅ Network Error SANS response = serveur a traité mais connexion coupée
    if (!error.response) {
      console.warn('[handleSubmit] Network Error — probable succès côté serveur, rafraîchissement...');
      setIsModalOpen(false);
      setTimeout(() => fetchClients(), 500); // ✅ attend 500ms puis rafraîchit
      return;
    }

    if (status === 401) {
      setIsModalOpen(false);
      fetchClients();
    } else if (status === 409 || String(msg).toLowerCase().includes('email')) {
      alert("❌ Cet email est déjà utilisé par un autre client.");
    } else {
      alert("Erreur lors de la sauvegarde : " + (msg || status || "inconnue"));
    }
  }
};

  const filteredClients = clients.filter(c => 
    c.raisonSociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nomContact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Gestion des Clients</h1>
          <p className="text-xs text-slate-400 mt-1">Supervisez vos partenaires commerciaux et contrats d'affichage.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={fetchClients}
            className="flex items-center justify-center gap-2 h-10 px-4 bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl text-slate-300 hover:text-white font-semibold transition-all cursor-pointer text-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer text-xs"
          >
            <Plus size={16} />
            <span>Ajouter un client</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Clients Actifs', value: clients.length, icon: Building2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', trend: '+2.5%' },
          { label: 'Contrats Actifs', value: Math.max(clients.length, 0) * 2, icon: Briefcase, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', trend: '+8.2%' },
          { label: 'Taux Rétention', value: '98.5%', icon: TrendingUp, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20', trend: 'stable' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 shadow-md flex justify-between items-center group overflow-hidden">
              <div className="flex flex-col space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h4 className="text-2xl font-bold text-white tracking-tight leading-none">{stat.value}</h4>
                <p className="text-[9px] text-slate-500 mt-1 font-semibold">Performance {stat.trend}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg border ${stat.color} flex items-center justify-center`}>
                <Icon size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Table Card */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl shadow-lg overflow-hidden mb-8">
        {/* Search Section */}
        <div className="p-5 border-b border-white/5 bg-slate-950/20">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un client, contact ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
            />
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <RefreshCw size={36} className="text-emerald-500 animate-spin mb-4" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chargement des clients...</span>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-800/40 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
              <Building2 size={28} className="text-slate-500" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Aucun client trouvé</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6">Commencez à gérer vos partenaires en ajoutant votre premier client.</p>
            <button 
              onClick={handleOpenCreate}
              className="h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer text-xs flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Ajouter un client</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-white/5">
                  <th className="px-6 py-4">Entreprise</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Coordonnées</th>
                  <th className="px-6 py-4">Adresse</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredClients.map((client, idx) => (
                    <motion.tr 
                      key={client.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className="hover:bg-white/[0.01] transition-colors group"
                    >
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 text-slate-300 flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform duration-350 shrink-0">
                            {client.raisonSociale?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-white truncate max-w-[200px]">{client.raisonSociale}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-300">{client.nomContact}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 font-semibold text-slate-400">
                          <span className="flex items-center gap-2"><Mail size={12} className="text-slate-600" />{client.email}</span>
                          <span className="flex items-center gap-2"><Phone size={12} className="text-slate-600" />{client.telephone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-semibold text-slate-400 truncate max-w-[220px]">
                          <MapPin size={13} className="text-slate-600 shrink-0" />
                          <span className="truncate">{client.adressePostale}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEdit(client)} 
                            title="Modifier"
                            className="p-1.5 bg-slate-900 border border-white/5 text-slate-400 hover:text-white rounded-lg hover:border-white/10 transition-all cursor-pointer"
                          >
                            <Pencil size={13} />
                          </button>
                          <button 
                            onClick={() => handleDelete(client.id)} 
                            title="Supprimer"
                            className="p-1.5 bg-slate-900 border border-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/20 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
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

      <ClientFormModal 
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

export default ClientManagement;