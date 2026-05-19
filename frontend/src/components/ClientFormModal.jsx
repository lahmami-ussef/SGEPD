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
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">
            {isEditing ? 'Modifier le client' : 'Ajouter un nouveau client'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="client-form" onSubmit={onSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4">
            
            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-indigo-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Informations Générales</h3>
            </div>
            
            <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-slate-600">Raison Sociale (Entreprise) *</label>
              <input required name="raisonSociale" value={formData.raisonSociale || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Ex: AlphaMedia SARL" />
            </div>

            <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-slate-600">Nom du Contact *</label>
              <input required name="nomContact" value={formData.nomContact || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Ex: Jean Dupont" />
            </div>

            <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-slate-600">Email Contact *</label>
              <input required type="email" name="email" value={formData.email || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Ex: contact@alphamedia.ma" />
            </div>

            <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-slate-600">Téléphone *</label>
              <input required name="telephone" value={formData.telephone || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Ex: +212 600 000 000" />
            </div>

            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-medium text-slate-600">Adresse Postale *</label>
              <input required name="adressePostale" value={formData.adressePostale || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Ex: 123 Rue de la Liberté, Casablanca" />
            </div>

            <div className="flex flex-col gap-1 col-span-2 mt-4">
              <h3 className="text-sm font-semibold text-indigo-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Système</h3>
              <label className="text-xs font-medium text-slate-600">Lien Compte Utilisateur (ID Utilisateur)</label>
              <input type="number" required name="userId" value={formData.userId || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full md:w-1/2" placeholder="ID (ex: 15)" />
              <p className="text-[10px] text-slate-400 mt-1">L'ID du compte utilisateur associé pour accéder au portail.</p>
            </div>

          </form>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors">
            Annuler
          </button>
          <button type="submit" form="client-form" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            {isEditing ? 'Enregistrer' : 'Créer Client'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientFormModal;
