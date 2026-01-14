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
  isVerifiedMerchant: boolean;
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
  const [isVerifiedMerchant, setIsVerifiedMerchant] = useState(false);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('=== INITIALISATION AUTH CONTEXT ===');

        if (!supabaseClient) {
          console.error('Client Supabase non disponible');
          if (mounted) setLoading(false);
          return;
        }

        const { data: { session: initialSession }, error } = await supabaseClient.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        }

        if (mounted && initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);

          // Fetch user profile from database
          const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('user_id', initialSession.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            const role = initialSession.user.user_metadata?.role ||
              initialSession.user.app_metadata?.role ||
              'user';
            setUserRole(role as UserRole);
          } else if (profile) {
            setUserRole(profile.role as UserRole);

            // If merchant, check verification status
            if (profile.role === 'merchant') {
              const { data: merchant } = await supabaseClient
                .from('merchants')
                .select('is_verified')
                .eq('user_id', initialSession.user.id)
                .maybeSingle();
              setIsVerifiedMerchant(!!merchant?.is_verified);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 5000);

    if (supabaseClient) {
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();

            if (profile) {
              setUserRole(profile.role as UserRole);
            } else {
              const role = session.user.user_metadata?.role ||
                session.user.app_metadata?.role ||
                'user';
              setUserRole(role as UserRole);
            }

            // Check merchant status
            const roleToCheck = profile?.role || session.user.user_metadata?.role;
            if (roleToCheck === 'merchant') {
              const { data: merchant } = await supabaseClient
                .from('merchants')
                .select('is_verified')
                .eq('user_id', session.user.id)
                .maybeSingle();
              setIsVerifiedMerchant(!!merchant?.is_verified);
            } else {
              setIsVerifiedMerchant(false);
            }
          } else {
            setUserRole(null);
            setIsVerifiedMerchant(false);
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
      setIsVerifiedMerchant(false);
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

        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('user_id', refreshedUser.id)
          .single();

        if (profile) {
          setUserRole(profile.role as UserRole);
        } else {
          const role = refreshedUser.user_metadata?.role ||
            refreshedUser.app_metadata?.role ||
            'user';
          setUserRole(role as UserRole);
        }

        // Refresh merchant status
        const roleToCheck = profile?.role || refreshedUser.user_metadata?.role;
        if (roleToCheck === 'merchant') {
          const { data: merchant } = await supabaseClient
            .from('merchants')
            .select('is_verified')
            .eq('user_id', refreshedUser.id)
            .maybeSingle();
          setIsVerifiedMerchant(!!merchant?.is_verified);
        } else {
          setIsVerifiedMerchant(false);
        }
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
    isVerifiedMerchant,
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