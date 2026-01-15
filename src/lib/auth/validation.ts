// ==========================================
// Auth Validation - Password & Email Validation
// ==========================================

import { z } from 'zod';
import type { PasswordStrength } from './types';

/**
 * Password validation schema with strict requirements
 */
export const passwordSchema = z
    .string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^a-zA-Z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)');

/**
 * Email validation schema
 */
export const emailSchema = z
    .string()
    .email('Format d\'email invalide')
    .min(5, 'Email trop court')
    .max(255, 'Email trop long');

/**
 * Sign up validation schema
 */
export const signUpSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
    phone: z.string().regex(/^\+?\d{8,15}$/, 'Format de téléphone invalide').optional(),
    role: z.enum(['user', 'merchant', 'admin']).optional(),
    business_name: z.string().min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères').optional(),
});

/**
 * Sign in validation schema
 */
export const signInSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Le mot de passe est requis'),
    mfa_token: z.string().length(6, 'Le code doit contenir 6 chiffres').optional(),
    remember_me: z.boolean().optional(),
});

/**
 * Password change validation schema
 */
export const passwordChangeSchema = z.object({
    current_password: z.string().min(1, 'Le mot de passe actuel est requis'),
    new_password: passwordSchema,
    confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
});

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
    email: emailSchema,
});

/**
 * Password reset confirm schema
 */
export const passwordResetConfirmSchema = z.object({
    token: z.string().min(1, 'Token requis'),
    new_password: passwordSchema,
    confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
});

/**
 * Calculate password strength with detailed feedback
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
    let score = 0;
    const feedback: string[] = [];

    // Length check (25 points)
    if (password.length >= 12) {
        score += 25;
    } else if (password.length >= 8) {
        score += 15;
        feedback.push('Augmenter à 12+ caractères');
    } else {
        feedback.push('Minimum 12 caractères requis');
    }

    // Uppercase check (20 points)
    if (/[A-Z]/.test(password)) {
        score += 20;
    } else {
        feedback.push('Ajouter des majuscules');
    }

    // Lowercase check (20 points)
    if (/[a-z]/.test(password)) {
        score += 20;
    } else {
        feedback.push('Ajouter des minuscules');
    }

    // Number check (20 points)
    if (/[0-9]/.test(password)) {
        score += 20;
    } else {
        feedback.push('Ajouter des chiffres');
    }

    // Special char check (15 points)
    if (/[^a-zA-Z0-9]/.test(password)) {
        score += 15;
    } else {
        feedback.push('Ajouter des caractères spéciaux');
    }

    // Bonus for length > 15 (additional security)
    if (password.length >= 15) {
        score = Math.min(100, score + 10);
    }

    // Penalty for common patterns
    if (/(.)\1{2,}/.test(password)) {
        score = Math.max(0, score - 10);
        feedback.push('Éviter les caractères répétés');
    }

    if (/^[0-9]+$/.test(password) || /^[a-zA-Z]+$/.test(password)) {
        score = Math.max(0, score - 15);
    }

    // Determine strength label
    let strength_label: PasswordStrength['strength_label'];
    let estimated_crack_time: string;

    if (score >= 90) {
        strength_label = 'very_strong';
        estimated_crack_time = 'Plusieurs siècles';
    } else if (score >= 70) {
        strength_label = 'strong';
        estimated_crack_time = 'Plusieurs années';
    } else if (score >= 50) {
        strength_label = 'good';
        estimated_crack_time = 'Plusieurs mois';
    } else if (score >= 30) {
        strength_label = 'fair';
        estimated_crack_time = 'Quelques jours';
    } else {
        strength_label = 'weak';
        estimated_crack_time = 'Quelques heures';
    }

    const is_valid = score === 100 && feedback.length === 0;

    return {
        score,
        is_valid,
        feedback,
        strength_label,
        estimated_crack_time,
    };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    try {
        emailSchema.parse(email);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate password meets all requirements
 */
export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
    try {
        passwordSchema.parse(password);
        return { valid: true, errors: [] };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                valid: false,
                errors: error.errors.map((e) => e.message),
            };
        }
        return { valid: false, errors: ['Erreur de validation'] };
    }
}

/**
 * Common weak passwords (to block)
 */
const COMMON_WEAK_PASSWORDS = [
    'password123',
    'Password123!',
    'Admin123!',
    '123456789012',
    'qwerty123456',
    'azerty123456',
    'Welcome123!',
    'Password1!',
];

/**
 * Check if password is in common weak passwords list
 */
export function isCommonWeakPassword(password: string): boolean {
    return COMMON_WEAK_PASSWORDS.some(
        (weak) => weak.toLowerCase() === password.toLowerCase()
    );
}

/**
 * Comprehensive password validation with all checks
 */
export function validatePassword(password: string): {
    valid: boolean;
    strength: PasswordStrength;
    errors: string[];
} {
    const { valid, errors } = isValidPassword(password);
    const strength = calculatePasswordStrength(password);

    const allErrors = [...errors];

    if (isCommonWeakPassword(password)) {
        allErrors.push('Ce mot de passe est trop commun');
    }

    return {
        valid: valid && !isCommonWeakPassword(password),
        strength,
        errors: allErrors,
    };
}
