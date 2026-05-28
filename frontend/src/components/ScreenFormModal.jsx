import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const ScreenFormModal = ({ isOpen, onClose, formData, setFormData, onSubmit, isEditing }) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#0f172a] rounded-2xl border border-white/5 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-slate-950/40 px-6 py-5 border-b border-white/5">
          <h2 className="text-sm font-bold text-white">
            {isEditing ? 'Modifier l\'écran d\'affichage' : 'Enregistrer un nouveau terminal'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 bg-slate-950/20">
          <form id="screen-form" onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* General Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 border-b border-white/5 pb-2">Informations Générales</h3>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nom de l'écran *</label>
              <input 
                required 
                name="name" 
                value={formData.name || ''} 
                onChange={handleChange} 
                className="h-12 px-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
                placeholder="Ex: Écran Hall Principal" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statut de fonctionnement *</label>
              <select 
                required 
                name="status" 
                value={formData.status || 'ACTIF'} 
                onChange={handleChange} 
                className="h-12 px-4 bg-slate-900 border border-white/5 text-slate-300 rounded-xl focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold cursor-pointer"
              >
                <option value="ACTIF">Opérationnel</option>
                <option value="EN_PANNE">En Panne</option>
                <option value="EN_MAINTENANCE">En Maintenance</option>
              </select>
            </div>

            {/* Specs */}
            <div className="col-span-1 md:col-span-2 mt-2">
              <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 border-b border-white/5 pb-2">Spécifications Matérielles</h3>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Marque</label>
              <input 
                name="brand" 
                value={formData.brand || ''} 
                onChange={handleChange} 
                className="h-12 px-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
                placeholder="Ex: Samsung" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modèle</label>
              <input 
                name="model" 
                value={formData.model || ''} 
                onChange={handleChange} 
                className="h-12 px-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
                placeholder="Ex: QM65R" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taille physique</label>
              <input 
                name="size" 
                value={formData.size || ''} 
                onChange={handleChange} 
                className="h-12 px-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
                placeholder="Ex: 65 pouces" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Résolution native</label>
              <input 
                name="resolution" 
                value={formData.resolution || ''} 
                onChange={handleChange} 
                className="h-12 px-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
                placeholder="Ex: 3840x2160" 
              />
            </div>

            {/* Location */}
            <div className="col-span-1 md:col-span-2 mt-2">
              <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 border-b border-white/5 pb-2">Localisation d'installation</h3>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ville</label>
              <input 
                name="city" 
                value={formData.city || ''} 
                onChange={handleChange} 
                className="h-12 px-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
                placeholder="Ex: Casablanca" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adresse précise</label>
              <input 
                name="address" 
                value={formData.address || ''} 
                onChange={handleChange} 
                className="h-12 px-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
                placeholder="Ex: Centre Commercial Anfa" 
              />
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/20 border-t border-white/5 flex justify-end gap-3 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 h-10 border border-white/5 hover:border-white/10 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            form="screen-form" 
            className="px-5 h-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            {isEditing ? 'Sauvegarder les modifications' : 'Enregistrer le terminal'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ScreenFormModal;
