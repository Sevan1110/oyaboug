// ============================================
// Notifications Hook
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { useState, useCallback, useMemo } from 'react';
import type { AppNotification, NotificationGroup } from '@/types/notification.types';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Mock notifications for demo
const mockNotifications: AppNotification[] = [
  {
    id: '1',
    user_id: 'user-1',
    type: 'order_confirmed',
    category: 'order',
    priority: 'high',
    title: 'Commande confirmée',
    message: 'Votre panier surprise chez Boulangerie du Coin est prêt à être récupéré',
    action_url: '/user/orders/1',
    action_label: 'Voir ma commande',
    is_read: false,
    is_archived: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'user-1',
    type: 'qr_generated',
    category: 'payment',
    priority: 'high',
    title: 'QR Code généré',
    message: 'Votre QR code de récupération est disponible. Présentez-le au commerçant.',
    action_url: '/user/transactions',
    action_label: 'Voir mon QR',
    is_read: false,
    is_archived: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    user_id: 'user-1',
    type: 'impact_milestone',
    category: 'impact',
    priority: 'medium',
    title: 'Bravo ! 🎉',
    message: 'Vous avez sauvé 10 kg de nourriture ! Continuez comme ça.',
    is_read: true,
    is_archived: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '4',
    user_id: 'user-1',
    type: 'new_food_nearby',
    category: 'promotion',
    priority: 'low',
    title: 'Nouveau panier disponible',
    message: 'Restaurant Le Gabonais a ajouté un nouveau panier surprise à -50%',
    action_url: '/search',
    action_label: 'Découvrir',
    is_read: true,
    is_archived: false,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read && !n.is_archived).length,
    [notifications]
  );

  const groupedNotifications = useMemo((): NotificationGroup[] => {
    const groups: Record<string, AppNotification[]> = {};
    
    notifications
      .filter((n) => !n.is_archived)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .forEach((notification) => {
        const date = parseISO(notification.created_at);
        let groupKey: string;

        if (isToday(date)) {
          groupKey = "Aujourd'hui";
        } else if (isYesterday(date)) {
          groupKey = 'Hier';
        } else {
          groupKey = format(date, 'EEEE d MMMM', { locale: fr });
        }

        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(notification);
      });

    return Object.entries(groups).map(([date, notifs]) => ({
      date,
      notifications: notifs,
    }));
  }, [notifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: now }))
    );
  }, []);

  const archiveNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, is_archived: true, archived_at: new Date().toISOString() }
          : n
      )
    );
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const clearAll = useCallback(() => {
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_archived: true, archived_at: now }))
    );
  }, []);

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  return {
    notifications,
    groupedNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    clearAll,
    refreshNotifications,
  };
};
