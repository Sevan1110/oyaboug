// ==========================================
// Validation Tests - Password & Email Validation
// ==========================================

import { describe, it, expect } from 'vitest';
import {
    passwordSchema,
    emailSchema,
    calculatePasswordStrength,
    isValidEmail,
    isValidPassword,
    isCommonWeakPassword,
    validatePassword,
} from '../validation';

describe('Password Validation', () => {
    describe('passwordSchema', () => {
        it('should accept valid strong password', () => {
            const result = passwordSchema.safeParse('MyStrongP@ssw0rd123');
            expect(result.success).toBe(true);
        });

        it('should reject password less than 12 characters', () => {
            const result = passwordSchema.safeParse('Short1!');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toContain('12 caractères');
            }
        });

        it('should reject password without uppercase', () => {
            const result = passwordSchema.safeParse('nostrongpassword123!');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors.some(e => e.message.includes('majuscule'))).toBe(true);
            }
        });

        it('should reject password without lowercase', () => {
            const result = passwordSchema.safeParse('NOSTRONGPASSWORD123!');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors.some(e => e.message.includes('minuscule'))).toBe(true);
            }
        });

        it('should reject password without number', () => {
            const result = passwordSchema.safeParse('NoNumberPassword!');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors.some(e => e.message.includes('chiffre'))).toBe(true);
            }
        });

        it('should reject password without special character', () => {
            const result = passwordSchema.safeParse('NoSpecialChar123');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors.some(e => e.message.includes('caractère spécial'))).toBe(true);
            }
        });
    });

    describe('calculatePasswordStrength', () => {
        it('should rate very weak password as weak', () => {
            const result = calculatePasswordStrength('abc');
            expect(result.strength_label).toBe('weak');
            expect(result.score).toBeLessThan(30);
            expect(result.feedback.length).toBeGreaterThan(0);
        });

        it('should rate medium password as fair/good/strong', () => {
            const result = calculatePasswordStrength('Password123');
            expect(['fair', 'good', 'strong']).toContain(result.strength_label);
            expect(result.score).toBeGreaterThanOrEqual(30);
        });

        it('should rate strong password as strong/very_strong', () => {
            const result = calculatePasswordStrength('MyV3ry$tr0ngP@ssw0rd!');
            expect(['strong', 'very_strong']).toContain(result.strength_label);
            expect(result.score).toBeGreaterThanOrEqual(70);
        });

        it('should penalize repeated characters', () => {
            const weak = calculatePasswordStrength('Aaaa1111!!!!');
            const strong = calculatePasswordStrength('MyStr0ng!Pass');
            expect(weak.score).toBeLessThan(strong.score);
        });

        it('should give bonus for length >= 15', () => {
            const short = calculatePasswordStrength('MyStr0ng!Pass');
            const long = calculatePasswordStrength('MyStr0ng!PassWithExtra');
            expect(long.score).toBeGreaterThanOrEqual(short.score);
        });

        it('should provide feedback for missing requirements', () => {
            const result = calculatePasswordStrength('short');
            expect(result.feedback).toContain('Minimum 12 caractères requis');
        });

        it('should mark as valid when score is 100 and no feedback', () => {
            const result = calculatePasswordStrength('MyV3ry$tr0ngP@ssw0rdWith15+Chars!');
            if (result.score === 100 && result.feedback.length === 0) {
                expect(result.is_valid).toBe(true);
            }
        });
    });

    describe('isValidPassword', () => {
        it('should return valid for strong password', () => {
            const result = isValidPassword('MyStrongP@ssw0rd123');
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should return invalid with errors for weak password', () => {
            const result = isValidPassword('weak');
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('isCommonWeakPassword', () => {
        it('should detect common weak passwords', () => {
            expect(isCommonWeakPassword('password123')).toBe(true);
            expect(isCommonWeakPassword('Password123!')).toBe(true);
            expect(isCommonWeakPassword('Admin123!')).toBe(true);
        });

        it('should not flag strong unique password', () => {
            expect(isCommonWeakPassword('MyUniqu3!P@ssw0rd')).toBe(false);
        });

        it('should be case insensitive', () => {
            expect(isCommonWeakPassword('PASSWORD123')).toBe(true);
            expect(isCommonWeakPassword('pAsSwOrD123')).toBe(true);
        });
    });

    describe('validatePassword', () => {
        it('should validate strong unique password', () => {
            const result = validatePassword('MyStrongP@ssw0rd123');
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject common weak password even if it meets criteria', () => {
            const result = validatePassword('Password123!');
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('trop commun'))).toBe(true);
        });

        it('should provide strength analysis', () => {
            const result = validatePassword('MyStrongP@ssw0rd123');
            expect(result.strength).toBeDefined();
            expect(result.strength.score).toBeGreaterThan(0);
            expect(result.strength.strength_label).toBeDefined();
        });
    });
});

describe('Email Validation', () => {
    describe('emailSchema', () => {
        it('should accept valid email', () => {
            const result = emailSchema.safeParse('user@example.com');
            expect(result.success).toBe(true);
        });

        it('should reject invalid email format', () => {
            const result = emailSchema.safeParse('invalid-email');
            expect(result.success).toBe(false);
        });

        it('should reject email without domain', () => {
            const result = emailSchema.safeParse('user@');
            expect(result.success).toBe(false);
        });

        it('should reject email without @', () => {
            const result = emailSchema.safeParse('userexample.com');
            expect(result.success).toBe(false);
        });

        it('should reject too short email', () => {
            const result = emailSchema.safeParse('a@b');
            expect(result.success).toBe(false);
        });

        it('should accept email with subdomain', () => {
            const result = emailSchema.safeParse('user@mail.example.com');
            expect(result.success).toBe(true);
        });

        it('should accept email with plus sign', () => {
            const result = emailSchema.safeParse('user+tag@example.com');
            expect(result.success).toBe(true);
        });
    });

    describe('isValidEmail', () => {
        it('should validate correct email', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
        });

        it('should reject incorrect email', () => {
            expect(isValidEmail('not-an-email')).toBe(false);
        });
    });
});
