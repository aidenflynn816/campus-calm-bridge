
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Clean up auth state utility
export const cleanupAuthState = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// Define types for our context
interface User {
  id: string;
  email: string;
  role: 'student' | 'counselor';
  full_name?: string;
  name?: string; // Backward compatibility
  avatar_url?: string;
  profile_image?: string; // Backward compatibility
  emergency_contact?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'student' | 'counselor', fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile from the profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        
        if (session?.user && event === 'SIGNED_IN') {
          console.log('User signed in, fetching profile and redirecting...');
          // Fetch profile and set user, then redirect
          const profile = await fetchUserProfile(session.user.id);
          console.log('Profile fetched:', profile);
          
          let newUser: User;
          if (profile) {
            newUser = {
              id: session.user.id,
              email: session.user.email!,
              role: profile.role as 'student' | 'counselor',
              full_name: profile.full_name,
              name: profile.full_name, // Backward compatibility
              avatar_url: profile.avatar_url,
              profile_image: profile.avatar_url, // Backward compatibility
            };
          } else {
            // Handle case where profile doesn't exist
            newUser = {
              id: session.user.id,
              email: session.user.email!,
              role: 'student' as const, // Default role
              name: session.user.email, // Fallback name
            };
          }
          
          console.log('Setting user and redirecting:', newUser);
          setUser(newUser);
          
          // Redirect to appropriate dashboard
          const redirectPath = newUser.role === 'student' ? '/student' : '/counselor';
          console.log('Redirecting to:', redirectPath);
          navigate(redirectPath);
        } else if (session?.user) {
          // Handle other auth events (like initial session)
          console.log('Setting user from session...');
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            console.log('Profile fetched:', profile);
            if (profile) {
              const newUser = {
                id: session.user.id,
                email: session.user.email!,
                role: profile.role as 'student' | 'counselor',
                full_name: profile.full_name,
                name: profile.full_name, // Backward compatibility
                avatar_url: profile.avatar_url,
                profile_image: profile.avatar_url, // Backward compatibility
              };
              console.log('Setting user:', newUser);
              setUser(newUser);
            } else {
              // Handle case where profile doesn't exist
              const fallbackUser = {
                id: session.user.id,
                email: session.user.email!,
                role: 'student' as const, // Default role
                name: session.user.email, // Fallback name
              };
              console.log('Setting fallback user:', fallbackUser);
              setUser(fallbackUser);
            }
          }, 0);
        } else {
          console.log('No session, clearing user');
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // This will trigger the onAuthStateChange listener above
      setSession(session);
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and confirm your account');
        } else {
          throw new Error(error.message);
        }
      }

      if (data.user) {
        toast.success('Signed in successfully');
        // The redirect will be handled by the onAuthStateChange listener
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, role: 'student' | 'counselor', fullName: string) => {
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists');
        } else {
          throw new Error(error.message);
        }
      }

      if (data.user) {
        // Profile will be created automatically by the database trigger
        // If user is immediately confirmed (email confirmation disabled)
        if (data.session) {
          navigate(role === 'student' ? '/student' : '/counselor');
          toast.success('Account created successfully');
        } else {
          // User needs to confirm email
          toast.success('Account created! Please check your email to confirm your account.');
          navigate('/login');
        }
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      // Force page reload for clean state
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
