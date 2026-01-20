// ============================================
// Auth Components Index
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

export { AuthProvider, useAuth } from '@/contexts/AuthContext';
export { ProtectedRoute, AdminRoute, MerchantRoute, UserRoute, PublicRoute } from './ProtectedRoute';
export { AuthRedirectHandler } from './AuthRedirectHandler';
export { UserMenu } from './UserMenu';