import React from 'react';
import { CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const StatusBadge = ({ status, label }) => {
  const statusConfig = {
    ACTIVE: {
      icon: CheckCircle2,
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      glow: 'shadow-emerald-100/50',
      label: label || 'Actif'
    },
    PENDING: {
      icon: Clock,
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      glow: 'shadow-amber-100/50',
      label: label || 'En attente'
    },
    REJECTED: {
      icon: XCircle,
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      glow: 'shadow-red-100/50',
      label: label || 'Rejeté'
    },
    INACTIVE: {
      icon: AlertCircle,
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      glow: 'shadow-slate-100/50',
      label: label || 'Inactif'
    }
  };

  const config = statusConfig[status] || statusConfig.INACTIVE;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-semibold text-xs uppercase tracking-wider ${config.bg} ${config.text} ${config.border} shadow-md ${config.glow}`}
    >
      <Icon size={14} />
      <span>{config.label}</span>
      
      {status === 'PENDING' && (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="ml-1 w-1.5 h-1.5 rounded-full bg-current"
        />
      )}
    </motion.div>
  );
};

export default StatusBadge;
