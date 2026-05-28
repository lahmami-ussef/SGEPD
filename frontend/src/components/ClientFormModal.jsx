import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const ClientFormModal = ({ isOpen, onClose, formData, setFormData, onSubmit, isEditing }) => {
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
            {isEditing ? 'Modifier la fiche client' : 'Ajouter un nouveau compte partenaire'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 bg-slate-950/20">
          <form id="client-form" onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* General Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 border-b border-white/5 pb-2">Informations Générales</h3>
            </div>
            
            <div className="flex flex-col gap-2 col-span-1 md:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Raison Sociale (Entreprise) *</label>
              <input 
                required 
                name="raisonSociale" 
                value={formData.raisonSociale || ''} 
                onChange={handleChange} 
                className="h-12 px-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
                placeholder="Ex: AlphaMedia SARL" 
              />
            </div>

            <div className="flex flex-col gap-2 col-span-1 md:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nom du contact principal *</label>
              <input 
                required 
                name="nomContact" 
                value={formData.nomContact || ''} 
                onChange={handleChange} 
                className="h-12 px-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
                placeholder="Ex: Jean Dupont" 
              />
            </div>

            <div className="flex flex-col gap-2 col-span-1 md:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email de contact *</label>
              <input 
                required 
                type="email" 
                name="email" 
                value={formData.email || ''} 
                onChange={handleChange} 
                className="h-12 px-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
                placeholder="Ex: contact@alphamedia.com" 
              />
            </div>

            <div className="flex flex-col gap-2 col-span-1 md:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Téléphone *</label>
              <input 
                required 
                name="telephone" 
                value={formData.telephone || ''} 
                onChange={handleChange} 
                className="h-12 px-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
                placeholder="Ex: +212 600 000 000" 
              />
            </div>

            <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adresse Postale Réelle *</label>
              <input 
                required 
                name="adressePostale" 
                value={formData.adressePostale || ''} 
                onChange={handleChange} 
                className="h-12 px-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
                placeholder="Ex: 123 Rue de la Liberté, Casablanca" 
              />
            </div>

            {/* System Info */}
            <div className="col-span-1 md:col-span-2 mt-2">
              <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 border-b border-white/5 pb-2">Habilitation & Système</h3>
            </div>

            <div className="flex flex-col gap-2 col-span-1 md:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lien Compte Utilisateur (ID) *</label>
              <input 
                type="number" 
                required 
                name="userId" 
                value={formData.userId || ''} 
                onChange={handleChange} 
                className="h-12 px-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none transition-all text-xs font-semibold"
                placeholder="ID (ex: 15)" 
              />
              <p className="text-[9px] text-slate-500 font-semibold mt-1">L'ID du compte utilisateur associé pour accéder au portail client.</p>
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
            form="client-form" 
            className="px-5 h-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            {isEditing ? 'Enregistrer les modifications' : 'Créer la fiche client'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientFormModal;
