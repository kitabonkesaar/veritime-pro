import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string, email: string) => {
    try {
      // Add a timeout to the profile fetch to prevent hanging
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      const timeoutPromise = new Promise<{ data: null, error: any }>((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );

      // @ts-ignore
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (data) {
        const userData: User = {
          id: data.id,
          name: data.full_name || email.split('@')[0],
          email: data.email || email,
          role: (data.role as UserRole) || 'employee',
          hourlyRate: data.hourly_rate,
          tripRate: data.trip_rate,
          avatarUrl: data.avatar_url,
          createdAt: new Date(data.created_at),
        };
        return userData;
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    // Safety timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timed out - forcing completion');
        setIsLoading(false);
      }
    }, 5000);

    const initAuth = async () => {
      try {
        // Check active session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          throw error;
        }

        if (session?.user && mounted) {
          const profile = await fetchProfile(session.user.id, session.user.email!);
          if (profile && mounted) {
            setUser(profile);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          toast({
            title: 'Authentication Error',
            description: 'Failed to initialize authentication session.',
            variant: 'destructive',
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          clearTimeout(loadingTimeout);
        }
      }
    };

    initAuth();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        // We still need to fetch profile if we don't have it or to update it
        const profile = await fetchProfile(session.user.id, session.user.email!);
        if (profile && mounted) {
          setUser(profile);
        }
      } else {
        if (mounted) {
          setUser(null);
        }
      }
      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    if (data.user) {
      // Explicitly fetch profile here to ensure state is ready before promise resolves
      const profile = await fetchProfile(data.user.id, data.user.email!);
      if (profile) {
        setUser(profile);
      } else {
        setIsLoading(false);
        throw new Error("Failed to load user profile. Please try again.");
      }
    }
    // The onAuthStateChange listener will also fire, but setting it here ensures immediate UI feedback
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
