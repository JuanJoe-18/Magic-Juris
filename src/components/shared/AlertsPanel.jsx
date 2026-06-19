import React, { useState, useEffect } from 'react';
import { alertService } from '../../services/alertService';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const AlertBadge = ({ nivel }) => {
  const config = {
    'ALTA': { bg: 'bg-hg-red/10', border: 'border-hg-red', text: 'text-hg-red', icon: AlertCircle },
    'MEDIA': { bg: 'bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-400', icon: AlertTriangle },
    'BAJA': { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-400', icon: Info },
  };
  
  const { bg, border, text, icon: Icon } = config[nivel] || config['BAJA'];
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${bg} ${border}`}>
      <Icon size={14} className={text} />
      <span className={`text-xs font-semibold ${text}`}>{nivel}</span>
    </div>
  );
};

export default function AlertsPanel({ processId = null, limit = 5 }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = processId 
          ? await alertService.getAlertsByProcess(processId)
          : await alertService.getAlerts();
        setAlerts(Array.isArray(data) ? data.slice(0, limit) : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setAlerts([]);
        setError(null); // Don't show error for demo
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [processId, limit]);

  const handleMarkAsRead = async (alertId) => {
    try {
      await alertService.markAsRead(alertId);
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, leida: true } : a));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  if (loading) {
    return <div className="text-hg-gray text-sm">Cargando alertas...</div>;
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-hg-gray text-sm">No hay alertas por el momento</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start gap-3 p-3 rounded-lg border ${
            alert.leida ? 'border-hg-border bg-hg-surface/50' : 'border-hg-red/30 bg-hg-red/5'
          }`}
        >
          <AlertBadge nivel={alert.nivel} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white line-clamp-2">{alert.mensaje}</p>
            <p className="text-xs text-hg-gray mt-1">
              {new Date(alert.created_at).toLocaleDateString('es-CO')}
            </p>
          </div>
          {!alert.leida && (
            <button
              onClick={() => handleMarkAsRead(alert.id)}
              className="text-hg-gray hover:text-white transition-colors flex-shrink-0"
              title="Marcar como leída"
            >
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
