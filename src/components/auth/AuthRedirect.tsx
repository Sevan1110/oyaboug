"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Client component that handles automatic redirects based on user authentication and role
 * Placed in root layout to work across the app
 */
export function AuthRedirect() {
    const { isAuthenticated, userRole, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        console.log('🔄 [AuthRedirect] State:', {
            isAuthenticated,
            userRole,
            loading,
            pathname
        });

        // Redirect authenticated users from auth pages to their dashboards
        if (isAuthenticated && userRole && (pathname === '/auth' || pathname === '/forgot-password')) {
            const redirectMap: Record<string, string> = {
                'admin': '/admin',
                'merchant': '/merchant',
                'user': '/user',
            };
            const redirectPath = redirectMap[userRole];
            console.log('🚀 [AuthRedirect] Redirecting to:', redirectPath);
            if (redirectPath) {
                router.push(redirectPath);
            }
        }

        // Redirect unauthenticated users from protected pages
        const isProtectedRoute = pathname?.startsWith('/user') ||
            pathname?.startsWith('/merchant') ||
            pathname?.startsWith('/admin');

        if (!isAuthenticated && isProtectedRoute) {
            const role = pathname?.startsWith('/merchant') ? 'merchant' : undefined;
            const authUrl = role ? `/auth?role=${role}` : '/auth';
            console.log('🔒 [AuthRedirect] Redirecting to auth:', authUrl);
            router.push(authUrl);
        }
    }, [isAuthenticated, userRole, loading, pathname, router]);

    return null; // This component renders nothing
}
