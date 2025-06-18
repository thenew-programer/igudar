'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getSession, ensureUserProfile } from '@/lib/auth';
import { Language, getTranslation } from '@/lib/translations';
import { User as DatabaseUser } from '@/types/database';

interface AuthContextType {
  user: User | null;
  userProfile: DatabaseUser | null;
  loading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: ReturnType<typeof getTranslation>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<DatabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('en');

  // Get translations based on current language
  const t = getTranslation(language);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { session } = await getSession();
        const authUser = session?.user || null;
        setUser(authUser);

        if (authUser) {
          // Ensure user profile exists in public.users table
          const profile = await ensureUserProfile(authUser);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const authUser = session?.user || null;
        setUser(authUser);

        if (authUser) {
          // Ensure user profile exists in public.users table
          const profile = await ensureUserProfile(authUser);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }

        setLoading(false);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in:', session?.user?.email);
            break;
          case 'SIGNED_OUT':
            console.log('User signed out');
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed');
            break;
          case 'USER_UPDATED':
            console.log('User updated');
            break;
        }
      }
    );

    // Load saved language preference
    const savedLanguage = localStorage.getItem('igudar-language') as Language;
    if (savedLanguage && ['en', 'ar', 'fr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update language and save preference
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('igudar-language', lang);
  };

  // Sign out function
  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }else {
        window.location.href = '/auth/login'
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    language,
    setLanguage: handleSetLanguage,
    t,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};