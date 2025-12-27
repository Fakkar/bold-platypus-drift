import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'editor' | 'viewer'; // Define possible roles
}

interface SessionContextType {
  session: Session | null;
  user: (User & { profile?: UserProfile }) | null; // Extend User type with profile
  loading: boolean;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<(User & { profile?: UserProfile }) | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data as UserProfile;
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          const profile = await fetchUserProfile(currentSession.user.id);
          setUser({ ...currentSession.user, profile });
        } else {
          setUser(null);
        }
        setLoading(false);

        if (event === 'PASSWORD_RECOVERY') {
          navigate('/update-password');
        } else if (event === 'SIGNED_OUT') {
          toast.info(t('logged_out_successfully'));
          if (location.pathname.startsWith('/admin')) {
            navigate('/login');
          }
        } else if (event === 'SIGNED_IN') {
          if (location.pathname === '/login') {
            navigate('/admin');
          }
        }
      }
    );

    // Initial session check
    const getSession = async () => {
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting initial session:', error);
        toast.error(t('session_error', { message: error.message }));
      }
      setSession(initialSession);
      if (initialSession?.user) {
        const profile = await fetchUserProfile(initialSession.user.id);
        setUser({ ...initialSession.user, profile });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    getSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location.pathname, t]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      toast.error(t('logout_error', { message: error.message }));
    } else {
      setSession(null);
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <SessionContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};