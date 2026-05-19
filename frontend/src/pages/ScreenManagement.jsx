import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ScreenFormModal from '../components/ScreenFormModal';
import api from '../api';
import { Pencil, Trash2, Plus, Monitor, RefreshCw, Signal, Wifi, Search, MoreVertical, Smartphone, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ScreenManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const initialFormState = {
    name: '', brand: '', model: '', size: '', resolution: '',
    os: '', city: '', address: '', status: 'ACTIF'
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchScreens = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/screens');
      setScreens(res.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des écrans", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, []);

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
        fetchScreens();
      } catch (error) {
        console.error("Erreur lors de la suppression", error);
        alert("Erreur lors de la suppression (admin requis).");
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
      fetchScreens();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde", error);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const getStatusBadge = (status) => {
    const s = {
      ACTIF: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500', label: 'Opérationnel' },
      EN_PANNE: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', dot: 'bg-red-500', label: 'En panne' },
      EN_MAINTENANCE: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500', label: 'Maintenance' },
    }[status] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100', dot: 'bg-slate-500', label: status };

    return (
      <span className={`px-2.5 py-1 ${s.bg} ${s.text} border ${s.border} text-[11px] rounded-full font-bold flex items-center gap-1.5 w-fit`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`}></span>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Parc des Écrans</h1>
          <p className="text-slate-500 font-medium">Supervisez et gérez l'état de vos terminaux d'affichage en temps réel.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={fetchScreens} 
            className="flex flex-row items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
          {isAdmin && (
            <button 
              onClick={handleOpenCreate} 
              className="flex flex-row items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
            >
              <Plus size={20} />
              Ajouter un terminal
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Écrans</p>
           <h4 className="text-3xl font-black text-slate-800">{screens.length}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
           <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">En ligne</p>
           <h4 className="text-3xl font-black text-slate-800">{screens.filter(s => s.status === 'ACTIF').length}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
           <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">En panne</p>
           <h4 className="text-3xl font-black text-slate-800">{screens.filter(s => s.status === 'EN_PANNE').length}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
           <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Maintenance</p>
           <h4 className="text-3xl font-black text-slate-800">{screens.filter(s => s.status === 'EN_MAINTENANCE').length}</h4>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, marque, ville..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <RefreshCw size={40} className="text-emerald-500 animate-spin mb-4" />
            <span className="text-slate-500 font-medium tracking-wide">Récupération de l'état du parc...</span>
          </div>
        ) : filteredScreens.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Monitor size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun terminal trouvé</h3>
            <p className="text-slate-500 max-w-sm mb-8">Votre parc d'affichage est vide ou aucun résultat ne correspond.</p>
            {isAdmin && (
              <button onClick={handleOpenCreate} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md">
                Enregistrer un premier écran
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-50/50">
            {filteredScreens.map(screen => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={screen.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group relative"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                     {getStatusBadge(screen.status)}
                     {isAdmin && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleOpenEdit(screen)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Pencil size={16} /></button>
                           <button onClick={() => handleDelete(screen.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                     )}
                  </div>

                  <div className="flex items-center gap-4 mb-5">
                     <div className="w-14 h-14 bg-gradient-to-tr from-slate-800 to-slate-600 rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden">
                        <Monitor size={28} />
                     </div>
                     <div>
                        <h4 className="font-extrabold text-slate-800 text-lg leading-tight">{screen.name}</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{screen.brand} • {screen.model}</p>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center gap-3 text-slate-600">
                        <Signal size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold">{screen.resolution || 'Résolution N/A'} • {screen.size || 'Taille N/A'}</span>
                     </div>
                     <div className="flex items-center gap-3 text-slate-600">
                        <Smartphone size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold">{screen.os || 'OS N/A'}</span>
                     </div>
                     <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                              <Layers size={12} />
                           </div>
                           <span className="text-[11px] font-bold text-slate-500">ID: {screen.id}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Wifi size={14} />
                          <span className="text-[10px] font-mono font-bold">{screen.macAddress?.slice(-8) || '00:00:00'}</span>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
