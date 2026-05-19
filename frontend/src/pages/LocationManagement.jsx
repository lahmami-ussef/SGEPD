import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LocationFormModal from '../components/LocationFormModal';
import api from '../api';
import { Pencil, Trash2, Plus, MapPin, RefreshCw, Navigation, Globe, Search, MoreVertical, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const initialFormState = {
    screenId: '', city: '', address: '', latitude: '', longitude: '', country: '', postalCode: '', region: ''
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setCurrentLocation(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (location) => {
    setFormData({
      ...location,
      screenId: location.screenId || ''
    });
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
        console.error("Erreur lors de la suppression", error);
        alert("Erreur de suppression (vérifiez vos droits Admin).");
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
      console.error("Erreur lors de la sauvegarde", error);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const filteredLocations = locations.filter(loc => 
    loc.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(loc.screenId).includes(searchTerm)
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gestion des Localisations</h1>
          <p className="text-slate-500 font-medium">Positionnez vos écrans géographiquement pour optimiser le suivi.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={fetchData} 
            className="flex flex-row items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button 
            onClick={handleOpenCreate} 
            className="flex flex-row items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
          >
            <Plus size={20} />
            Ajouter un lieu
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                 <MapPin size={24} />
              </div>
              <div>
                 <p className="text-sm font-semibold text-slate-500">Total Localisations</p>
                 <h4 className="text-2xl font-bold text-slate-800">{locations.length}</h4>
              </div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                 <Globe size={24} />
              </div>
              <div>
                 <p className="text-sm font-semibold text-slate-500">Villes Couvertes</p>
                 <h4 className="text-2xl font-bold text-slate-800">
                    {[...new Set(locations.map(l => l.city))].length}
                 </h4>
              </div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                 <Navigation size={24} />
              </div>
              <div>
                 <p className="text-sm font-semibold text-slate-500">Précision GPS</p>
                 <h4 className="text-2xl font-bold text-slate-800">WGS84</h4>
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
              placeholder="Rechercher par ville, adresse ou ID écran..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <RefreshCw size={40} className="text-emerald-500 animate-spin mb-4" />
            <span className="text-slate-500 font-medium tracking-wide">Syncronisation des données de géolocalisation...</span>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <MapPin size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Aucune localisation trouvée</h3>
            <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">Nous n'avons trouvé aucune donnée correspondant à votre recherche ou aucun point n'a encore été créé.</p>
            <button onClick={handleOpenCreate} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md">
              Créer un point de localisation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Écran</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ville & Pays</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Adresse</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Coordonnées GPS</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLocations.map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-sm">
                           {loc.screenId}
                         </div>
                         <span className="text-sm font-semibold text-slate-700">Monitor #{loc.screenId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{loc.city}</span>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Globe size={10} /> {loc.country || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 font-medium truncate max-w-[200px] block" title={loc.address}>
                        {loc.address}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                         <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-amber-700 font-mono w-fit">Lat: {loc.latitude?.toFixed(4)}</code>
                         <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-amber-700 font-mono w-fit">Lng: {loc.longitude?.toFixed(4)}</code>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                          href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Voir sur Maps"
                        >
                          <ExternalLink size={18} />
                        </a>
                        <button 
                          onClick={() => handleOpenEdit(loc)} 
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" 
                          title="Modifier"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(loc.id)} 
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
