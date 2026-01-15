// ==========================================
// Auth Errors - Custom Error Classes
// ==========================================

import type { AuthError as SupabaseAuthError } from '@supabase/supabase-js';

/**
 * Base Auth Error
 */
export class AuthError extends Error {
    code: string;
    statusCode: number;
    details?: Record<string, unknown>;

    constructor(message: string, code: string, statusCode = 400, details?: Record<string, unknown>) {
        super(message);
        this.name = 'AuthError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AuthError);
        }
    }

    /**
     * Convert Supabase error to our custom error type
     */
    static fromSupabase(error: SupabaseAuthError): AuthError {
        const message = this.getReadableMessage(error.message);
        const code = error.name || 'AUTH_ERROR';

        return new AuthError(message, code, error.status || 400);
    }

    /**
     * Get user-friendly error message in French
     */
    private static getReadableMessage(message: string): string {
        const errorMap: Record<string, string> = {
            'Invalid login credentials': 'Email ou mot de passe incorrect',
            'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
            'User already registered': 'Un compte existe déjà avec cet email',
            'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 12 caractères',
            'Invalid email': 'Format d\'email invalide',
            'User not found': 'Utilisateur introuvable',
            'Token has expired': 'Le lien a expiré, veuillez en demander un nouveau',
            'Invalid token': 'Lien invalide ou déjà utilisé',
            'Too many requests': 'Trop de tentatives, veuillez réessayer plus tard',
        };

        // Check for exact match
        if (errorMap[message]) {
            return errorMap[message];
        }

        // Check for partial match
        for (const [key, value] of Object.entries(errorMap)) {
            if (message.includes(key)) {
                return value;
            }
        }

        // Default fallback
        return 'Une erreur est survenue lors de l\'authentification';
    }

    /**
     * Convert to JSON for API responses
     */
    toJSON() {
        return {
            error: {
                message: this.message,
                code: this.code,
                statusCode: this.statusCode,
                details: this.details,
            },
        };
    }
}

/**
 * Invalid Credentials Error
 */
export class InvalidCredentialsError extends AuthError {
    constructor(message = 'Email ou mot de passe incorrect') {
        super(message, 'INVALID_CREDENTIALS', 401);
        this.name = 'InvalidCredentialsError';
    }
}

/**
 * Email Not Verified Error
 */
export class EmailNotVerifiedError extends AuthError {
    constructor(message = 'Veuillez confirmer votre email avant de vous connecter') {
        super(message, 'EMAIL_NOT_VERIFIED', 403);
        this.name = 'EmailNotVerifiedError';
    }
}

/**
 * Account Locked Error (Rate Limiting)
 */
export class AccountLockedError extends AuthError {
    retryAfter: Date;

    constructor(retryAfter: Date, message = 'Compte temporairement verrouillé en raison de trop nombreuses tentatives') {
        super(message, 'ACCOUNT_LOCKED', 429);
        this.name = 'AccountLockedError';
        this.retryAfter = retryAfter;
        this.details = { retry_after: retryAfter.toISOString() };
    }
}

/**
 * MFA Required Error
 */
export class MFARequiredError extends AuthError {
    constructor(message = 'Authentification multi-facteurs requise') {
        super(message, 'MFA_REQUIRED', 428);
        this.name = 'MFARequiredError';
    }
}

/**
 * Invalid MFA Token Error
 */
export class InvalidMFATokenError extends AuthError {
    constructor(message = 'Code de vérification invalide') {
        super(message, 'INVALID_MFA_TOKEN', 401);
        this.name = 'InvalidMFATokenError';
    }
}

/**
 * Weak Password Error
 */
export class WeakPasswordError extends AuthError {
    requirements: string[];

    constructor(requirements: string[], message = 'Le mot de passe ne respecte pas les critères de sécurité') {
        super(message, 'WEAK_PASSWORD', 400);
        this.name = 'WeakPasswordError';
        this.requirements = requirements;
        this.details = { missing_requirements: requirements };
    }
}

/**
 * Session Expired Error
 */
export class SessionExpiredError extends AuthError {
    constructor(message = 'Votre session a expiré, veuillez vous reconnecter') {
        super(message, 'SESSION_EXPIRED', 401);
        this.name = 'SessionExpiredError';
    }
}

/**
 * Token Expired Error
 */
export class TokenExpiredError extends AuthError {
    constructor(message = 'Le lien a expiré, veuillez en demander un nouveau') {
        super(message, 'TOKEN_EXPIRED', 410);
        this.name = 'TokenExpiredError';
    }
}

/**
 * User Already Exists Error
 */
export class UserAlreadyExistsError extends AuthError {
    constructor(message = 'Un compte existe déjà avec cet email') {
        super(message, 'USER_ALREADY_EXISTS', 409);
        this.name = 'UserAlreadyExistsError';
    }
}

/**
 * Configuration Error
 */
export class AuthConfigurationError extends AuthError {
    constructor(message = 'Erreur de configuration de l\'authentification') {
        super(message, 'AUTH_CONFIGURATION_ERROR', 500);
        this.name = 'AuthConfigurationError';
    }
}

/**
 * Network Error
 */
export class AuthNetworkError extends AuthError {
    constructor(message = 'Erreur de connexion, vérifiez votre connexion internet') {
        super(message, 'AUTH_NETWORK_ERROR', 503);
        this.name = 'AuthNetworkError';
    }
}

/**
 * Type guard to check if error is AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
    if (isAuthError(error)) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'Une erreur inattendue est survenue';
}
