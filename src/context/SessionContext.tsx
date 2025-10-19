import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: { role: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        const currentUser = currentSession?.user || null;
        setUser(currentUser);

        if (currentUser) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        setLoading(false);

        if (event === 'SIGNED_OUT') {
          toast.info(t('logged_out_successfully'));
          if (location.pathname.startsWith('/admin')) {
            navigate('/login');
          }
        } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (location.pathname === '/login') {
            navigate('/admin');
          }
        }
      }
    );

    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      const currentUser = initialSession?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();
        setProfile(userProfile);
      }
      setLoading(false);
    };

    getInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location.pathname, t]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    navigate('/login');
  };

  return (
    <SessionContext.Provider value={{ session, user, profile, loading, signOut }}>
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