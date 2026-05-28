import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, User, LogIn, ArrowRight, ShieldAlert } from 'lucide-react';
import api from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
      const res = await api.post('/api/auth/login', { username, password });
      const { token, role } = res.data;
      localStorage.setItem('token', token);
      login({ username, role }, token);
      navigate('/dashboard');
    } catch (err) {
      if (err?.response?.status === 401 && err?.response?.data?.message === 'Account pending admin approval') {
        setError("Votre compte est en attente de validation par un administrateur.");
      } else {
        setError('Identifiants invalides');
      }
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
        {/* Logo and Headings with clean Vercel style spacing */}
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
            Bienvenue sur Digitello
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-sm text-slate-400 mt-1"
          >
            Gérez vos écrans publicitaires en temps réel
          </motion.p>
        </div>

        {/* Glassmorphic Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel p-8 rounded-2xl shadow-2xl shadow-black/40"
        >
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
                  placeholder="admin, client, ou technicien"
                  required
                  className="w-full h-12 pl-12 pr-4 bg-slate-900/50 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-sm font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Mot de passe</label>
                <span className="text-xs text-slate-500 hover:text-emerald-400 cursor-pointer transition-colors">Oublié ?</span>
              </div>
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
                <>
                  <LogIn size={18} className="stroke-[2.5px]" />
                  <span>Se connecter</span>
                </>
              )}
            </motion.button>

            {/* OR / Register Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-brand-bg px-3 text-slate-500 font-semibold tracking-wider">OU</span></div>
            </div>

            {/* Switch to Register */}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="w-full h-12 bg-transparent border border-white/5 hover:border-white/10 text-slate-300 hover:text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Créer un compte partenaire</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs font-medium mt-8">
          © 2026 Digitello SGEPD • Tous droits réservés
        </p>
      </div>
    </div>
  );
};

export default Login;