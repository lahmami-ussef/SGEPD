import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings as SettingsIcon, 
  Shield, 
  Key, 
  Moon, 
  Bell, 
  Globe, 
  Save, 
  Copy, 
  Trash2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Tab definitions
  const tabs = [
    { id: 'profile', label: 'Mon Profil', icon: User },
    { id: 'preferences', label: 'Préférences', icon: SettingsIcon },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'api', label: 'Accès API', icon: Key }
  ];

  // Profile State
  const [fullName, setFullName] = useState(user?.username || 'Utilisateur');
  const [email, setEmail] = useState(user?.email || 'contact@digitello.com');

  // Preferences State (Persisted)
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('pref_darkMode') ?? 'true'));
  const [emailNotifs, setEmailNotifs] = useState(() => JSON.parse(localStorage.getItem('pref_emailNotifs') ?? 'true'));
  const [language, setLanguage] = useState(() => localStorage.getItem('pref_language') || 'fr');

  // Security State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Save Preferences to LocalStorage dynamically
  useEffect(() => {
    localStorage.setItem('pref_darkMode', JSON.stringify(darkMode));
    localStorage.setItem('pref_emailNotifs', JSON.stringify(emailNotifs));
    localStorage.setItem('pref_language', language);
  }, [darkMode, emailNotifs, language]);

  // API Tokens (Mock with dynamic operations)
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('api_tokens');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Production Dashboard', token: 'sk_live_51Mxyz...9pA', created: '2025-10-15', lastUsed: 'Aujourd\'hui' }
    ];
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Jeton copié dans le presse-papiers !", "success");
  };

  const handleSaveProfile = () => {
    showToast("Profil mis à jour avec succès !", "success");
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword) {
      showToast("Veuillez remplir tous les champs de mot de passe.", "error");
      return;
    }
    showToast("Mot de passe mis à jour avec succès !", "success");
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleGenerateToken = () => {
    const newToken = {
      id: Date.now(),
      name: `Jeton ${tokens.length + 1}`,
      token: `sk_live_${Math.random().toString(36).substr(2, 10)}`,
      created: new Date().toLocaleDateString('fr-FR'),
      lastUsed: 'Jamais'
    };
    const newTokens = [...tokens, newToken];
    setTokens(newTokens);
    localStorage.setItem('api_tokens', JSON.stringify(newTokens));
    showToast("Nouveau jeton API généré !", "success");
  };

  const handleRevokeToken = (id) => {
    const newTokens = tokens.filter(t => t.id !== id);
    setTokens(newTokens);
    localStorage.setItem('api_tokens', JSON.stringify(newTokens));
    showToast("Jeton révoqué.", "success");
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight text-white">Paramètres système</h1>
          <p className="text-xs text-slate-400 mt-1">Gérez vos informations personnelles, vos préférences et la sécurité de votre compte.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <nav className="flex flex-col gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all relative overflow-hidden group cursor-pointer ${
                      isActive 
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                        : 'text-slate-400 bg-slate-900/50 hover:bg-slate-900 border border-white/5 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'} />
                    <span className="relative z-10">{tab.label}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="active-tab-bg"
                        className="absolute inset-0 bg-emerald-500/5"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/60 border border-white/5 rounded-2xl shadow-xl overflow-hidden"
              >
                
                {/* 1. PROFILE SETTINGS */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="p-6 border-b border-white/5 bg-slate-950/30">
                      <h2 className="text-sm font-bold text-white">Informations du Profil</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">Mettez à jour vos informations publiques et privées.</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="relative group">
                          <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 text-2xl font-bold shadow-lg shadow-emerald-500/20">
                            {(user?.username || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="absolute inset-0 bg-slate-950/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Modifier</span>
                          </div>
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2 uppercase tracking-widest">
                            {user?.role || 'CLIENT'}
                          </div>
                          <p className="text-[11px] text-slate-400">JPG, GIF ou PNG. Max 2MB.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Nom complet</label>
                          <input 
                            type="text" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full h-10 px-4 bg-slate-950 border border-white/10 text-white rounded-xl text-xs font-medium focus:border-emerald-500/50 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Adresse Email</label>
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-10 px-4 bg-slate-950 border border-white/10 text-white rounded-xl text-xs font-medium focus:border-emerald-500/50 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-white/5 bg-slate-950/20 flex justify-end">
                      <button 
                        onClick={handleSaveProfile}
                        className="h-9 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <Save size={14} /> Sauvegarder
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. PREFERENCES */}
                {activeTab === 'preferences' && (
                  <div>
                    <div className="p-6 border-b border-white/5 bg-slate-950/30">
                      <h2 className="text-sm font-bold text-white">Préférences d'affichage</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">Personnalisez votre expérience sur la plateforme.</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {/* Dark Mode Toggle */}
                      <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                            <Moon size={18} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">Thème Sombre</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Utiliser une palette sombre pour réduire la fatigue visuelle.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setDarkMode(!darkMode)}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${darkMode ? 'bg-emerald-500' : 'bg-slate-700'}`}
                        >
                          <motion.div 
                            layout
                            className="w-4 h-4 rounded-full bg-white absolute top-1"
                            animate={{ left: darkMode ? 'calc(100% - 1.25rem)' : '0.25rem' }}
                          />
                        </button>
                      </div>

                      {/* Notifications Toggle */}
                      <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                            <Bell size={18} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">Notifications par Email</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Recevoir des alertes critiques par courrier électronique.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setEmailNotifs(!emailNotifs)}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${emailNotifs ? 'bg-emerald-500' : 'bg-slate-700'}`}
                        >
                          <motion.div 
                            layout
                            className="w-4 h-4 rounded-full bg-white absolute top-1"
                            animate={{ left: emailNotifs ? 'calc(100% - 1.25rem)' : '0.25rem' }}
                          />
                        </button>
                      </div>

                      {/* Language Selection */}
                      <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                            <Globe size={18} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">Langue de l'interface</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Sélectionnez la langue régionale d'affichage.</p>
                          </div>
                        </div>
                        <select 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="h-8 px-3 bg-slate-900 border border-white/10 text-white rounded-lg text-xs font-bold outline-none cursor-pointer"
                        >
                          <option value="fr">Français (FR)</option>
                          <option value="en">English (US)</option>
                          <option value="es">Español (ES)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SECURITY */}
                {activeTab === 'security' && (
                  <div>
                    <div className="p-6 border-b border-white/5 bg-slate-950/30">
                      <h2 className="text-sm font-bold text-white">Paramètres de sécurité</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">Gérez vos mots de passe et sessions actives.</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-2">Changer le mot de passe</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2 relative">
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Mot de passe actuel</label>
                            <div className="relative">
                              <input 
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full h-10 pl-4 pr-10 bg-slate-950 border border-white/10 text-white rounded-xl text-xs font-medium focus:border-emerald-500/50 outline-none transition-all"
                              />
                              <button 
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                              >
                                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Nouveau mot de passe</label>
                            <div className="relative">
                              <input 
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full h-10 pl-4 pr-10 bg-slate-950 border border-white/10 text-white rounded-xl text-xs font-medium focus:border-emerald-500/50 outline-none transition-all"
                              />
                              <button 
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                              >
                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button 
                            onClick={handleUpdatePassword}
                            className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all border border-white/5 cursor-pointer"
                          >
                            Mettre à jour
                          </button>
                        </div>
                      </div>

                      <div className="mt-8 space-y-4">
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-2">Authentification à deux facteurs (2FA)</h3>
                        <div className="flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                          <div>
                            <h4 className="text-xs font-bold text-amber-400">2FA n'est pas activée</h4>
                            <p className="text-[10px] text-amber-500/80 mt-1 max-w-md">Nous vous recommandons fortement d'activer l'authentification à deux facteurs pour sécuriser votre compte administrateur.</p>
                          </div>
                          <button className="h-9 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md shadow-amber-500/10 cursor-pointer">
                            Configurer 2FA
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. API ACCESS */}
                {activeTab === 'api' && (
                  <div>
                    <div className="p-6 border-b border-white/5 bg-slate-950/30 flex justify-between items-center">
                      <div>
                        <h2 className="text-sm font-bold text-white">Accès API</h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">Gérez vos jetons d'authentification machine-à-machine.</p>
                      </div>
                      <button 
                        onClick={handleGenerateToken}
                        className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <RefreshCw size={14} /> Générer un jeton
                      </button>
                    </div>
                    
                    <div className="p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              <th className="pb-3 pr-4">Nom du jeton</th>
                              <th className="pb-3 px-4">Clé secrète</th>
                              <th className="pb-3 px-4">Créé le</th>
                              <th className="pb-3 px-4">Dernière utilisation</th>
                              <th className="pb-3 pl-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tokens.map((token) => (
                              <tr key={token.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                                <td className="py-4 pr-4">
                                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                                    <Key size={14} className="text-emerald-400" />
                                    {token.name}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    <code className="text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-white/5 font-mono">
                                      {token.token}
                                    </code>
                                    <button 
                                      onClick={() => handleCopy(token.token)}
                                      className="text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                                      title="Copier"
                                    >
                                      <Copy size={14} />
                                    </button>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-[11px] text-slate-400">{token.created}</td>
                                <td className="py-4 px-4 text-[11px] text-slate-400">{token.lastUsed}</td>
                                <td className="py-4 pl-4 text-right">
                                  <button 
                                    onClick={() => handleRevokeToken(token.id)}
                                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer inline-block" 
                                    title="Révoquer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
