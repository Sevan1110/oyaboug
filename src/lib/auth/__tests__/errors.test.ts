// ==========================================
// Error Tests - Custom Error Classes
// ==========================================

import { describe, it, expect } from 'vitest';
import {
    AuthError,
    InvalidCredentialsError,
    EmailNotVerifiedError,
    AccountLockedError,
    MFARequiredError,
    InvalidMFATokenError,
    WeakPasswordError,
    SessionExpiredError,
    TokenExpiredError,
    UserAlreadyExistsError,
    AuthConfigurationError,
    AuthNetworkError,
    isAuthError,
    getErrorMessage,
} from '../errors';

describe('AuthError', () => {
    it('should create error with message and code', () => {
        const error = new AuthError('Test error', 'TEST_CODE', 400);
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('TEST_CODE');
        expect(error.statusCode).toBe(400);
        expect(error.name).toBe('AuthError');
    });

    it('should include details if provided', () => {
        const details = { userId: '123', attempt: 3 };
        const error = new AuthError('Test', 'TEST', 400, details);
        expect(error.details).toEqual(details);
    });

    it('should convert to JSON correctly', () => {
        const error = new AuthError('Test error', 'TEST_CODE', 400);
        const json = error.toJSON();
        expect(json.error.message).toBe('Test error');
        expect(json.error.code).toBe('TEST_CODE');
        expect(json.error.statusCode).toBe(400);
    });

    it('should convert Supabase error with French message', () => {
        const supabaseError = {
            name: 'AuthApiError',
            message: 'Invalid login credentials',
            status: 401,
        } as any;

        const error = AuthError.fromSupabase(supabaseError);
        expect(error.message).toBe('Email ou mot de passe incorrect');
    });

    it('should handle unknown Supabase error gracefully', () => {
        const supabaseError = {
            name: 'UnknownError',
            message: 'Some unknown error',
            status: 500,
        } as any;

        const error = AuthError.fromSupabase(supabaseError);
        expect(error.message).toBe('Une erreur est survenue lors de l\'authentification');
    });
});

describe('InvalidCredentialsError', () => {
    it('should have correct defaults', () => {
        const error = new InvalidCredentialsError();
        expect(error.code).toBe('INVALID_CREDENTIALS');
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('incorrect');
    });

    it('should accept custom message', () => {
        const error = new InvalidCredentialsError('Custom message');
        expect(error.message).toBe('Custom message');
    });
});

describe('EmailNotVerifiedError', () => {
    it('should have correct defaults', () => {
        const error = new EmailNotVerifiedError();
        expect(error.code).toBe('EMAIL_NOT_VERIFIED');
        expect(error.statusCode).toBe(403);
        expect(error.message).toContain('confirmer votre email');
    });
});

describe('AccountLockedError', () => {
    it('should include retry_after in details', () => {
        const retryAfter = new Date(Date.now() + 15 * 60 * 1000);
        const error = new AccountLockedError(retryAfter);

        expect(error.code).toBe('ACCOUNT_LOCKED');
        expect(error.statusCode).toBe(429);
        expect(error.retryAfter).toEqual(retryAfter);
        expect(error.details?.retry_after).toBe(retryAfter.toISOString());
    });

    it('should have message about too many attempts', () => {
        const error = new AccountLockedError(new Date());
        expect(error.message).toContain('verrouillé');
    });
});

describe('MFARequiredError', () => {
    it('should have correct code and status', () => {
        const error = new MFARequiredError();
        expect(error.code).toBe('MFA_REQUIRED');
        expect(error.statusCode).toBe(428);
    });
});

describe('InvalidMFATokenError', () => {
    it('should have correct defaults', () => {
        const error = new InvalidMFATokenError();
        expect(error.code).toBe('INVALID_MFA_TOKEN');
        expect(error.message).toContain('invalide');
    });
});

describe('WeakPasswordError', () => {
    it('should include requirements in details', () => {
        const requirements = ['12+ caractères', 'Majuscule', 'Chiffre'];
        const error = new WeakPasswordError(requirements);

        expect(error.code).toBe('WEAK_PASSWORD');
        expect(error.requirements).toEqual(requirements);
        expect(error.details?.missing_requirements).toEqual(requirements);
    });

    it('should have message about security criteria', () => {
        const error = new WeakPasswordError([]);
        expect(error.message).toContain('sécurité');
    });
});

describe('SessionExpiredError', () => {
    it('should have correct defaults', () => {
        const error = new SessionExpiredError();
        expect(error.code).toBe('SESSION_EXPIRED');
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('expiré');
    });
});

describe('TokenExpiredError', () => {
    it('should have correct defaults', () => {
        const error = new TokenExpiredError();
        expect(error.code).toBe('TOKEN_EXPIRED');
        expect(error.statusCode).toBe(410);
    });
});

describe('UserAlreadyExistsError', () => {
    it('should have correct defaults', () => {
        const error = new UserAlreadyExistsError();
        expect(error.code).toBe('USER_ALREADY_EXISTS');
        expect(error.statusCode).toBe(409);
        expect(error.message).toContain('existe déjà');
    });
});

describe('AuthConfigurationError', () => {
    it('should have correct defaults', () => {
        const error = new AuthConfigurationError();
        expect(error.code).toBe('AUTH_CONFIGURATION_ERROR');
        expect(error.statusCode).toBe(500);
    });
});

describe('AuthNetworkError', () => {
    it('should have correct defaults', () => {
        const error = new AuthNetworkError();
        expect(error.code).toBe('AUTH_NETWORK_ERROR');
        expect(error.statusCode).toBe(503);
        expect(error.message).toContain('connexion');
    });
});

describe('isAuthError', () => {
    it('should return true for AuthError instances', () => {
        const error = new AuthError('Test', 'TEST');
        expect(isAuthError(error)).toBe(true);
    });

    it('should return true for AuthError subclasses', () => {
        expect(isAuthError(new InvalidCredentialsError())).toBe(true);
        expect(isAuthError(new EmailNotVerifiedError())).toBe(true);
        expect(isAuthError(new MFARequiredError())).toBe(true);
    });

    it('should return false for regular Error', () => {
        const error = new Error('Regular error');
        expect(isAuthError(error)).toBe(false);
    });

    it('should return false for non-error values', () => {
        expect(isAuthError('string')).toBe(false);
        expect(isAuthError(null)).toBe(false);
        expect(isAuthError(undefined)).toBe(false);
        expect(isAuthError({})).toBe(false);
    });
});

describe('getErrorMessage', () => {
    it('should extract message from AuthError', () => {
        const error = new AuthError('Test message', 'TEST');
        expect(getErrorMessage(error)).toBe('Test message');
    });

    it('should extract message from regular Error', () => {
        const error = new Error('Regular error message');
        expect(getErrorMessage(error)).toBe('Regular error message');
    });

    it('should return string as-is', () => {
        expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should return default message for unknown error types', () => {
        expect(getErrorMessage({})).toBe('Une erreur inattendue est survenue');
        expect(getErrorMessage(null)).toBe('Une erreur inattendue est survenue');
        expect(getErrorMessage(undefined)).toBe('Une erreur inattendue est survenue');
    });
});
