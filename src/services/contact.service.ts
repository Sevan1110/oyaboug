
// ============================================
// Contact Service - Help Business Logic
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { sendContactMessage } from '@/api/contact.api';
import type { ApiResponse } from '@/types';

/**
 * Send a message to support
 */
export const contactSupport = async (
    userId: string,
    subject: string,
    message: string
): Promise<ApiResponse<null>> => {
    if (!subject.trim() || !message.trim()) {
        return {
            success: false,
            data: null,
            error: { code: 'VALIDATION_ERROR', message: 'Le sujet et le message sont requis.' }
        };
    }

    return sendContactMessage({
        user_id: userId,
        subject,
        message,
    });
};
