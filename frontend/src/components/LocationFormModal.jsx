import React, { useEffect } from 'react';
import { X, MapPin, Monitor, Globe, Navigation, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LocationFormModal = ({ isOpen, onClose, formData, setFormData, onSubmit, isEditing, screens }) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {isEditing ? 'Modifier la localisation' : 'Nouvelle localisation'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Configurez les coordonnées géographiques de l'écran.</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Screen Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                  <Monitor size={14} className="text-slate-400" /> Écran associé
                </label>
                <select
                  name="screenId"
                  value={formData.screenId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Sélectionnez un écran</option>
                  {screens.map(screen => (
                    <option key={screen.id} value={screen.id}>
                      {screen.name} (ID: {screen.id}) - {screen.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* City & Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ville</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Ex: Paris"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pays</label>
                <input
                  type="text"
                  name="country"
                  placeholder="Ex: France"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Adresse complète</label>
                <textarea
                  name="address"
                  rows="2"
                  placeholder="Ex: 12 Rue de la Paix, 75002"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                ></textarea>
              </div>

              {/* Coordinates */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                   Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  placeholder="48.8566"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                   Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  placeholder="2.3522"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* region & Postal Code */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Région</label>
                <input
                  type="text"
                  name="region"
                  placeholder="Ex: Île-de-France"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Code Postal</label>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="75000"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-[2] px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
              >
                {isEditing ? 'Enregistrer les modifications' : 'Créer la localisation'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LocationFormModal;
