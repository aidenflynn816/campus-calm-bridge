
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Define types for our context
interface User {
  id: string;
  email: string;
  role: 'student' | 'counselor';
  name?: string;
  profile_image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'student' | 'counselor', name: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUser = async () => {
      try {
        // In a real implementation, we would call Supabase to get the current session
        // For now, we'll just check localStorage for demo purposes
        const storedUser = localStorage.getItem('bridge_user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking authentication state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, we would call Supabase auth.signIn here
      // For now, we'll just simulate it for the demo
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data based on email (just for demonstration)
      const isStudent = email.includes('student');
      
      const user: User = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        email,
        role: isStudent ? 'student' : 'counselor',
        name: isStudent ? 'Alex Student' : 'Dr. Jamie Counselor',
      };
      
      // Store the user in localStorage (in real app, Supabase would manage the session)
      localStorage.setItem('bridge_user', JSON.stringify(user));
      setUser(user);
      
      // Navigate to the appropriate dashboard
      navigate(isStudent ? '/student' : '/counselor');
      toast.success('Signed in successfully');
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, role: 'student' | 'counselor', name: string) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, we would call Supabase auth.signUp here
      // For now, we'll just simulate it for the demo
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        email,
        role,
        name,
      };
      
      // Store the user in localStorage (in real app, Supabase would handle this)
      localStorage.setItem('bridge_user', JSON.stringify(user));
      setUser(user);
      
      // Navigate to the appropriate dashboard
      navigate(role === 'student' ? '/student' : '/counselor');
      toast.success('Account created successfully');
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
      // In a real implementation, we would call Supabase auth.signOut here
      
      // Clear stored user data
      localStorage.removeItem('bridge_user');
      setUser(null);
      
      // Navigate to login page
      navigate('/login');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
