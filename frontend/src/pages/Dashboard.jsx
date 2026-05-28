import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api';
import {
  Tv,
  AlertCircle,
  Building2,
  Activity,
  RefreshCw,
  Plus,
  Ticket as TicketIcon,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ShieldAlert,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();

  // Auth details
  const savedUser = localStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null;
  const userRole = user?.role || 'CLIENT';

  // API Data States
  const [data, setData] = useState(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Fetch consolidated dashboard data from dashboard-service
  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const res = await api.get('/api/dashboard');
      setData(res.data);
    } catch (err) {
      console.error("Error loading dashboard metrics", err);
      setError("Impossible de charger les données consolidées du tableau de bord. Veuillez vérifier que le service dashboard-service (Port 8086) est démarré.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userRole]);

  // Safe data extraction
  const kpis = data?.kpis || [];
  const activity = data?.activity || [];
  const screenStatuses = data?.screenStatuses || [];
  const recentTickets = data?.recentTickets || [];
  const topClients = data?.topClients || [];

  // Filter urgent tickets count
  const urgentTicketsCount = recentTickets.filter(t => t.status === 'Urgent').length;

  return (
    <Layout>
      {/* Dynamic Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
            Tableau de bord de supervision
            {userRole === 'ADMIN' && <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider">Administrateur</span>}
            {userRole === 'CLIENT' && <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20 font-bold uppercase tracking-wider">Espace Client</span>}
            {userRole === 'TECHNICIEN' && <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/20 font-bold uppercase tracking-wider">Technicien</span>}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {userRole === 'ADMIN' && "Console globale de supervision de votre parc d'affichage et de vos clients."}
            {userRole === 'CLIENT' && "Suivi en temps réel de vos terminaux d'affichage publicitaire et demandes de support."}
            {userRole === 'TECHNICIEN' && "Flux de travail de maintenance et gestion opérationnelle des pannes d'écrans."}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 h-10 px-4 bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl text-slate-300 hover:text-white font-semibold transition-all cursor-pointer text-xs"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>

          {userRole === 'ADMIN' && (
            <button
              onClick={() => navigate('/screens')}
              className="flex items-center justify-center gap-2 h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer text-xs"
            >
              <Plus size={16} />
              <span>Nouveau terminal</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Incidents Warning */}
      <AnimatePresence>
        {urgentTicketsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8"
          >
            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3 text-rose-300">
                <ShieldAlert size={20} className="text-rose-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-white">Anomalies critiques actives</h4>
                  <p className="text-[11px] text-rose-300/80 mt-0.5">Il y a actuellement {urgentTicketsCount} incident(s) urgent(s) nécessitant une intervention immédiate.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/tickets')}
                className="h-8 px-3 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Gérer les incidents
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-8 p-4 bg-amber-500/5 border border-amber-500/10 text-amber-300 rounded-2xl flex items-center gap-3 shadow-md text-xs font-medium">
          <AlertCircle size={16} className="text-amber-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Skeleton Loading State */}
      {loading ? (
        <div className="space-y-8 animate-pulse">
          {/* KPI grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 h-28 flex flex-col justify-between" />
            ))}
          </div>

          {/* Table & sidebar skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-2xl border border-white/5 h-[340px]" />
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 h-[340px]" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, idx) => {
              const Icon = {
                'Écrans actifs': Tv,
                'Tickets ouverts': TicketIcon,
                'Clients actifs': Building2,
                'Taux de dispo.': Activity
              }[kpi.label] || Activity;

              const colorClass = {
                'Écrans actifs': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                'Tickets ouverts': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                'Clients actifs': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                'Taux de dispo.': 'text-teal-400 bg-teal-500/10 border-teal-500/20'
              }[kpi.label] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  key={kpi.label}
                  className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 shadow-md flex justify-between items-center group relative overflow-hidden"
                >
                  <div className="flex flex-col z-10 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</span>
                    <h3 className="text-2xl font-bold text-white tracking-tight leading-none">{kpi.value}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold pt-1">
                      {kpi.trend === 'up' ? (
                        <TrendingUp size={12} className="text-emerald-400" />
                      ) : (
                        <TrendingDown size={12} className="text-rose-400" />
                      )}
                      <span className={kpi.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}>{kpi.change}</span>
                      <span className="text-slate-500">vs dernier mois</span>
                    </div>
                  </div>

                  <div className={`w-10 h-10 rounded-xl border ${colorClass} flex items-center justify-center z-10 transition-transform group-hover:scale-105`}>
                    <Icon size={18} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Layout Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUMN 1 & 2 (Main Graphs and Tables) */}
            <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
              
              {/* Activity Weekly Chart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="bg-slate-900/60 border border-white/5 rounded-2xl shadow-lg p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">Activité opérationnelle</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Fréquence journalière des rapports de dysfonctionnement résolus</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-850 border border-white/5 rounded-full px-2.5 py-1 flex items-center gap-1.5 uppercase">
                    <Activity size={10} className="text-emerald-400" /> Charge système
                  </span>
                </div>

                <div className="h-40 flex items-end justify-between px-4 pb-2 border-b border-white/5 gap-3">
                  {activity.map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-white/10 text-white text-[9px] font-bold px-2 py-1 rounded shadow-xl pointer-events-none transform -translate-y-1 z-20">
                        {bar.height}% Intensité
                      </div>

                      {/* Animated Column Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${bar.height}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.05, ease: 'easeOut' }}
                        className={`w-full rounded-t-md transition-all ${
                          bar.weekend
                            ? 'bg-slate-800 group-hover:bg-slate-700'
                            : 'bg-gradient-to-t from-emerald-600/85 to-emerald-400/90 group-hover:shadow-lg group-hover:shadow-emerald-500/10'
                        }`}
                        style={{ minHeight: bar.height > 0 ? '4px' : '0px' }}
                      />

                      {/* Day Label */}
                      <span className="text-[10px] font-bold text-slate-500 mt-2 block">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Incident Tickets Grid */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-slate-900/60 border border-white/5 rounded-2xl shadow-lg overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="p-5 border-b border-white/5 bg-slate-950/20 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-white">Tickets d'incidents récents</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Flux d'incidents techniques enregistrés en temps réel</p>
                    </div>
                    <button
                      onClick={() => navigate('/tickets')}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Consulter tout</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    {recentTickets.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 font-medium text-xs">
                        Aucun ticket actif ou signalé.
                      </div>
                    ) : (
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/5 bg-slate-950/40">
                            <th className="px-6 py-3.5 font-bold text-slate-400 uppercase tracking-widest">ID</th>
                            <th className="px-6 py-3.5 font-bold text-slate-400 uppercase tracking-widest">Description</th>
                            <th className="px-6 py-3.5 font-bold text-slate-400 uppercase tracking-widest">Client</th>
                            <th className="px-6 py-3.5 font-bold text-slate-400 uppercase tracking-widest">Priorité</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentTickets.map(ticket => (
                            <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                              <td className="px-6 py-4 font-bold text-slate-400">#{ticket.id}</td>
                              <td className="px-6 py-4 font-medium text-slate-200 max-w-xs truncate">{ticket.desc || 'Sans description'}</td>
                              <td className="px-6 py-4 text-slate-400 font-medium">{ticket.client}</td>
                              <td className="px-6 py-4">
                                <span
                                  className="px-2.5 py-0.5 rounded-full border text-[9px] font-bold"
                                  style={{ backgroundColor: `${ticket.color}10`, color: ticket.color, borderColor: `${ticket.color}30` }}
                                >
                                  {ticket.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t border-white/5 text-center bg-slate-950/20">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Données synchronisées avec dashboard-service</span>
                </div>
              </motion.div>

            </div>

            {/* COLUMN 3 (Sidebar widgets) */}
            <div className="space-y-6">
              
              {/* Screen Health Progress Status */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="bg-slate-900/60 border border-white/5 rounded-2xl shadow-lg p-6"
              >
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-white">Disponibilité du parc</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Taux de fonctionnement actuel des terminaux</p>
                </div>

                <div className="space-y-5">
                  {screenStatuses.map((status, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                          {status.label}
                        </span>
                        <span className="text-slate-400 font-bold">
                          {status.count} ({status.pct}%)
                        </span>
                      </div>
                      
                      {/* Premium progress bar */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${status.pct}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Role-based Dynamic Widget */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-slate-900/60 border border-white/5 rounded-2xl shadow-lg overflow-hidden flex flex-col justify-between"
              >
                {/* ADMIN: Top Clients */}
                {userRole === 'ADMIN' && (
                  <>
                    <div>
                      <div className="p-5 border-b border-white/5 bg-slate-950/20 flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-white">Clients d'affichage</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">Comptes avec le parc le plus volumineux</p>
                        </div>
                        <button
                          onClick={() => navigate('/clients')}
                          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Gérer</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="p-4 space-y-3">
                        {topClients.length === 0 ? (
                          <div className="p-12 text-center text-slate-500 text-xs">
                            Aucun client actif.
                          </div>
                        ) : (
                          topClients.map((client, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border border-white/5 bg-slate-950/40 rounded-xl hover:bg-slate-900 transition-all cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                                  {client.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-bold text-xs text-white">{client.name}</h4>
                                  <p className="text-[9px] text-slate-500 mt-0.5">{client.screens} terminaux actifs</p>
                                </div>
                              </div>
                              <span
                                className="text-[9px] font-bold px-2 py-0.5 rounded border"
                                style={{ backgroundColor: `${client.color}10`, color: client.color, borderColor: `${client.color}20` }}
                              >
                                {client.status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="p-4 border-t border-white/5 text-center bg-slate-950/20">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Synchronisé avec client-service</span>
                    </div>
                  </>
                )}

                {/* CLIENT: Quick actions */}
                {userRole === 'CLIENT' && (
                  <>
                    <div>
                      <div className="p-5 border-b border-white/5 bg-slate-950/20">
                        <h3 className="text-sm font-bold text-white">Actions rapides</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Assistance technique et équipement</p>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl text-center space-y-3">
                          <p className="text-xs text-slate-300">Un de vos terminaux publicitaires est en panne ou affiche une erreur ?</p>
                          <button
                            onClick={() => navigate('/tickets')}
                            className="w-full h-9 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Signaler une panne
                          </button>
                        </div>

                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center space-y-3">
                          <p className="text-xs text-slate-300">Consultez l'état détaillé de diffusion de vos écrans en direct.</p>
                          <button
                            onClick={() => navigate('/screens')}
                            className="w-full h-9 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Inspecter mon parc
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-white/5 text-center bg-slate-950/20">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Digitello Support Client</span>
                    </div>
                  </>
                )}

                {/* TECHNICIAN: Task queue */}
                {userRole === 'TECHNICIEN' && (
                  <>
                    <div>
                      <div className="p-5 border-b border-white/5 bg-slate-950/20 flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-white">Maintenance terrain</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">Incidents affectés en attente de réparation</p>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {recentTickets.length === 0 ? (
                          <div className="p-12 text-center text-slate-500 text-xs">
                            Aucun incident en cours.
                          </div>
                        ) : (
                          recentTickets.map((ticket, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border border-rose-500/10 bg-rose-500/5 rounded-xl hover:bg-rose-500/10 transition-all cursor-pointer">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                                  <Wrench size={14} />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-xs text-white truncate">{ticket.desc}</h4>
                                  <p className="text-[9px] text-slate-500 mt-0.5">{ticket.client} — #{ticket.id}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => navigate('/tickets')}
                                className="h-7 px-2.5 bg-slate-900 border border-white/5 hover:border-white/10 text-[10px] font-bold text-slate-300 rounded-lg shrink-0 cursor-pointer"
                              >
                                Réparer
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="p-4 border-t border-white/5 text-center bg-slate-950/20">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">File d'attente technique</span>
                    </div>
                  </>
                )}
              </motion.div>

            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;