import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Tv, AlertCircle, Building2, Activity, RefreshCw } from 'lucide-react';

const KPI_DATA = [
  { label: 'Écrans actifs', value: '142', change: '+8 ce mois', trend: 'up', Icon: Tv, iconBg: '#E1F5EE', iconColor: '#0F6E56' },
  { label: 'Tickets ouverts', value: '23', change: '+5 non résolus', trend: 'down', Icon: AlertCircle, iconBg: '#FAEEDA', iconColor: '#854F0B' },
  { label: 'Clients actifs', value: '38', change: '+3 ce mois', trend: 'up', Icon: Building2, iconBg: '#E6F1FB', iconColor: '#185FA5' },
  { label: 'Taux de dispo.', value: '98.4%', change: '+0.3% vs mois dernier', trend: 'up', Icon: Activity, iconBg: '#E1F5EE', iconColor: '#0F6E56' },
];

const BARS = [
  { day: 'L', height: 55 },
  { day: 'M', height: 70 },
  { day: 'M', height: 45 },
  { day: 'J', height: 80 },
  { day: 'V', height: 65 },
  { day: 'S', height: 30, weekend: true },
  { day: 'D', height: 20, weekend: true },
];

const SCREEN_STATUS = [
  { label: 'En ligne', count: 142, pct: 82, color: '#1D9E75', badgeBg: '#E1F5EE', badgeText: '#0F6E56' },
  { label: 'En attente', count: 18, pct: 10, color: '#BA7517', badgeBg: '#FAEEDA', badgeText: '#854F0B' },
  { label: 'Hors ligne', count: 13, pct: 8, color: '#E24B4A', badgeBg: '#FCEBEB', badgeText: '#A32D2D' },
];

const TICKETS = [
  { id: '#TK-081', desc: 'Écran éteint — Casablanca', client: 'AlphaMedia', status: 'Urgent', bg: '#FCEBEB', color: '#A32D2D' },
  { id: '#TK-080', desc: 'Mise à jour contenu', client: 'VistaAds', status: 'En cours', bg: '#FAEEDA', color: '#854F0B' },
  { id: '#TK-079', desc: 'Problème réseau', client: 'NovaCom', status: 'En cours', bg: '#FAEEDA', color: '#854F0B' },
  { id: '#TK-078', desc: 'Installation nouvel écran', client: 'BrightSign', status: 'Résolu', bg: '#E1F5EE', color: '#0F6E56' },
  { id: '#TK-077', desc: 'Recalibrage luminosité', client: 'AlphaMedia', status: 'Résolu', bg: '#E1F5EE', color: '#0F6E56' },
];

const TOP_CLIENTS = [
  { name: 'AlphaMedia', screens: 34, status: 'Actif', bg: '#E1F5EE', color: '#0F6E56' },
  { name: 'VistaAds', screens: 28, status: 'Actif', bg: '#E1F5EE', color: '#0F6E56' },
  { name: 'NovaCom', screens: 22, status: 'Partiel', bg: '#FAEEDA', color: '#854F0B' },
  { name: 'BrightSign', screens: 19, status: 'Actif', bg: '#E1F5EE', color: '#0F6E56' },
  { name: 'MediaPlus', screens: 14, status: 'Suspendu', bg: '#FCEBEB', color: '#A32D2D' },
];

// ── Card avec header vert pleine largeur ───────────────────
const cardBase = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const CardHeader = ({ title, subtitle }) => (
  <div style={{
    background: '#0F6E56',
    padding: '10px 20px',
    width: '100%',
    flexShrink: 0,
  }}>
    <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', margin: 0 }}>{title}</p>
    {subtitle && (
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', margin: '2px 0 0' }}>{subtitle}</p>
    )}
  </div>
);

const Badge = ({ label, bg, color }) => (
  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: bg, color }}>
    {label}
  </span>
);

const mapKpiIcon = (label) => {
  switch (label) {
    case 'Écrans actifs':
      return { Icon: Tv, iconBg: '#E1F5EE', iconColor: '#0F6E56' };
    case 'Tickets ouverts':
      return { Icon: AlertCircle, iconBg: '#FAEEDA', iconColor: '#854F0B' };
    case 'Clients actifs':
      return { Icon: Building2, iconBg: '#E6F1FB', iconColor: '#185FA5' };
    case 'Taux de dispo.':
    default:
      return { Icon: Activity, iconBg: '#E1F5EE', iconColor: '#0F6E56' };
  }
};

// ── Dashboard ──────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchStats = async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const headers = {};
      if (user && user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
      const response = await fetch('http://localhost:8085/api/dashboard', {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.warn("Dashboard service returned non-OK status. Falling back to default mockup data.");
      }
    } catch (err) {
      console.warn("Could not connect to Dashboard Service API. Falling back to mockup data.", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  // Merge backend data with local fallback icons and structures
  const kpis = stats?.kpis?.map((k) => ({
    ...k,
    ...mapKpiIcon(k.label)
  })) || KPI_DATA;

  const bars = stats?.activity || BARS;
  const screenStatuses = stats?.screenStatuses || SCREEN_STATUS;
  const tickets = stats?.recentTickets || TICKETS;
  const topClients = stats?.topClients || TOP_CLIENTS;

  return (
    <Layout>
      {/* Titre page + boutons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Tableau de bord</h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {stats ? (
            <span style={{ fontSize: '11px', color: '#10b981', background: '#d1fae5', padding: '3px 8px', borderRadius: '12px', fontWeight: 500 }}>
              ● Live
            </span>
          ) : (
            <span style={{ fontSize: '11px', color: '#64748b', background: '#e2e8f0', padding: '3px 8px', borderRadius: '12px', fontWeight: 500 }}>
              ○ Simulé
            </span>
          )}
          <button 
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              border: '1px solid #e2e8f0', 
              background: '#fff', 
              padding: '6px 12px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
          <button style={{ fontSize: '12px', color: '#fff', background: '#1D9E75', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            + Nouvel écran
          </button>
        </div>
      </div>

      {/* KPI — 4 colonnes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...cardBase, padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{k.label}</span>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.Icon size={15} color={k.iconColor} />
              </div>
            </div>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{k.value}</p>
            <p style={{ fontSize: '11px', marginTop: '4px', color: k.trend === 'up' ? '#1D9E75' : '#E24B4A' }}>
              {k.trend === 'up' ? '↑' : '↓'} {k.change}
            </p>
          </div>
        ))}
      </div>

      {/* Ligne 2 : graphique + statuts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '12px', marginBottom: '14px' }}>
        {/* Bar chart */}
        <div style={cardBase}>
          <CardHeader title="Activité écrans — 7 derniers jours" subtitle="Nombre de diffusions par jour" />
          <div style={{ padding: '16px 20px 18px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '110px' }}>
              {bars.map((b, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', height: `${b.height}%`, background: b.weekend ? '#C0DD97' : '#5DCAA5', borderRadius: '4px 4px 0 0' }} />
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{b.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statuts */}
        <div style={cardBase}>
          <CardHeader title="Statut des écrans" subtitle={`Vue globale — ${screenStatuses.reduce((acc, curr) => acc + curr.count, 0)} écrans`} />
          <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {screenStatuses.map((s) => (
              <div key={s.label}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#475569' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                    {s.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{s.count}</span>
                    <Badge label={`${s.pct}%`} bg={s.badgeBg} color={s.badgeText} />
                  </div>
                </div>
                <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: '99px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ligne 3 : tickets + clients */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Tickets */}
        <div style={cardBase}>
          <CardHeader title="Tickets récents" subtitle="5 derniers tickets" />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr>
                {['ID', 'Description', 'Client', 'Statut'].map((h) => (
                  <th key={h} style={{ textAlign: h === 'Statut' ? 'right' : 'left', padding: '8px 16px', fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '9px 16px', color: '#94a3b8', fontWeight: 500 }}>{t.id}</td>
                  <td style={{ padding: '9px 6px', color: '#334155' }}>{t.desc}</td>
                  <td style={{ padding: '9px 6px', color: '#94a3b8' }}>{t.client}</td>
                  <td style={{ padding: '9px 16px', textAlign: 'right' }}>
                    <Badge label={t.status} bg={t.bg} color={t.color} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Clients */}
        <div style={cardBase}>
          <CardHeader title="Clients — top écrans" subtitle="Classement par nombre d'écrans" />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr>
                {['Client', 'Écrans', 'Statut'].map((h) => (
                  <th key={h} style={{ textAlign: h === 'Statut' ? 'right' : 'left', padding: '8px 16px', fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topClients.map((c) => (
                <tr key={c.name} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '9px 16px', color: '#334155', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '9px 6px', color: '#64748b' }}>{c.screens}</td>
                  <td style={{ padding: '9px 16px', textAlign: 'right' }}>
                    <Badge label={c.status} bg={c.bg} color={c.color} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;