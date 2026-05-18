import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, User, ShieldCheck, LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Identifiants invalides (admin/admin)');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-3xl flex rounded-2xl overflow-hidden shadow-lg"
      >
        {/* Left panel */}
        <div className="w-56 flex-shrink-0 bg-emerald-600 flex flex-col items-center justify-center gap-4 px-6 py-10">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-white text-xl font-semibold tracking-wide">SGEPD</h1>
          <div className="w-8 h-px bg-white/30" />
          <p className="text-white/65 text-xs text-center leading-relaxed">
            Système de gestion des écrans publicitaires
          </p>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white flex flex-col justify-center px-8 py-10">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Connexion</h2>
          <p className="text-sm text-slate-400 mb-6">Connectez-vous à votre espace</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500">Utilisateur</label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: admin"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500">Mot de passe</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors mt-1"
            >
              <LogIn size={16} />
              Se connecter
            </button>
          </form>

          <p className="text-center text-slate-300 text-xs mt-8">
            © 2026 Digitello. Tous droits réservés.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;