import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TicketFormModal = ({ isOpen, onClose, formData, setFormData, onSubmit, screens }) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 border border-white/10 flex flex-col overflow-hidden max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center bg-slate-950/50 px-8 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <AlertCircle size={20} className="text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Déclarer un Incident</h2>
                  <p className="text-xs font-semibold text-slate-500">Signalez une panne sur un terminal</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-8 overflow-y-auto flex-1">
              <form id="ticket-form" onSubmit={onSubmit} className="flex flex-col gap-6">
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Écran concerné</label>
                  <select 
                    required 
                    name="screenId" 
                    value={formData.screenId || ''} 
                    onChange={handleChange} 
                    className="w-full h-12 px-4 bg-slate-950 border border-white/10 text-white rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm font-semibold appearance-none"
                  >
                    <option value="" className="text-slate-500">Sélectionnez un écran...</option>
                    {screens.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                        {s.name} ({s.city}) - Terminal #{s.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type de Problème</label>
                    <select 
                      required 
                      name="problemType" 
                      value={formData.problemType || ''} 
                      onChange={handleChange} 
                      className="w-full h-12 px-4 bg-slate-950 border border-white/10 text-white rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm font-semibold appearance-none"
                    >
                      <option value="" className="text-slate-500">Sélectionnez...</option>
                      <option value="Panne d'alimentation" className="bg-slate-900 text-white">Panne d'alimentation</option>
                      <option value="Problème réseau / connexion" className="bg-slate-900 text-white">Problème réseau / connexion</option>
                      <option value="Problème d'affichage (Pixel, Ligne)" className="bg-slate-900 text-white">Problème d'affichage (Pixel, Ligne)</option>
                      <option value="Défaut Player / Logiciel" className="bg-slate-900 text-white">Défaut Player / Logiciel</option>
                      <option value="Bris de glace / Dégât matériel" className="bg-slate-900 text-white">Bris de glace / Dégât matériel</option>
                      <option value="Autre" className="bg-slate-900 text-white">Autre</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priorité</label>
                    <select 
                      required 
                      name="priority" 
                      value={formData.priority || 'MEDIUM'} 
                      onChange={handleChange} 
                      className="w-full h-12 px-4 bg-slate-950 border border-white/10 text-white rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm font-semibold appearance-none"
                    >
                      <option value="LOW" className="bg-slate-900 text-white">Basse (Non urgent)</option>
                      <option value="MEDIUM" className="bg-slate-900 text-white">Moyenne (Perturbant)</option>
                      <option value="HIGH" className="bg-slate-900 text-white">Haute (Critique / Ecran noir)</option>
                      <option value="CRITICAL" className="bg-slate-900 text-white">Critique (Danger immédiat)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description détaillée</label>
                  <textarea 
                    required 
                    name="description" 
                    value={formData.description || ''} 
                    onChange={handleChange} 
                    rows={4} 
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm font-semibold placeholder:text-slate-600 resize-y" 
                    placeholder="Décrivez précisément le problème observé..." 
                  />
                </div>

                <div className="hidden">
                  <input type="number" name="createdByUserId" value={formData.createdByUserId || 1} onChange={handleChange} />
                </div>

              </form>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-5 bg-slate-950/50 border-t border-white/5 flex justify-end gap-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="h-12 px-6 flex items-center justify-center bg-slate-800 text-slate-300 border border-white/5 rounded-xl text-sm font-bold hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                form="ticket-form" 
                className="h-12 px-6 flex items-center justify-center bg-emerald-500 text-slate-950 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                Créer le ticket
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TicketFormModal;
