import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Tag, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/register', { username, password, email, role });
      setMessage("Inscription réussie. Votre compte sera activé après validation par un administrateur.");
      setError('');
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription. L'identifiant est peut-être déjà pris.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#090d16] relative overflow-hidden select-none">
      {/* Decorative premium ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-slate-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Headings */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xl mb-4 shadow-lg shadow-emerald-500/10"
          >
            D
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-2xl font-bold tracking-tight text-white"
          >
            Créer un compte SGEPD
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-sm text-slate-400 mt-1"
          >
            Rejoignez notre réseau d'écrans publicitaires
          </motion.p>
        </div>

        {/* Glassmorphic Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel p-8 rounded-2xl shadow-2xl shadow-black/40"
        >
          {message ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center p-4 space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Demande enregistrée !</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {message}
                </p>
              </div>
              <p className="text-[10px] text-slate-500 animate-pulse">
                Redirection automatique vers la connexion...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Identifiant</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nom d'utilisateur souhaité"
                    required
                    className="w-full h-12 pl-12 pr-4 bg-slate-900/50 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Adresse e-mail</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@entreprise.com"
                    required
                    className="w-full h-12 pl-12 pr-4 bg-slate-900/50 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Mot de passe</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 pl-12 pr-4 bg-slate-900/50 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Type de compte</label>
                <div className="relative">
                  <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-slate-900/50 border border-white/5 rounded-xl text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="CLIENT" className="bg-[#0f172a] text-white">Client / Partenaire</option>
                    <option value="TECHNICIEN" className="bg-[#0f172a] text-white">Technicien de maintenance</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-400 w-0 h-0" />
                </div>
              </div>

              {/* Error Message Section */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-start gap-3 p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl"
                >
                  <ShieldAlert size={18} className="text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-rose-300 leading-normal">{error}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 1 }}
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-400/15 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <span>Demander mon accès</span>
                )}
              </motion.button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full h-12 bg-transparent border border-white/5 hover:border-white/10 text-slate-300 hover:text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Retour à la connexion</span>
              </button>
            </form>
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs font-medium mt-8">
          © 2026 Digitello SGEPD • Tous droits réservés
        </p>
      </div>
    </div>
  );
};

export default Register;
