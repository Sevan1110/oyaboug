// ============================================
// Auth Redirect Handler - Post-Authentication Redirect
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userRole, isAuthenticated, loading, isVerifiedMerchant } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // Ne rediriger que si on vient de l'authentification (returnTo param) ou si on est sur la page d'accueil
    const returnTo = searchParams.get('returnTo');
    const shouldRedirect = returnTo || location.pathname === '/' || location.pathname === '/auth';

    if (isAuthenticated && userRole && shouldRedirect) {
      if (returnTo) {
        navigate(returnTo, { replace: true });
        return;
      }

      // Default redirects based on role
      switch (userRole) {
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'merchant':
          if (isVerifiedMerchant) {
            navigate('/merchant', { replace: true });
          } else {
            // Not verified, send to success/pending page
            navigate('/merchant/register/success', { replace: true });
          }
          break;
        case 'user':
        default:
          navigate('/user', { replace: true });
          break;
      }
    }
  }, [isAuthenticated, userRole, loading, navigate, searchParams, location, isVerifiedMerchant]);

  return null;
};