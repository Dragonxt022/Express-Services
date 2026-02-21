import React, { useEffect, useState } from 'react';
import { Bell, Trash2, CheckCircle, Clock, X, Info } from 'lucide-react';
import {
  AppNotification,
  clearNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  onNotificationsUpdated,
  removeNotification
} from '../utils/notifications';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const reload = () => {
      const saved = getNotifications()
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(saved);
    };

    reload();
    const unsubscribe = onNotificationsUpdated(reload);
    return () => unsubscribe();
  }, []);

  const clearAll = () => {
    if (confirm('Deseja excluir todas as notificacoes?')) clearNotifications();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificacoes</h1>
          <p className="text-gray-500">Fique por dentro do que acontece na sua conta.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllNotificationsRead}
            className="p-2 text-gray-400 hover:text-pink-600 transition-colors"
            title="Marcar todas como lidas"
          >
            <CheckCircle size={20} />
          </button>
          <button
            onClick={clearAll}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Limpar tudo"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[3rem] border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
            <Bell size={40} />
          </div>
          <p className="font-bold text-gray-400">Tudo limpo por aqui!</p>
          <p className="text-sm text-gray-300">Nao ha novas notificacoes no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-6 rounded-[2rem] border transition-all flex items-start gap-4 group ${
                notif.read ? 'bg-white border-gray-100 opacity-60' : 'bg-white border-pink-100 shadow-sm ring-1 ring-pink-50'
              }`}
            >
              <div className={`p-3 rounded-2xl ${
                notif.type === 'success' ? 'bg-green-50 text-green-600' :
                notif.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {notif.type === 'success' ? <CheckCircle size={20} /> : notif.type === 'warning' ? <Info size={20} /> : <Clock size={20} />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-bold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{notif.time}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{notif.message}</p>
              </div>

              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notif.read && (
                  <button onClick={() => markNotificationRead(notif.id)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-pink-600">
                    <CheckCircle size={18} />
                  </button>
                )}
                <button onClick={() => removeNotification(notif.id)} className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600">
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
