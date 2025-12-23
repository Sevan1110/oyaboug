// ============================================
// Transaction Service
// SaveFood Platform - Anti-gaspillage alimentaire
// ============================================

import type { ApiResponse } from '@/types';
import type {
  Transaction,
  TransactionStatus,
  CreateTransactionInput,
  QRCodeScanResult,
  QRCodeData,
  TransactionAuditLog,
  TransactionAction,
} from '@/types/transaction.types';

// Mock data
const mockTransactions: Transaction[] = [];

/**
 * Generate a secure signature for QR code
 */
const generateSignature = (data: Omit<QRCodeData, 'signature'>): string => {
  const payload = JSON.stringify(data);
  // In production, this would use HMAC or similar
  return btoa(payload).substring(0, 32);
};

/**
 * Generate QR code data for a paid transaction
 */
const generateQRCodeData = (transaction: Transaction): QRCodeData => {
  const data: Omit<QRCodeData, 'signature'> = {
    transaction_id: transaction.id,
    user_id: transaction.user_id,
    item_id: transaction.item_id,
    item_type: transaction.item_type,
    merchant_id: transaction.merchant_id,
    status: 'paid',
    created_at: new Date().toISOString(),
    expires_at: transaction.expires_at,
    is_used: false,
  };

  return {
    ...data,
    signature: generateSignature(data),
  };
};

/**
 * Create a new transaction (reservation)
 */
export const createTransaction = async (
  userId: string,
  merchantId: string,
  input: CreateTransactionInput,
  itemDetails: { name: string; price: number; originalPrice: number }
): Promise<ApiResponse<Transaction>> => {
  const transaction: Transaction = {
    id: `txn_${Date.now()}`,
    user_id: userId,
    merchant_id: merchantId,
    item_id: input.item_id,
    item_type: input.item_type,
    item_name: itemDetails.name,
    quantity: input.quantity,
    total_amount: itemDetails.price * input.quantity,
    original_amount: itemDetails.originalPrice * input.quantity,
    savings: (itemDetails.originalPrice - itemDetails.price) * input.quantity,
    status: 'reserved',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockTransactions.push(transaction);
  await logAction(transaction.id, userId, 'created');

  return { data: transaction, error: null, success: true };
};

/**
 * Process payment and generate QR code
 */
export const processPayment = async (
  transactionId: string,
  userId: string,
  paymentMethod: string,
  paymentReference: string
): Promise<ApiResponse<Transaction>> => {
  const transaction = mockTransactions.find((t) => t.id === transactionId);

  if (!transaction) {
    return {
      data: null,
      error: { code: 'NOT_FOUND', message: 'Transaction introuvable' },
      success: false,
    };
  }

  if (transaction.user_id !== userId) {
    return {
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Non autorisé' },
      success: false,
    };
  }

  if (transaction.status !== 'reserved') {
    return {
      data: null,
      error: { code: 'INVALID_STATUS', message: 'Transaction non réservée' },
      success: false,
    };
  }

  // Generate QR code data
  const qrCodeData = generateQRCodeData(transaction);
  const qrCodeString = btoa(JSON.stringify(qrCodeData));

  // Update transaction
  transaction.status = 'paid';
  transaction.payment_method = paymentMethod;
  transaction.payment_reference = paymentReference;
  transaction.paid_at = new Date().toISOString();
  transaction.qr_code = qrCodeString;
  transaction.qr_code_data = qrCodeData;
  transaction.updated_at = new Date().toISOString();

  await logAction(transactionId, userId, 'payment_completed');
  await logAction(transactionId, userId, 'qr_generated');

  return { data: transaction, error: null, success: true };
};

/**
 * Validate QR code for pickup
 */
export const validateQRCode = async (
  qrCodeString: string,
  userId: string
): Promise<QRCodeScanResult> => {
  try {
    // Parse QR code
    let qrData: QRCodeData;
    try {
      qrData = JSON.parse(atob(qrCodeString));
    } catch {
      return {
        success: false,
        message: 'QR code invalide ou illisible',
        error_code: 'INVALID_QR',
      };
    }

    // Verify signature
    const expectedSignature = generateSignature({
      transaction_id: qrData.transaction_id,
      user_id: qrData.user_id,
      item_id: qrData.item_id,
      item_type: qrData.item_type,
      merchant_id: qrData.merchant_id,
      status: qrData.status,
      created_at: qrData.created_at,
      expires_at: qrData.expires_at,
      is_used: qrData.is_used,
    });

    if (qrData.signature !== expectedSignature) {
      await logAction(qrData.transaction_id, userId, 'qr_rejected', {
        reason: 'tampered',
      });
      return {
        success: false,
        message: 'QR code altéré ou falsifié',
        error_code: 'QR_TAMPERED',
      };
    }

    // Find transaction
    const transaction = mockTransactions.find(
      (t) => t.id === qrData.transaction_id
    );

    if (!transaction) {
      return {
        success: false,
        message: 'Transaction introuvable',
        error_code: 'TRANSACTION_NOT_FOUND',
      };
    }

    // Verify user ownership
    if (transaction.user_id !== userId) {
      await logAction(transaction.id, userId, 'qr_rejected', {
        reason: 'unauthorized_user',
      });
      return {
        success: false,
        message: 'Ce QR code ne vous appartient pas',
        error_code: 'UNAUTHORIZED_USER',
      };
    }

    // Verify payment status
    if (transaction.status !== 'paid') {
      if (transaction.status === 'consumed') {
        return {
          success: false,
          message: 'Ce QR code a déjà été utilisé',
          error_code: 'ALREADY_CONSUMED',
        };
      }
      return {
        success: false,
        message: 'Transaction non payée',
        error_code: 'NOT_PAID',
      };
    }

    // Check expiry
    if (new Date(transaction.expires_at) < new Date()) {
      transaction.status = 'expired';
      transaction.updated_at = new Date().toISOString();
      return {
        success: false,
        message: 'QR code expiré',
        error_code: 'EXPIRED',
      };
    }

    // All validations passed - mark as consumed
    await logAction(transaction.id, userId, 'qr_validated');

    return {
      success: true,
      message: 'QR code validé avec succès',
      transaction,
    };
  } catch (error) {
    console.error('QR validation error:', error);
    return {
      success: false,
      message: 'Erreur lors de la validation du QR code',
      error_code: 'SCAN_ERROR',
    };
  }
};

/**
 * Complete transaction (mark as consumed)
 */
export const completeTransaction = async (
  transactionId: string,
  userId: string
): Promise<ApiResponse<Transaction>> => {
  const transaction = mockTransactions.find((t) => t.id === transactionId);

  if (!transaction) {
    return {
      data: null,
      error: { code: 'NOT_FOUND', message: 'Transaction introuvable' },
      success: false,
    };
  }

  if (transaction.user_id !== userId) {
    return {
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Non autorisé' },
      success: false,
    };
  }

  if (transaction.status !== 'paid') {
    return {
      data: null,
      error: { code: 'INVALID_STATUS', message: 'Transaction non payée' },
      success: false,
    };
  }

  transaction.status = 'consumed';
  transaction.consumed_at = new Date().toISOString();
  transaction.updated_at = new Date().toISOString();

  if (transaction.qr_code_data) {
    transaction.qr_code_data.is_used = true;
  }

  await logAction(transactionId, userId, 'consumed');

  return { data: transaction, error: null, success: true };
};

/**
 * Cancel transaction
 */
export const cancelTransaction = async (
  transactionId: string,
  userId: string,
  reason?: string
): Promise<ApiResponse<Transaction>> => {
  const transaction = mockTransactions.find((t) => t.id === transactionId);

  if (!transaction) {
    return {
      data: null,
      error: { code: 'NOT_FOUND', message: 'Transaction introuvable' },
      success: false,
    };
  }

  if (transaction.user_id !== userId) {
    return {
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Non autorisé' },
      success: false,
    };
  }

  if (['consumed', 'cancelled', 'expired'].includes(transaction.status)) {
    return {
      data: null,
      error: { code: 'INVALID_STATUS', message: 'Transaction non annulable' },
      success: false,
    };
  }

  transaction.status = 'cancelled';
  transaction.cancelled_at = new Date().toISOString();
  transaction.cancellation_reason = reason;
  transaction.updated_at = new Date().toISOString();

  await logAction(transactionId, userId, 'cancelled', { reason });

  return { data: transaction, error: null, success: true };
};

/**
 * Get user transactions
 */
export const getUserTransactions = async (
  userId: string,
  status?: TransactionStatus
): Promise<ApiResponse<Transaction[]>> => {
  let transactions = mockTransactions.filter((t) => t.user_id === userId);

  if (status) {
    transactions = transactions.filter((t) => t.status === status);
  }

  return { data: transactions, error: null, success: true };
};

/**
 * Get transaction by ID
 */
export const getTransaction = async (
  transactionId: string,
  userId: string
): Promise<ApiResponse<Transaction>> => {
  const transaction = mockTransactions.find((t) => t.id === transactionId);

  if (!transaction) {
    return {
      data: null,
      error: { code: 'NOT_FOUND', message: 'Transaction introuvable' },
      success: false,
    };
  }

  if (transaction.user_id !== userId) {
    return {
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Non autorisé' },
      success: false,
    };
  }

  return { data: transaction, error: null, success: true };
};

/**
 * Log transaction action for audit
 */
const logAction = async (
  transactionId: string,
  userId: string,
  action: TransactionAction,
  details?: Record<string, unknown>
): Promise<void> => {
  const log: TransactionAuditLog = {
    id: `log_${Date.now()}`,
    transaction_id: transactionId,
    user_id: userId,
    action,
    details,
    created_at: new Date().toISOString(),
  };

  console.log('Transaction audit log:', log);
};

/**
 * Get status text
 */
export const getTransactionStatusText = (status: TransactionStatus): string => {
  const texts: Record<TransactionStatus, string> = {
    reserved: 'Réservée',
    paid: 'Payée',
    consumed: 'Récupérée',
    cancelled: 'Annulée',
    expired: 'Expirée',
  };
  return texts[status];
};

/**
 * Get status color
 */
export const getTransactionStatusColor = (
  status: TransactionStatus
): string => {
  const colors: Record<TransactionStatus, string> = {
    reserved: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    paid: 'bg-green-500/10 text-green-600 border-green-500/20',
    consumed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
    expired: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };
  return colors[status];
};
