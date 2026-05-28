import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import TicketFormModal from '../components/TicketFormModal';
import api from '../api';

import {
  RefreshCw,
  Ticket,
  CheckCircle,
  Search,
  Play,
  Check,
  XCircle,
  UserCheck,
  ChevronDown,
  X,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';

const TicketManagement = () => {
  const { user } = useAuth();

  const role = user?.role?.toUpperCase();

  const isAdmin =
    role === 'ADMIN' || role === 'ROLE_ADMIN';

  const isTechnicien =
    role === 'TECHNICIEN' ||
    role === 'ROLE_TECHNICIEN';

  const isClient =
    role === 'CLIENT' ||
    role === 'ROLE_CLIENT';

  const [tickets, setTickets] = useState([]);
  const [screens, setScreens] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [assignModal, setAssignModal] =
    useState(null);

  const [selectedTech, setSelectedTech] =
    useState('');

  const [assignError, setAssignError] =
    useState('');

  const [currentUserId, setCurrentUserId] =
    useState(null);

  const initialFormState = {
    screenId: '',
    problemType: '',
    description: '',
    priority: 'MOYENNE',
    createdByUserId: 1
  };

  const [formData, setFormData] =
    useState(initialFormState);

  // =========================================================
  // TOKEN
  // =========================================================

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');

      if (token) {
        const decoded = jwtDecode(token);

        const uid =
          decoded.userId ||
          decoded.id ||
          decoded.sub;

        const numUid = uid
          ? Number(uid)
          : null;

        setCurrentUserId(numUid);

        setFormData(prev => ({
          ...prev,
          createdByUserId: numUid || 1
        }));
      } else {
        setCurrentUserId(0);
      }
    } catch (e) {
      console.error(e);
      setCurrentUserId(0);
    }
  }, []);

  // =========================================================
  // FETCH DATA
  // =========================================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [ticketsRes, screensRes] =
        await Promise.all([
          api.get('/api/tickets'),

          api
            .get('/api/screens')
            .catch(() => ({ data: [] }))
        ]);

      let allTickets = ticketsRes.data || [];

      // =====================================================
      // ADMIN
      // =====================================================

      if (isAdmin) {
        allTickets = allTickets;
      }

      // =====================================================
      // TECHNICIEN
      // =====================================================

      else if (
        isTechnicien &&
        currentUserId
      ) {
        allTickets = allTickets.filter(
          ticket =>
            Number(
              ticket.assignedToTechnicianId
            ) === Number(currentUserId)
        );
      }

      // =====================================================
      // CLIENT
      // =====================================================

      else if (
        isClient &&
        currentUserId
      ) {
        allTickets = allTickets.filter(
          ticket =>
            Number(ticket.createdByUserId) ===
            Number(currentUserId)
        );
      }

      setTickets(allTickets);

      setScreens(screensRes.data || []);

      // =====================================================
      // TECHNICIENS
      // =====================================================

      if (isAdmin) {
        try {
          const usersRes =
            await api.get('/api/auth/users');

          const techs = (
            usersRes.data || []
          ).filter(
            u =>
              u.role
                ?.toUpperCase()
                .includes('TECHNICIEN') &&
              u.enabled
          );

          setTechniciens(techs);
        } catch (e) {
          console.warn(
            'Impossible de charger les techniciens',
            e
          );
        }
      }
    } catch (error) {
      console.error(
        'Erreur récupération données',
        error
      );
    } finally {
      setLoading(false);
    }
  }, [
    currentUserId,
    isAdmin,
    isTechnicien,
    isClient
  ]);

  useEffect(() => {
    if (currentUserId !== null) {
      fetchData();
    }
  }, [currentUserId, fetchData]);

  // =========================================================
  // CREATE TICKET
  // =========================================================

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        screenId: Number(formData.screenId),
        createdByUserId: Number(
          formData.createdByUserId
        )
      };

      await api.post('/api/tickets', payload);

      setIsModalOpen(false);

      fetchData();
    } catch (error) {
      console.error(error);

      const msg =
        error?.response?.data?.message ||
        'Erreur création ticket';

      alert(msg);
    }
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = async (
    id,
    action
  ) => {
    try {
      await api.put(
        `/api/tickets/${id}/${action}`,
        {}
      );

      fetchData();
    } catch (error) {
      console.error(error);

      alert(
        'Impossible de changer le statut.'
      );
    }
  };

  // =========================================================
  // RESOLVE
  // =========================================================

  const resolveTicket = async id => {
    const report = window.prompt(
      "Rapport d'intervention :"
    );

    if (report === null) return;

    try {
      await api.put(
        `/api/tickets/${id}/resolve`,
        {
          interventionReport: report
        }
      );

      fetchData();
    } catch (error) {
      console.error(error);

      alert(
        'Impossible de résoudre ce ticket.'
      );
    }
  };

  // =========================================================
  // ASSIGN
  // =========================================================

  const handleAssign = async () => {
    if (!selectedTech || !assignModal)
      return;

    setAssignError('');

    try {
      await api.post(
        `/api/tickets/${assignModal}/assign`,
        {
          technicianId: Number(
            selectedTech
          )
        }
      );

      setAssignModal(null);

      setSelectedTech('');

      fetchData();
    } catch (error) {
      console.error(error);

      const msg =
        error?.response?.data?.message ||
        "Erreur d'assignation.";

      setAssignError(msg);
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getTechName = id => {
    if (!id) return '—';

    const t = techniciens.find(
      t =>
        t.id === id ||
        t.id === Number(id)
    );

    return t
      ? t.username
      : `Tech #${id}`;
  };

  const getPriorityBadge = priority => {
    const p = {
      BASSE: {
        color:
          'text-slate-400 bg-slate-500/10 border-slate-500/20',
        label: 'Basse'
      },

      MOYENNE: {
        color:
          'text-blue-400 bg-blue-500/10 border-blue-500/20',
        label: 'Moyenne'
      },

      HAUTE: {
        color:
          'text-amber-400 bg-amber-500/10 border-amber-500/20',
        label: 'Haute'
      },

      CRITIQUE: {
        color:
          'text-rose-400 bg-rose-500/10 border-rose-500/20',
        label: 'Critique'
      }
    }[priority];

    return (
      <span
        className={`px-2 py-0.5 inline-block text-[10px] rounded uppercase font-bold tracking-widest border ${p?.color}`}
      >
        {p?.label}
      </span>
    );
  };

  const getStatusBadge = status => {
    const s = {
      OUVERT: {
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        label: 'Ouvert',
        dot: 'bg-amber-400'
      },

      EN_COURS: {
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        label: 'En cours',
        dot: 'bg-blue-400'
      },

      RESOLU: {
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border:
          'border-emerald-500/20',
        label: 'Résolu',
        dot: 'bg-emerald-400'
      },

      FERME: {
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/20',
        label: 'Fermé',
        dot: 'bg-slate-400'
      }
    }[status];

    return (
      <span
        className={`${s?.bg} ${s?.color} ${s?.border} border px-3 py-1.5 text-[11px] rounded-lg font-bold inline-flex items-center gap-2`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${s?.dot}`}
        />

        {s?.label}
      </span>
    );
  };

  // =========================================================
  // ACTIONS
  // =========================================================

  const renderActions = ticket => {
    if (isClient) {
      return (
        <span className="text-[10px] font-bold text-slate-500 italic px-2">
          Lecture seule
        </span>
      );
    }

    return (
      <div className="flex justify-end gap-2 flex-wrap">
        {isAdmin &&
          ticket.status !== 'FERME' && (
            <button
              onClick={() => {
                setAssignError('');
                setSelectedTech(
                  String(
                    ticket.assignedToTechnicianId ||
                      ''
                  )
                );
                setAssignModal(ticket.id);
              }}
              className="px-3 py-1.5 border rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20"
            >
              <UserCheck size={12} />

              {ticket.assignedToTechnicianId
                ? 'Réassigner'
                : 'Assigner'}
            </button>
          )}

        {(isAdmin || isTechnicien) &&
          ticket.status === 'OUVERT' && (
            <button
              onClick={() =>
                updateStatus(
                  ticket.id,
                  'start'
                )
              }
              className="px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Play
                size={12}
                className="fill-current"
              />

              Démarrer
            </button>
          )}

        {(isAdmin || isTechnicien) &&
          ticket.status ===
            'EN_COURS' && (
            <button
              onClick={() =>
                resolveTicket(ticket.id)
              }
              className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Check
                size={12}
                strokeWidth={3}
              />

              Résoudre
            </button>
          )}

        {isAdmin &&
          ticket.status ===
            'RESOLU' && (
            <button
              onClick={() =>
                updateStatus(
                  ticket.id,
                  'close'
                )
              }
              className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle size={12} />

              Clôturer
            </button>
          )}

        {ticket.status === 'FERME' && (
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
            Archivé
          </span>
        )}

        <button className="p-2 text-slate-500 hover:text-white rounded-lg cursor-pointer">
          <MoreVertical size={16} />
        </button>
      </div>
    );
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredTickets =
    tickets.filter(
      t =>
        t.ticketNumber
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        t.problemType
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        t.description
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
    );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Centre de Support
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            Gestion des tickets
          </p>
        </div>

        {(isAdmin || isClient) && (
          <button
            onClick={() =>
              setIsModalOpen(true)
            }
            className="flex items-center gap-2 h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition-all"
          >
            <Ticket size={16} />

            Ouvrir un ticket
          </button>
        )}
      </div>

      {/* TABLE */}

      <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center">
            <RefreshCw className="animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/40 border-b border-white/5 text-slate-400 uppercase text-[10px]">
                  <th className="px-6 py-4">
                    Référence
                  </th>

                  <th className="px-6 py-4">
                    Problème
                  </th>

                  <th className="px-6 py-4">
                    Statut
                  </th>

                  {(isAdmin ||
                    isTechnicien) && (
                    <th className="px-6 py-4">
                      Technicien
                    </th>
                  )}

                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredTickets.map(
                    (ticket, idx) => (
                      <motion.tr
                        key={ticket.id}
                        initial={{
                          opacity: 0,
                          y: 5
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        exit={{
                          opacity: 0,
                          y: -5
                        }}
                        transition={{
                          duration: 0.2,
                          delay:
                            idx * 0.02
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <span className="font-mono text-[11px] font-bold text-slate-300 bg-slate-800 border border-white/5 px-2 py-1 rounded-md w-fit">
                              {
                                ticket.ticketNumber
                              }
                            </span>

                            {getPriorityBadge(
                              ticket.priority
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-white">
                            {
                              ticket.problemType
                            }
                          </span>

                          <span className="block text-slate-400 mt-1">
                            {
                              ticket.description
                            }
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {getStatusBadge(
                            ticket.status
                          )}
                        </td>

                        {(isAdmin ||
                          isTechnicien) && (
                          <td className="px-6 py-4">
                            {getTechName(
                              ticket.assignedToTechnicianId
                            )}
                          </td>
                        )}

                        <td className="px-6 py-4 text-right">
                          {renderActions(
                            ticket
                          )}
                        </td>
                      </motion.tr>
                    )
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ASSIGN MODAL */}

      <AnimatePresence>
        {assignModal && (
          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              exit={{
                opacity: 0,
                scale: 0.95
              }}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-white/5"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-white font-bold">
                  Assigner technicien
                </h3>

                <button
                  onClick={() =>
                    setAssignModal(null)
                  }
                >
                  <X className="text-slate-400" />
                </button>
              </div>

              {assignError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                  {assignError}
                </div>
              )}

              <select
                value={selectedTech}
                onChange={e =>
                  setSelectedTech(
                    e.target.value
                  )
                }
                className="w-full h-10 px-3 bg-slate-800 border border-white/5 rounded-xl text-white text-sm"
              >
                <option value="">
                  Sélectionner
                </option>

                {techniciens.map(t => (
                  <option
                    key={t.id}
                    value={t.id}
                  >
                    {t.username}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() =>
                    setAssignModal(null)
                  }
                  className="h-10 px-4 border border-white/5 rounded-xl text-slate-300"
                >
                  Annuler
                </button>

                <button
                  onClick={handleAssign}
                  className="h-10 px-4 bg-emerald-500 rounded-xl text-slate-950 font-bold"
                >
                  Assigner
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TicketFormModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        screens={screens}
      />
    </Layout>
  );
};

export default TicketManagement;