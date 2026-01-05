// ============================================
// Protected Route - Route Protection Component
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

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

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    // Redirect to auth page with return url
    return <Navigate to={`${fallbackPath}?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Check role requirements
  if (requiredRole && isAuthenticated) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!userRole || !roles.includes(userRole)) {
      // User doesn't have required role
      const rolePath = userRole === 'admin' ? '/admin' :
                      userRole === 'merchant' ? '/merchant' :
                      '/user';

      return <Navigate to={rolePath} replace />;
    }
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
  <ProtectedRoute requiredRole="user" fallbackPath="/auth">
    {children}
  </ProtectedRoute>
);

export const PublicRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAuth={false}>
    {children}
  </ProtectedRoute>
);