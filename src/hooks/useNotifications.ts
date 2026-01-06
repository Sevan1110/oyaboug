
// ============================================
// Notifications Hook
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { AppNotification, NotificationGroup, NotificationPreferences } from '@/types/notification.types';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  getUserNotifications,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification,
  archiveNotification as apiArchiveNotification,
  getPreferences as apiGetPreferences,
  updatePreferences as apiUpdatePreferences,
} from '@/services/notification.service';
import { getAuthUser } from '@/services';
import { supabaseClient } from '@/api/supabaseClient';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { unreadOnly?: boolean; limit?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      // Correctly extract user from Supabase response
      const { data } = await getAuthUser();
      const userId = data?.user?.id;

      if (!userId) {
        setNotifications([]);
        setPreferences(null);
        setIsLoading(false);
        return;
      }

      // Load notifications and preferences in parallel
      const [notifRes, prefRes] = await Promise.all([
        getUserNotifications(userId, {
          unreadOnly: opts?.unreadOnly,
          limit: opts?.limit,
        }),
        apiGetPreferences(userId)
      ]);

      if (notifRes.success && notifRes.data) {
        setNotifications(notifRes.data);
      } else {
        setError(notifRes.error?.message || 'Erreur lors du chargement des notifications');
      }

      if (prefRes.success && prefRes.data) {
        setPreferences(prefRes.data);
      }

    } catch (err: any) {
      setError(err?.message || 'Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    // Set up real-time subscription
    let subscription: any = null;

    const setupSubscription = async () => {
      const { data } = await getAuthUser();
      const userId = data?.user?.id;

      if (!userId || !supabaseClient) return;

      subscription = supabaseClient
        .channel('public:notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            // Reload on any change to user's notifications
            if (payload.new || payload.old) {
              load();
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (subscription) {
        supabaseClient?.removeChannel(subscription);
      }
    };
  }, [load]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read && !n.is_archived).length, [notifications]);

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

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { data } = await getAuthUser();
      const userId = data?.user?.id;
      if (!userId) return;

      // Optimistic update
      setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));

      const res = await apiMarkAsRead(notificationId, userId);
      if (!res.success) {
        // Revert on failure (could implement more robust rollback)
        load();
      }
    } catch (err) {
      load();
    }
  }, [load]);

  const markAllAsRead = useCallback(async () => {
    try {
      const { data } = await getAuthUser();
      const userId = data?.user?.id;
      if (!userId) return;

      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: now })));

      const res = await apiMarkAllAsRead(userId);
      if (!res.success) {
        load();
      }
    } catch (err) {
      load();
    }
  }, [load]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { data } = await getAuthUser();
      const userId = data?.user?.id;
      if (!userId) return;

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      const res = await apiDeleteNotification(notificationId, userId);
      if (!res.success) {
        load();
      }
    } catch (err) {
      load();
    }
  }, [load]);

  const archive = useCallback(async (notificationId: string) => {
    try {
      const { data } = await getAuthUser();
      const userId = data?.user?.id;
      if (!userId) return;

      setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, is_archived: true, archived_at: new Date().toISOString() } : n));

      const res = await apiArchiveNotification(notificationId, userId);
      if (!res.success) {
        load();
      }
    } catch (err) {
      load();
    }
  }, [load]);

  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    try {
      const { data } = await getAuthUser();
      const userId = data?.user?.id;
      if (!userId) return;

      // Optimistic update
      setPreferences((prev) => prev ? { ...prev, ...updates } : null);

      const res = await apiUpdatePreferences(userId, updates);
      if (res.success && res.data) {
        setPreferences(res.data);
      } else {
        // Revert or reload
        load();
      }
    } catch (err) {
      load();
    }
  }, [load]);

  const refreshNotifications = useCallback(() => load(), [load]);

  return {
    notifications,
    preferences,
    groupedNotifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    archiveNotification: archive,
    deleteNotification,
    updatePreferences,
    clearAll: async () => {
      // archive all locally and call markAllAsRead as a proximate action
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_archived: true, archived_at: now })));
      await markAllAsRead();
    },
    refreshNotifications,
  };
};
