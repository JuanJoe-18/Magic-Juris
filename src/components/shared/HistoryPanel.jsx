import React, { useState, useEffect } from 'react';
import { auditService } from '../../services/auditService';
import { FileText, MessageSquare, Plus, Trash2 } from 'lucide-react';

const EventIcon = ({ actionType }) => {
  const config = {
    'create_process': { icon: Plus, color: 'text-green-400' },
    'update_process': { icon: FileText, color: 'text-blue-400' },
    'sync_actuation': { icon: FileText, color: 'text-yellow-400' },
    'create_communication': { icon: MessageSquare, color: 'text-purple-400' },
    'delete_process': { icon: Trash2, color: 'text-hg-red' },
    'default': { icon: FileText, color: 'text-hg-gray' },
  };
  
  const { icon: Icon, color } = config[actionType] || config['default'];
  return <Icon size={16} className={color} />;
};

export default function HistoryPanel({ processId = null, limit = 8 }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = processId
          ? await auditService.getAuditLogsByProcess(processId)
          : await auditService.getAuditLogs();
        setLogs(Array.isArray(data) ? data.slice(0, limit) : []);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [processId, limit]);

  if (loading) {
    return <div className="text-hg-gray text-sm">Cargando historial...</div>;
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-hg-gray text-sm">No hay eventos registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log, idx) => (
        <div
          key={log.id}
          className="flex gap-4 pb-3 border-b border-hg-border last:border-b-0"
        >
          <div className="flex-shrink-0 pt-1">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-hg-surface border border-hg-border">
              <EventIcon actionType={log.action_type} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{log.description}</p>
            <p className="text-xs text-hg-gray mt-1">
              {new Date(log.created_at).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
