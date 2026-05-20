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
  CheckCircle2, 
  ChevronRight, 
  AlertTriangle,
  ShieldAlert,
  Server,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Auth details
  const savedUser = localStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null;
  const userRole = user?.role || 'CLIENT';
  const username = user?.username || 'Utilisateur';

  // API Data States
  const [screens, setScreens] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch all statistics dynamically
  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      // 1. Fetch screens (used by all roles)
      const screensRes = await api.get('/screens');
      setScreens(screensRes.data || []);

      // 2. Fetch tickets (used by all roles)
      const ticketsRes = await api.get('/tickets');
      setTickets(ticketsRes.data || []);

      // 3. Fetch clients (Admin only)
      if (userRole === 'ADMIN') {
        const clientsRes = await api.get('/clients');
        setClients(clientsRes.data || []);
      }
    } catch (err) {
      console.error("Error loading dashboard metrics", err);
      setError("Impossible de charger les données réelles du tableau de bord. Veuillez vérifier que les microservices backend sont démarrés.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userRole]);

  // Derived Statistics based on role
  const totalScreens = screens.length;
  const activeScreens = screens.filter(s => s.status === 'ACTIF').length;
  const offlineScreens = screens.filter(s => s.status === 'EN_PANNE').length;
  const maintenanceScreens = screens.filter(s => s.status === 'EN_MAINTENANCE').length;
  
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status !== 'RESOLU' && t.status !== 'CLOTURE').length;
  const criticalTickets = tickets.filter(t => t.priority === 'URGENT' || t.priority === 'HAUTE').length;
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLU' || t.status === 'CLOTURE').length;

  const urgentAlertsCount = tickets.filter(t => t.priority === 'URGENT' && t.status !== 'RESOLU').length;

  // Custom UI Renderers per role
  const renderDashboardHeader = () => {
    const subtitle = {
      ADMIN: "Console globale de supervision de votre parc d'affichage et de vos clients.",
      CLIENT: "Suivi en temps réel de vos terminaux d'affichage publicitaire et demandes de support.",
      TECHNICIEN: "Flux de travail de maintenance et gestion opérationnelle des pannes d'écrans.",
    }[userRole] || "Tableau de bord de supervision Digitello.";

    return (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Tableau de bord
            {userRole === 'ADMIN' && <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Vue Administrateur</span>}
            {userRole === 'CLIENT' && <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Espace Client</span>}
            {userRole === 'TECHNICIEN' && <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Espace Technicien</span>}
          </h1>
          <p className="text-slate-500 font-medium mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Notifications Toggle */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 cursor-pointer relative"
          >
            🔔 {urgentAlertsCount > 0 && <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">{urgentAlertsCount}</span>}
            Notifications
          </button>
          
          <button 
            onClick={() => fetchDashboardData(true)} 
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>

          {userRole === 'ADMIN' && (
            <button 
              onClick={() => navigate('/screens')} 
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/10 active:scale-95 cursor-pointer"
            >
              <Plus size={18} />
              Nouveau terminal
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderAdminKPIs = () => [
    { label: 'Total Écrans', value: totalScreens, desc: `${activeScreens} opérationnels`, trend: 'up', Icon: Tv, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Écrans en Panne', value: offlineScreens, desc: `${maintenanceScreens} en maintenance`, trend: 'down', Icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Clients Actifs', value: clients.length, desc: 'Entreprises enregistrées', trend: 'up', Icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tickets Ouverts', value: openTickets, desc: `${criticalTickets} critiques`, trend: 'down', Icon: TicketIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const renderClientKPIs = () => [
    { label: 'Mes Terminaux', value: totalScreens, desc: `${activeScreens} en ligne`, trend: 'up', Icon: Tv, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Écrans Actifs', value: activeScreens, desc: `${offlineScreens} hors ligne`, trend: 'up', Icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Mes Tickets', value: totalTickets, desc: `${openTickets} en cours de traitement`, trend: 'down', Icon: TicketIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Demandes Résolues', value: resolvedTickets, desc: 'Tickets clôturés', trend: 'up', Icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const renderTechnicianKPIs = () => [
    { label: 'Tickets Assignés', value: openTickets, desc: 'Interventions requises', trend: 'down', Icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Tickets Critiques', value: criticalTickets, desc: 'Haute priorité', trend: 'down', Icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'En Maintenance', value: maintenanceScreens, desc: 'Écrans à dépanner', trend: 'up', Icon: Server, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Interventions Résolues', value: resolvedTickets, desc: 'Résolus au total', trend: 'up', Icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const getKPIs = () => {
    if (userRole === 'ADMIN') return renderAdminKPIs();
    if (userRole === 'CLIENT') return renderClientKPIs();
    return renderTechnicianKPIs();
  };

  return (
    <Layout>
      {/* Dynamic Header */}
      {renderDashboardHeader()}

      {/* Dynamic Alerts/Notifications area */}
      <AnimatePresence>
        {(showNotifications || urgentAlertsCount > 0) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 text-red-800">
                <ShieldAlert size={22} className="text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Alertes de sécurité / pannes critiques détectées</h4>
                  <p className="text-xs text-red-600 font-medium">Il y a actuellement {urgentAlertsCount} ticket(s) urgent(s) en attente d'intervention immédiate.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/tickets')}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                Gérer les tickets
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center gap-3 shadow-sm font-medium text-sm">
          <AlertCircle size={18} className="text-amber-600" />
          {error}
        </div>
      )}

      {/* Skeleton Loading State */}
      {loading ? (
        <div className="space-y-8 animate-pulse">
          {/* KPI grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 h-32 flex flex-col justify-between">
                <div className="w-1/2 h-4 bg-slate-100 rounded"></div>
                <div className="w-1/3 h-8 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Dynamic grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(n => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 h-96">
                <div className="w-1/3 h-6 bg-slate-200 rounded mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(x => (
                    <div key={x} className="w-full h-10 bg-slate-100 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {getKPIs().map((kpi, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={kpi.label}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex justify-between items-center group relative overflow-hidden"
              >
                <div className="flex flex-col gap-1 z-10">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                  <h3 className="text-3xl font-black text-slate-800 leading-none my-1">{kpi.value}</h3>
                  <span className="text-xs text-slate-400 font-medium">{kpi.desc}</span>
                </div>
                
                <div className={`w-12 h-12 rounded-2xl ${kpi.bg} flex items-center justify-center z-10 transition-transform group-hover:scale-110`}>
                  <kpi.Icon className={kpi.color} size={22} />
                </div>
                
                {/* Decorative subtle background bubble */}
                <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10 ${kpi.bg}`}></div>
              </motion.div>
            ))}
          </div>

          {/* Dynamic Content Grid based on user Role */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Widget 1: Tickets Table (All Roles, but contents can differ) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-800">Tickets récents</h3>
                    <p className="text-xs text-slate-400 font-medium">Liste des dernières demandes et signalements</p>
                  </div>
                  <button 
                    onClick={() => navigate('/tickets')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    Voir tous <ChevronRight size={14} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  {tickets.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-medium text-sm">
                      Aucun ticket actif ou signalé.
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                          <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                          <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Priorité</th>
                          <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.slice(0, 5).map(ticket => {
                          const statusStyles = {
                            OUVERT: { bg: 'bg-blue-50 border-blue-100 text-blue-700', label: 'Ouvert' },
                            EN_COURS: { bg: 'bg-amber-50 border-amber-100 text-amber-700', label: 'En cours' },
                            RESOLU: { bg: 'bg-emerald-50 border-emerald-100 text-emerald-700', label: 'Résolu' },
                            CLOTURE: { bg: 'bg-slate-50 border-slate-100 text-slate-500', label: 'Clôturé' }
                          }[ticket.status] || { bg: 'bg-slate-50 border-slate-100 text-slate-600', label: ticket.status };

                          const priorityStyles = {
                            URGENT: 'text-red-600 font-black',
                            HAUTE: 'text-amber-600 font-bold',
                            MOYENNE: 'text-blue-600 font-medium',
                            BASSE: 'text-slate-400'
                          }[ticket.priority] || 'text-slate-600';

                          return (
                            <tr key={ticket.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                              <td className="p-4 font-bold text-slate-400">#TK-00{ticket.id}</td>
                              <td className="p-4 font-medium text-slate-700 max-w-xs truncate">{ticket.description || 'Sans description'}</td>
                              <td className="p-4"><span className={`text-xs ${priorityStyles}`}>{ticket.priority || 'Normal'}</span></td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusStyles.bg}`}>
                                  {statusStyles.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-slate-50 text-center">
                <span className="text-[11px] text-slate-400 font-medium">Flux dynamique synchronisé en temps réel avec ticket-service</span>
              </div>
            </div>

            {/* Widget 2: Role-dependent Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
              
              {/* ADMIN ROLE: Client List */}
              {userRole === 'ADMIN' && (
                <>
                  <div>
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <div>
                        <h3 className="font-extrabold text-slate-800">Clients majeurs</h3>
                        <p className="text-xs text-slate-400 font-medium">Derniers comptes entreprises créés</p>
                      </div>
                      <button 
                        onClick={() => navigate('/clients')}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                      >
                        Gérer <ChevronRight size={14} />
                      </button>
                    </div>

                    <div className="p-4">
                      {clients.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-sm">
                          Aucun client inscrit.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {clients.slice(0, 5).map(client => (
                            <div key={client.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                  {client.raisonSociale?.slice(0, 2).toUpperCase() || 'CL'}
                                </div>
                                <div>
                                  <h4 className="font-bold text-xs text-slate-700">{client.raisonSociale}</h4>
                                  <p className="text-[10px] text-slate-400">{client.nomContact}</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400">{client.telephone || 'Non spécifié'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-50 text-center">
                    <span className="text-[11px] text-slate-400 font-medium">Flux connecté avec client-service</span>
                  </div>
                </>
              )}

              {/* CLIENT ROLE: Quick Actions & Connected Screens */}
              {userRole === 'CLIENT' && (
                <>
                  <div>
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="font-extrabold text-slate-800">Support & Assistance</h3>
                      <p className="text-xs text-slate-400 font-medium">Actions rapides pour votre compte</p>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-center">
                        <h4 className="font-extrabold text-sm text-emerald-800 mb-1">Un écran rencontre un problème ?</h4>
                        <p className="text-xs text-slate-500 mb-4">Signalez un dysfonctionnement matériel ou logiciel en quelques secondes.</p>
                        <button 
                          onClick={() => navigate('/tickets')}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          Créer un Ticket d'incident
                        </button>
                      </div>

                      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-center">
                        <h4 className="font-extrabold text-sm text-blue-800 mb-1">Vérifier vos écrans actifs</h4>
                        <p className="text-xs text-slate-500 mb-4">Consultez l'état de diffusion en temps réel de vos terminaux.</p>
                        <button 
                          onClick={() => navigate('/screens')}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          Voir mes écrans
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-50 text-center">
                    <span className="text-[11px] text-slate-400 font-medium">Assistance client Digitello SGEPD</span>
                  </div>
                </>
              )}

              {/* TECHNICIAN ROLE: Priority Queue */}
              {userRole === 'TECHNICIEN' && (
                <>
                  <div>
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <div>
                        <h3 className="font-extrabold text-slate-800">File d'attente urgente</h3>
                        <p className="text-xs text-slate-400 font-medium">Écrans en panne critique</p>
                      </div>
                      <span className="bg-red-100 text-red-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                        {screens.filter(s => s.status === 'EN_PANNE').length} pannes
                      </span>
                    </div>

                    <div className="p-4">
                      {screens.filter(s => s.status === 'EN_PANNE').length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-sm">
                          Aucun écran en panne critique ! Félicitations.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {screens.filter(s => s.status === 'EN_PANNE').slice(0, 5).map(screen => (
                            <div key={screen.id} className="flex items-center justify-between p-3 border border-red-100 bg-red-50/20 rounded-xl hover:bg-red-50/45 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                  <AlertTriangle size={18} />
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-xs text-slate-800">{screen.name}</h4>
                                  <p className="text-[10px] text-slate-400">{screen.city} — {screen.brand}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => navigate('/screens')}
                                className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 rounded-lg transition-all active:scale-95 cursor-pointer"
                              >
                                Dépanner
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-50 text-center">
                    <span className="text-[11px] text-slate-400 font-medium">Actions prioritaires de maintenance</span>
                  </div>
                </>
              )}

            </div>

          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;