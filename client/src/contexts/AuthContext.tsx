import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  verified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check for mock user first (demo mode)
        const mockUser = localStorage.getItem('mockUser');
        if (mockUser) {
          try {
            const parsedUser = JSON.parse(mockUser);
            if (mounted) {
              console.log('🔄 Loading mock user from localStorage:', parsedUser.name);
              setUser(parsedUser);
              setLoading(false);
            }
            return;
          } catch (parseError) {
            console.warn('Invalid mock user data, clearing:', parseError);
            localStorage.removeItem('mockUser');
          }
        }

        // Only try Supabase if configured
        if (!isSupabaseConfigured) {
          console.log('🔄 Supabase not configured, using demo mode');
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('🔄 Checking Supabase session...');

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.warn('Auth session error:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('✅ Found Supabase session, fetching profile...');
          await fetchUserProfile(session.user.id);
        } else {
          console.log('ℹ️ No active Supabase session');
          setLoading(false);
        }
      } catch (error) {
        console.warn('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for mock login events
    const handleMockLogin = (event: CustomEvent) => {
      if (mounted) {
        console.log('🔄 Mock login event received:', event.detail.name);
        setUser(event.detail);
        setLoading(false);
      }
    };

    window.addEventListener('mockLogin', handleMockLogin as EventListener);

    // Listen for auth changes (only if Supabase is configured)
    let subscription: any = null;
    if (isSupabaseConfigured) {
      try {
        const { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            console.log('🔄 Supabase auth state change:', event);

            try {
              if (session?.user) {
                await fetchUserProfile(session.user.id);
              } else {
                // Only clear user if it's not a mock user
                const currentUser = localStorage.getItem('mockUser');
                if (!currentUser) {
                  setUser(null);
                }
                setLoading(false);
              }
            } catch (error) {
              console.warn('Auth state change error:', error);
              setLoading(false);
            }
          }
        );
        subscription = data.subscription;
      } catch (error) {
        console.warn('Failed to set up auth listener:', error);
      }
    }

    return () => {
      mounted = false;
      window.removeEventListener('mockLogin', handleMockLogin as EventListener);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;

    try {
      console.log('🔄 Fetching user profile for:', userId);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Error fetching user profile:', error);
        // If profile doesn't exist, create a basic user object
        try {
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser.user) {
            const basicUser = {
              id: authUser.user.id,
              email: authUser.user.email || '',
              name: authUser.user.user_metadata?.full_name || 'İsimsiz Kullanıcı',
              username: authUser.user.user_metadata?.username || 'kullanici',
              verified: false,
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            console.log('✅ Created basic user profile:', basicUser.name);
            setUser(basicUser);
          }
        } catch (authError) {
          console.warn('Failed to get auth user:', authError);
        }
      } else {
        console.log('✅ User profile loaded:', data.name);
        setUser(data);
      }
    } catch (error) {
      console.warn('Profile fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: { message: 'Supabase not configured. Use demo login buttons.' } };
    }

    try {
      setLoading(true);
      console.log('🔄 Signing up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      
      console.log('✅ User signed up successfully');
      return { data, error: null };
    } catch (error: any) {
      console.warn('Sign up error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: { message: 'Supabase not configured. Use demo login buttons.' } };
    }

    try {
      setLoading(true);
      console.log('🔄 Signing in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log('✅ User signed in successfully');
      return { data, error: null };
    } catch (error: any) {
      console.warn('Sign in error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🔄 Signing out user...');
    
    // Clear mock user
    localStorage.removeItem('mockUser');
    setUser(null);

    // Sign out from Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
        console.log('✅ Signed out from Supabase');
      } catch (error) {
        console.warn('Supabase signout error:', error);
      }
    }
    
    console.log('✅ User signed out successfully');
  };

  const updateUser = (userData: any) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      
      // Update localStorage if it's a mock user
      if (prev.id.startsWith('demo-')) {
        localStorage.setItem('mockUser', JSON.stringify(updated));
      }
      
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      updateUser
    }}>
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