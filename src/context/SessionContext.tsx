import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface Profile {
  id: string;
  role: 'admin' | 'editor';
  first_name?: string;
  last_name?: string;
}

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const fetchProfile = async (user: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      toast.error('Could not fetch user profile.');
      console.error('Profile fetch error:', error);
      setProfile(null);
    } else {
      setProfile(data);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      const currentUser = initialSession?.user;
      setUser(currentUser || null);
      if (currentUser) {
        await fetchProfile(currentUser);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        const currentUser = currentSession?.user;
        setUser(currentUser || null);

        if (currentUser) {
          await fetchProfile(currentUser);
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
      setProfile(null);
      navigate('/login');
    }
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