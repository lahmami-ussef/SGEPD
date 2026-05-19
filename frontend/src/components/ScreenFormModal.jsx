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
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">
            {isEditing ? 'Modifier l\'écran' : 'Ajouter un nouvel écran'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="screen-form" onSubmit={onSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4">
            
            {/* Infos de base */}
            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Informations Générales</h3>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Nom de l'écran *</label>
              <input required name="name" value={formData.name || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Ex: Ecran Hall Principal" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Statut *</label>
              <select required name="status" value={formData.status || 'ACTIF'} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                <option value="ACTIF">Actif</option>
                <option value="EN_PANNE">En Panne</option>
                <option value="EN_MAINTENANCE">En Maintenance</option>
              </select>
            </div>

            {/* Matériel */}
            <div className="col-span-2 mt-2">
              <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Spécifications Matérielles</h3>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Marque</label>
              <input name="brand" value={formData.brand || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder="Ex: Samsung" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Modèle</label>
              <input name="model" value={formData.model || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder="Ex: QM65R" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Taille</label>
              <input name="size" value={formData.size || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder="Ex: 65 pouces" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Résolution</label>
              <input name="resolution" value={formData.resolution || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder="Ex: 3840x2160" />
            </div>

            {/* Localisation */}
            <div className="col-span-2 mt-2">
              <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Localisation</h3>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Ville</label>
              <input name="city" value={formData.city || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder="Ex: Casablanca" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Adresse</label>
              <input name="address" value={formData.address || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder="Ex: Centre Commercial Anfa" />
            </div>

          </form>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors">
            Annuler
          </button>
          <button type="submit" form="screen-form" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
            {isEditing ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ScreenFormModal;
