// ============================================
// Notification Service
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

import type { ApiResponse } from '@/types';
import type {
  AppNotification,
  NotificationPreferences,
  CreateNotificationInput,
  NotificationCategory,
} from '@/types/notification.types';

// Mock data
const mockNotifications: AppNotification[] = [];
const mockPreferences: Map<string, NotificationPreferences> = new Map();

/**
 * Get user notifications
 */
export const getUserNotifications = async (
  userId: string,
  options?: {
    unreadOnly?: boolean;
    category?: NotificationCategory;
    limit?: number;
  }
): Promise<ApiResponse<AppNotification[]>> => {
  let notifications = mockNotifications.filter(
    (n) => n.user_id === userId && !n.is_archived
  );

  if (options?.unreadOnly) {
    notifications = notifications.filter((n) => !n.is_read);
  }

  if (options?.category) {
    notifications = notifications.filter((n) => n.category === options.category);
  }

  // Sort by creation date (newest first)
  notifications.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (options?.limit) {
    notifications = notifications.slice(0, options.limit);
  }

  return { data: notifications, error: null, success: true };
};

/**
 * Get unread count
 */
export const getUnreadCount = async (
  userId: string
): Promise<ApiResponse<number>> => {
  const count = mockNotifications.filter(
    (n) => n.user_id === userId && !n.is_read && !n.is_archived
  ).length;

  return { data: count, error: null, success: true };
};

/**
 * Mark notification as read
 */
export const markAsRead = async (
  notificationId: string,
  userId: string
): Promise<ApiResponse<null>> => {
  const notification = mockNotifications.find(
    (n) => n.id === notificationId && n.user_id === userId
  );

  if (!notification) {
    return {
      data: null,
      error: { code: 'NOT_FOUND', message: 'Notification introuvable' },
      success: false,
    };
  }

  notification.is_read = true;
  notification.read_at = new Date().toISOString();

  return { data: null, error: null, success: true };
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (
  userId: string
): Promise<ApiResponse<null>> => {
  const now = new Date().toISOString();

  mockNotifications
    .filter((n) => n.user_id === userId && !n.is_read)
    .forEach((n) => {
      n.is_read = true;
      n.read_at = now;
    });

  return { data: null, error: null, success: true };
};

/**
 * Archive notification
 */
export const archiveNotification = async (
  notificationId: string,
  userId: string
): Promise<ApiResponse<null>> => {
  const notification = mockNotifications.find(
    (n) => n.id === notificationId && n.user_id === userId
  );

  if (!notification) {
    return {
      data: null,
      error: { code: 'NOT_FOUND', message: 'Notification introuvable' },
      success: false,
    };
  }

  notification.is_archived = true;
  notification.archived_at = new Date().toISOString();

  return { data: null, error: null, success: true };
};

/**
 * Delete notification
 */
export const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<ApiResponse<null>> => {
  const index = mockNotifications.findIndex(
    (n) => n.id === notificationId && n.user_id === userId
  );

  if (index === -1) {
    return {
      data: null,
      error: { code: 'NOT_FOUND', message: 'Notification introuvable' },
      success: false,
    };
  }

  mockNotifications.splice(index, 1);

  return { data: null, error: null, success: true };
};

/**
 * Create notification (internal use)
 */
export const createNotification = async (
  input: CreateNotificationInput
): Promise<ApiResponse<AppNotification>> => {
  const notification: AppNotification = {
    id: `notif_${Date.now()}`,
    user_id: input.user_id,
    type: input.type,
    category: input.category,
    priority: input.priority || 'medium',
    title: input.title,
    message: input.message,
    icon: input.icon,
    image_url: input.image_url,
    action_url: input.action_url,
    action_label: input.action_label,
    data: input.data,
    is_read: false,
    is_archived: false,
    expires_at: input.expires_at,
    created_at: new Date().toISOString(),
  };

  mockNotifications.push(notification);

  return { data: notification, error: null, success: true };
};

/**
 * Get notification preferences
 */
export const getPreferences = async (
  userId: string
): Promise<ApiResponse<NotificationPreferences>> => {
  let prefs = mockPreferences.get(userId);

  if (!prefs) {
    prefs = {
      user_id: userId,
      push_enabled: true,
      email_enabled: true,
      sms_enabled: false,
      categories: {
        order: true,
        payment: true,
        promotion: true,
        system: true,
        merchant: true,
        impact: true,
      },
      quiet_hours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockPreferences.set(userId, prefs);
  }

  return { data: prefs, error: null, success: true };
};

/**
 * Update notification preferences
 */
export const updatePreferences = async (
  userId: string,
  updates: Partial<NotificationPreferences>
): Promise<ApiResponse<NotificationPreferences>> => {
  const current = mockPreferences.get(userId) || {
    user_id: userId,
    push_enabled: true,
    email_enabled: true,
    sms_enabled: false,
    categories: {
      order: true,
      payment: true,
      promotion: true,
      system: true,
      merchant: true,
      impact: true,
    },
    quiet_hours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updated: NotificationPreferences = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  mockPreferences.set(userId, updated);

  return { data: updated, error: null, success: true };
};

/**
 * Send order notification
 */
export const sendOrderNotification = async (
  userId: string,
  type: 'confirmed' | 'ready' | 'cancelled' | 'completed',
  orderData: { id: string; itemName: string; merchantName: string }
): Promise<void> => {
  const messages = {
    confirmed: {
      title: 'Commande confirmée',
      message: `Votre commande de ${orderData.itemName} chez ${orderData.merchantName} est confirmée`,
    },
    ready: {
      title: 'Commande prête',
      message: `Votre ${orderData.itemName} est prêt à être récupéré chez ${orderData.merchantName}`,
    },
    cancelled: {
      title: 'Commande annulée',
      message: `Votre commande chez ${orderData.merchantName} a été annulée`,
    },
    completed: {
      title: 'Commande récupérée',
      message: `Merci ! Vous avez récupéré votre ${orderData.itemName}`,
    },
  };

  await createNotification({
    user_id: userId,
    type: `order_${type}` as AppNotification['type'],
    category: 'order',
    priority: type === 'ready' ? 'high' : 'medium',
    ...messages[type],
    action_url: `/user/orders/${orderData.id}`,
    action_label: 'Voir ma commande',
    data: orderData,
  });
};

/**
 * Send QR code notification
 */
export const sendQRCodeNotification = async (
  userId: string,
  transactionId: string
): Promise<void> => {
  await createNotification({
    user_id: userId,
    type: 'qr_generated',
    category: 'payment',
    priority: 'high',
    title: 'QR Code généré',
    message: 'Votre QR code de récupération est disponible. Présentez-le au commerçant.',
    action_url: `/user/transactions/${transactionId}`,
    action_label: 'Voir mon QR code',
    data: { transactionId },
  });
};
