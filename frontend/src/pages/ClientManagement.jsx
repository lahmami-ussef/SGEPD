import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ClientFormModal from '../components/ClientFormModal';
import api from '../api';
import { Pencil, Trash2, Plus, Building2, RefreshCw, Mail, Phone, MapPin, Search, ExternalLink, MoreVertical, Briefcase } from 'lucide-react';
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
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const filteredClients = clients.filter(c => 
    c.raisonSociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nomContact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gestion des Clients</h1>
          <p className="text-slate-500 font-medium">Gérez vos partenaires commerciaux et leurs contrats d'affichage.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={fetchClients} 
            className="flex flex-row items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button 
            onClick={handleOpenCreate} 
            className="flex flex-row items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <Plus size={20} />
            Ajouter un client
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                 <Building2 size={24} />
              </div>
              <div>
                 <p className="text-sm font-semibold text-slate-500">Clients Actifs</p>
                 <h4 className="text-2xl font-bold text-slate-800">{clients.length}</h4>
              </div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                 <Briefcase size={24} />
              </div>
              <div>
                 <p className="text-sm font-semibold text-slate-500">Contrats en cours</p>
                 <h4 className="text-2xl font-bold text-slate-800">{clients.length > 0 ? clients.length + 2 : 0}</h4>
              </div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                 <RefreshCw size={24} />
              </div>
              <div>
                 <p className="text-sm font-semibold text-slate-500">Taux de Rétention</p>
                 <h4 className="text-2xl font-bold text-slate-800">98.5%</h4>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par raison sociale, contact ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <RefreshCw size={40} className="text-indigo-500 animate-spin mb-4" />
            <span className="text-slate-500 font-medium tracking-wide">Chargement de la base clients...</span>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Building2 size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun client trouvé</h3>
            <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">Commencez par ajouter votre premier client partenaire pour gérer ses diffusions.</p>
            <button onClick={handleOpenCreate} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md">
              Ajouter un nouveau client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Entreprise / Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Coordonnées</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Adresse Postale</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                         <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-lg shadow-indigo-100 shadow-lg">
                           {client.raisonSociale?.charAt(0).toUpperCase()}
                         </div>
                         <div className="flex flex-col">
                           <span className="font-bold text-slate-800">{client.raisonSociale}</span>
                           <span className="text-xs text-slate-500 font-medium">{client.nomContact}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-slate-600 font-semibold flex items-center gap-2"><Mail size={12} className="text-slate-400" /> {client.email}</span>
                        <span className="text-xs text-slate-600 font-semibold flex items-center gap-2"><Phone size={12} className="text-slate-400" /> {client.telephone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                         <MapPin size={14} className="text-slate-400 shrink-0" />
                         <span className="truncate max-w-[220px]" title={client.adressePostale}>{client.adressePostale}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEdit(client)} 
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                          title="Modifier"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)} 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="group-hover:hidden">
                         <MoreVertical size={18} className="text-slate-300 ml-auto" />
                      </div>
                    </td>
                  </tr>
                ))}
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
