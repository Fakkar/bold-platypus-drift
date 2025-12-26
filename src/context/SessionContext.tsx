import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session, User } from '@supabase/supabase-js';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
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

    const getSession = async () => {
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting initial session:', error);
        toast.error(t('session_error', { message: error.message }));
      }
      setSession(initialSession);
      setUser(initialSession?.user || null);
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