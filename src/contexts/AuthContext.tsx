import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isAuthenticated: boolean | null;
  isAdmin: boolean;
  userName: string;
  userId: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: null,
  isAdmin: false,
  userName: '',
  userId: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (sessionUserId: string) => {
    try {
      // Fetch both role and profile in parallel
      const [roleResult, profileResult] = await Promise.all([
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', sessionUserId)
          .eq('role', 'admin')
          .single(),
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', sessionUserId)
          .single()
      ]);

      setIsAdmin(!!roleResult.data);
      setUserName(profileResult.data?.full_name || '');
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          setIsAuthenticated(true);
          setUserId(session.user.id);
          setLoading(false); // Clear loading immediately
          
          // Fetch user data in background without blocking
          setTimeout(() => {
            if (mounted) fetchUserData(session.user.id);
          }, 0);
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUserName('');
          setUserId(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUserName('');
          setUserId(null);
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        setLoading(false); // Clear loading immediately
        
        // Fetch user data in background without blocking
        setTimeout(() => {
          if (mounted) fetchUserData(session.user.id);
        }, 0);
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUserName('');
        setUserId(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, userName, userId, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
