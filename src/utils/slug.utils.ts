/**
 * Generates a URL-safe slug from a string.
 * Handles accents, special characters, and multiple spaces.
 * 
 * @param text The string to convert to a slug
 * @returns A sanitized, lowercase, hyphenated string
 */
export const generateSlug = (text: string): string => {
    return text
        .toString()
        .normalize('NFD')                   // Split accented characters into their base characters and diacritical marks
        .replace(/[\u0300-\u036f]/g, '')     // Remove diacritical marks
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')                // Replace spaces with -
        .replace(/[^\w-]+/g, '')             // Remove all non-word chars
        .replace(/--+/g, '-');               // Replace multiple - with single -
};

/**
 * Generates a slug with a short random suffix to ensure uniqueness.
 * 
 * @param text The string to convert to a slug
 * @returns A slug like "my-business-a1b2c3d4"
 */
export const generateUniqueSlug = (text: string): string => {
    const slug = generateSlug(text);
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${slug}-${suffix}`;
};
