import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LocationFormModal from '../components/LocationFormModal';
import api from '../api';
import { Pencil, Trash2, Plus, MapPin, RefreshCw, Navigation, Globe, Search, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const initialFormState = {
    screenId: '', city: '', address: '', latitude: '', longitude: '',
    country: '', postalCode: '', region: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [locRes, screenRes] = await Promise.all([
        api.get('/api/locations'),
        api.get('/api/screens').catch(() => ({ data: [] }))
      ]);
      setLocations(locRes.data || []);
      setScreens(screenRes.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des données", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setCurrentLocation(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (location) => {
    setFormData({ ...location, screenId: location.screenId || '' });
    setIsEditing(true);
    setCurrentLocation(location);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette localisation ?")) {
      try {
        await api.delete(`/api/locations/${id}`);
        fetchData();
      } catch (error) {
        if (!error.response) {
          setTimeout(() => fetchData(), 500);
        } else {
          alert("Erreur de suppression.");
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        screenId: Number(formData.screenId),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };
      if (isEditing && currentLocation) {
        await api.put(`/api/locations/${currentLocation.id}`, payload);
      } else {
        await api.post('/api/locations', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
    if (!error.response) {
        setIsModalOpen(false);
        setTimeout(() => fetchData(), 500);
        return;
    }
    const status = error?.response?.status;
    const msg = error?.response?.data?.message || error?.response?.data;
    if (status === 409 || String(msg).includes('dupliquée') || String(msg).includes('existe déjà')) {
        // ✅ Ne devrait plus arriver avec le fix backend, mais au cas où
        alert("Cet écran a déjà une localisation. La localisation existante sera mise à jour.");
        setIsModalOpen(false);
        fetchData();
    } else if (status === 401) {
        setIsModalOpen(false);
        fetchData();
    } else {
        alert("Erreur : " + (msg || status || "inconnue"));
    }
}
  };

  const filteredLocations = locations.filter(loc =>
    loc.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(loc.screenId).includes(searchTerm)
  );

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Gestion des Localisations</h1>
          <p className="text-xs text-slate-400 mt-1">Positionnez vos écrans géographiquement pour optimiser le suivi.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={fetchData} className="flex items-center justify-center gap-2 h-10 px-4 bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl text-slate-300 hover:text-white font-semibold transition-all cursor-pointer text-xs">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
          <button onClick={handleOpenCreate} className="flex items-center justify-center gap-2 h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer text-xs">
            <Plus size={16} />
            <span>Ajouter un lieu</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Localisations', value: locations.length, icon: MapPin, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'Villes Couvertes', value: [...new Set(locations.map(l => l.city).filter(Boolean))].length, icon: Globe, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Référentiel GPS', value: 'WGS84', icon: Navigation, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 shadow-md flex justify-between items-center">
              <div className="flex flex-col space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</p>
                <h4 className="text-2xl font-bold text-white tracking-tight leading-none">{card.value}</h4>
                <p className="text-[9px] text-slate-500 mt-1 font-semibold">Portée géomatique active</p>
              </div>
              <div className={`w-9 h-9 rounded-lg border ${card.color} flex items-center justify-center`}>
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
              placeholder="Rechercher par ville, adresse ou ID écran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <RefreshCw size={36} className="text-emerald-500 animate-spin mb-4" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Synchronisation GPS...</span>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-800/40 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
              <MapPin size={28} className="text-slate-500" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Aucune localisation trouvée</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6 font-medium">Aucune donnée ne correspond à votre recherche.</p>
            <button onClick={handleOpenCreate} className="h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer">
              <Plus size={16} /><span>Créer un point</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-white/5">
                  <th className="px-6 py-4">Écran</th>
                  <th className="px-6 py-4">Ville & Pays</th>
                  <th className="px-6 py-4">Adresse</th>
                  <th className="px-6 py-4">Coordonnées GPS</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredLocations.map((loc) => (
                    <motion.tr
                      key={loc.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="hover:bg-white/[0.01] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center">
                            <Layers size={14} className="text-slate-400" />
                          </div>
                          <div>
                            <span className="font-bold text-white">Monitor #{loc.screenId}</span>
                            <span className="text-[9px] text-slate-500 font-bold block uppercase mt-0.5">screen-service</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-300">{loc.city}</span>
                          <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                            <Globe size={11} /> {loc.country || 'Maroc'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-400 font-semibold truncate max-w-[200px] block" title={loc.address}>
                          {loc.address}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 font-mono font-bold text-[10px]">
                          <span className="text-emerald-400">Lat: {loc.latitude?.toFixed(5)}</span>
                          <span className="text-blue-400">Lng: {loc.longitude?.toFixed(5)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(loc)}
                            className="p-1.5 bg-slate-900 border border-white/5 text-slate-400 hover:text-white rounded-lg hover:border-white/10 transition-all cursor-pointer"
                            title="Modifier"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(loc.id)}
                            className="p-1.5 bg-slate-900 border border-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/20 rounded-lg transition-all cursor-pointer"
                            title="Supprimer"
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

      <LocationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        screens={screens}
      />
    </Layout>
  );
};

export default LocationManagement;