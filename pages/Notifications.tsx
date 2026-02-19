
import React, { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCircle, Clock, X, Info } from 'lucide-react';
import { storage } from '../utils/storage';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Novo Agendamento', message: 'Maria Souza agendou Manicure para amanhã às 10:00.', time: 'Há 5 min', read: false, type: 'success' },
  { id: '2', title: 'Pagamento Recebido', message: 'O repasse da semana anterior foi processado com sucesso.', time: 'Há 2h', read: false, type: 'info' },
  { id: '3', title: 'Atualização de Sistema', message: 'Novas funcionalidades de IA foram adicionadas ao seu painel.', time: 'Há 1 dia', read: true, type: 'warning' },
];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const saved = storage.get<Notification[]>('notifications', INITIAL_NOTIFICATIONS);
    setNotifications(saved);
  }, []);

  const save = (list: Notification[]) => {
    setNotifications(list);
    storage.set('notifications', list);
  };

  const markAsRead = (id: string) => {
    save(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
    save(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    if (confirm('Deseja excluir todas as notificações?')) save([]);
  };

  const markAllRead = () => {
    save(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-500">Fique por dentro do que acontece na sua conta.</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={markAllRead}
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
          <p className="text-sm text-gray-300">Não há novas notificações no momento.</p>
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
                  <button onClick={() => markAsRead(notif.id)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-pink-600">
                    <CheckCircle size={18} />
                  </button>
                )}
                <button onClick={() => deleteNotification(notif.id)} className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600">
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
