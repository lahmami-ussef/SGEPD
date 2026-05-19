import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const TicketFormModal = ({ isOpen, onClose, formData, setFormData, onSubmit, screens }) => {
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
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-500" />
            <h2 className="text-lg font-bold text-slate-800">
              Déclarer un Incident
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="ticket-form" onSubmit={onSubmit} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Écran *</label>
              <select required name="screenId" value={formData.screenId || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                <option value="">Sélectionnez un écran...</option>
                {screens.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.city}) - ID: {s.id}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Type de Problème *</label>
                <select required name="problemType" value={formData.problemType || ''} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                  <option value="">Sélectionnez...</option>
                  <option value="Panne d'alimentation">Panne d'alimentation</option>
                  <option value="Problème réseau / connexion">Problème réseau / connexion</option>
                  <option value="Problème d'affichage (Pixel, Ligne)">Problème d'affichage (Pixel, Ligne)</option>
                  <option value="Défaut Player / Logiciel">Défaut Player / Logiciel</option>
                  <option value="Bris de glace / Dégât matériel">Bris de glace / Dégât matériel</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Priorité *</label>
                <select required name="priority" value={formData.priority || 'MEDIUM'} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                  <option value="LOW">Basse (Non urgent)</option>
                  <option value="MEDIUM">Moyenne (Perturbant)</option>
                  <option value="HIGH">Haute (Critique / Ecran noir)</option>
                  <option value="CRITICAL">Critique (Danger immédiat)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Description détaillée *</label>
              <textarea required name="description" value={formData.description || ''} onChange={handleChange} rows={4} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-y" placeholder="Décrivez le problème observé sur l'écran..." />
            </div>

            <div className="flex flex-col gap-1 hidden">
              <label className="text-xs font-medium text-slate-600">ID Créateur (Automatique)</label>
              <input type="number" name="createdByUserId" value={formData.createdByUserId || 1} onChange={handleChange} />
            </div>

          </form>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors">
            Annuler
          </button>
          <button type="submit" form="ticket-form" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors shadow-sm">
            Créer le ticket
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TicketFormModal;
