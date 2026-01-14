// ============================================
// Auth Context - Global Authentication State Management
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabaseClient } from '@/api/supabaseClient';
import { getCurrentUser, onAuthStateChange } from '@/api/auth.api';
import type { UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  isMerchant: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };
export type { AuthContextType };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('=== INITIALISATION AUTH CONTEXT ===');

        // Vérifier si le client Supabase est disponible
        if (!supabaseClient) {
          console.error('Client Supabase non disponible');
          if (mounted) setLoading(false);
          return;
        }

        console.log('Client Supabase disponible, tentative de récupération de session...');

        // Get initial session
        const { data: { session: initialSession }, error } = await supabaseClient.auth.getSession();

        console.log('Session initiale:', { session: !!initialSession, error });

        if (error) {
          console.error('Error getting session:', error);
        }

        if (mounted && initialSession) {
          console.log('Session trouvée, mise à jour du state...');
          setSession(initialSession);
          setUser(initialSession.user);

          // Get user role from user metadata or database
          const role = initialSession.user.user_metadata?.role ||
            initialSession.user.app_metadata?.role ||
            'user';
          setUserRole(role as UserRole);
          console.log('Rôle utilisateur:', role);
        } else {
          console.log('Aucune session trouvée');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          console.log('Initialisation terminée, loading = false');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timeout, forcing loading to false');
        setLoading(false);
      }
    }, 5000); // Réduit à 5 secondes

    // Listen for auth state changes
    if (supabaseClient) {
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
        async (event, session) => {
          console.log('=== AUTH STATE CHANGE ===');
          console.log('Event:', event);
          console.log('Session:', !!session);

          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            // Update user role
            const role = session.user.user_metadata?.role ||
              session.user.app_metadata?.role ||
              'user';
            setUserRole(role as UserRole);
            console.log('Nouveau rôle:', role);
          } else {
            setUserRole(null);
          }

          setLoading(false);
        }
      );

      return () => {
        mounted = false;
        clearTimeout(safetyTimeout);
        subscription?.unsubscribe();
      };
    }

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
    };
  }, []);

  const signOut = async () => {
    try {
      await supabaseClient?.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user: refreshedUser } } = await supabaseClient?.auth.getUser() || { data: {} };
      if (refreshedUser) {
        setUser(refreshedUser);
        const role = refreshedUser.user_metadata?.role ||
          refreshedUser.app_metadata?.role ||
          'user';
        setUserRole(role as UserRole);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    refreshUser,
    isAuthenticated: !!user,
    userRole,
    isAdmin: userRole === 'admin',
    isMerchant: userRole === 'merchant',
    isUser: userRole === 'user',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};