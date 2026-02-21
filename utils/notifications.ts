import { storage } from './storage';

export type AppNotificationType = 'info' | 'success' | 'warning';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: AppNotificationType;
  createdAt: string;
  eventType?: string;
}

const STORAGE_KEY = 'notifications';
const NOTIFICATION_EVENT = 'be_notifications_updated';

export const getNotifications = (): AppNotification[] => {
  return storage.get<AppNotification[]>(STORAGE_KEY, []);
};

const saveNotifications = (items: AppNotification[]) => {
  storage.set(STORAGE_KEY, items);
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT));
};

export const markNotificationRead = (id: string) => {
  const current = getNotifications();
  saveNotifications(current.map((item) => (item.id === id ? { ...item, read: true } : item)));
};

export const removeNotification = (id: string) => {
  const current = getNotifications();
  saveNotifications(current.filter((item) => item.id !== id));
};

export const clearNotifications = () => {
  saveNotifications([]);
};

export const markAllNotificationsRead = () => {
  const current = getNotifications();
  saveNotifications(current.map((item) => ({ ...item, read: true })));
};

export const pushNotification = (notification: Omit<AppNotification, 'id' | 'time' | 'createdAt' | 'read'>) => {
  const current = getNotifications();
  const createdAt = new Date().toISOString();
  const nextItem: AppNotification = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    time: 'Agora',
    read: false,
    createdAt,
    ...notification
  };
  saveNotifications([nextItem, ...current].slice(0, 200));
};

export const onNotificationsUpdated = (handler: () => void) => {
  const wrapped = () => handler();
  window.addEventListener(NOTIFICATION_EVENT, wrapped as EventListener);
  window.addEventListener('storage', wrapped as EventListener);
  return () => {
    window.removeEventListener(NOTIFICATION_EVENT, wrapped as EventListener);
    window.removeEventListener('storage', wrapped as EventListener);
  };
};

export const mapSseEventToNotification = (event: any, role?: string) => {
  const type = String(event?.type || '');
  const payload = event?.payload || {};
  const professionalName = payload?.professional_name_ref || payload?.professional_name || 'Nao definido';
  const companyName = payload?.company_name || 'Empresa';
  const customerName = payload?.customer_name || payload?.client_name || 'Cliente';

  if (type === 'appointment_created') {
    return {
      title: 'Nova solicitacao de servico',
      message: `${customerName} solicitou atendimento. Profissional: ${professionalName}.`,
      type: 'success' as AppNotificationType
    };
  }

  if (type === 'order_status_changed') {
    const statusText = String(payload?.status || '').toUpperCase();
    if (role === 'EMPRESA') {
      return {
        title: 'Status de pedido alterado',
        message: `Pedido #${payload?.id || '-'} em ${statusText}. Profissional: ${professionalName}.`,
        type: 'info' as AppNotificationType
      };
    }
    return {
      title: 'Pedido atualizado',
      message: `Seu pedido agora esta com status: ${statusText}.`,
      type: 'info' as AppNotificationType
    };
  }

  if (type === 'review_created') {
    const rating = payload?.rating ? `${payload.rating}/5` : 'nova nota';
    if (role === 'EMPRESA') {
      return {
        title: 'Nova avaliacao recebida',
        message: `Cliente enviou avaliacao ${rating}.`,
        type: 'success' as AppNotificationType
      };
    }
    return {
      title: 'Nova avaliacao recebida',
      message: `${companyName} recebeu avaliacao ${rating}.`,
      type: 'success' as AppNotificationType
    };
  }

  if (type === 'appointment_status_changed') {
    return {
      title: 'Agendamento atualizado',
      message: `Seu agendamento foi atualizado para ${String(payload?.status || '').toUpperCase()}.`,
      type: role === 'EMPRESA' ? ('warning' as AppNotificationType) : ('info' as AppNotificationType)
    };
  }

  if (type.startsWith('order_') || type.startsWith('appointment_')) {
    return {
      title: 'Atualizacao',
      message: event?.message || 'Voce recebeu uma atualizacao.',
      type: 'info' as AppNotificationType
    };
  }

  return null;
};
