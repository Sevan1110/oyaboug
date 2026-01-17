// ============================================
// Protected Route - Route Protection Component
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  requireAuth?: boolean;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireAuth = true,
  fallbackPath = '/auth'
}) => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      router.push(`${fallbackPath}?returnTo=${encodeURIComponent(pathname || '/')}`);
      return;
    }

    // Check role requirements
    if (requiredRole && isAuthenticated) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

      if (!userRole || !roles.includes(userRole)) {
        // User doesn't have required role
        const rolePath = userRole === 'admin' ? '/admin' :
          userRole === 'merchant' ? '/merchant' :
            '/user';

        router.push(rolePath);
      }
    }
  }, [loading, isAuthenticated, userRole, requireAuth, requiredRole, fallbackPath, pathname, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and auth is required, don't render children (effect will redirect)
  if (requireAuth && !isAuthenticated) return null;

  // If authenticated but wrong role, don't render children (effect will redirect)
  if (requiredRole && isAuthenticated) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!userRole || !roles.includes(userRole)) return null;
  }

  return <>{children}</>;
};

// Convenience components for specific roles
export const AdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="admin" fallbackPath="/auth">
    {children}
  </ProtectedRoute>
);

export const MerchantRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="merchant" fallbackPath="/auth">
    {children}
  </ProtectedRoute>
);

export const UserRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={['user', 'admin', 'merchant']} fallbackPath="/auth">
    {children}
  </ProtectedRoute>
);

export const PublicRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAuth={false}>
    {children}
  </ProtectedRoute>
);