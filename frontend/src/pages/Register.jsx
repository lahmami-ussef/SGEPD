import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Lock, Mail, Tag } from 'lucide-react';
import api from '../api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { username, password, email, role });
      setMessage("Inscription réussie. Votre compte sera activé après validation administrateur.");
      setError('');
    } catch (err) {
      setError("Erreur lors de l'inscription.");
      setMessage('');
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
        <div className="w-56 flex-shrink-0 bg-emerald-600 flex flex-col items-center justify-center gap-4 px-6 py-10">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-white text-xl font-semibold tracking-wide">SGEPD</h1>
        </div>

        <div className="flex-1 bg-white flex flex-col justify-center px-8 py-10">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Inscription</h2>

          {message && <p className="text-emerald-500 text-sm mb-4">{message}</p>}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500">Utilisateur</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:border-emerald-500 focus:ring-2 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:border-emerald-500 focus:ring-2 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:border-emerald-500 focus:ring-2 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500">Rôle</label>
              <div className="relative">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:border-emerald-500 focus:ring-2 outline-none transition-all"
                >
                    <option value="CLIENT">Client</option>
                    <option value="TECHNICIEN">Technicien</option>
                </select>
              </div>
            </div>

            <button type="submit" className="flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors mt-2">
              S'inscrire
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
             Déjà un compte ? <Link to="/login" className="text-emerald-600">Se connecter</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
