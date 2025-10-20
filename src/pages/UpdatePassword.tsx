import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const UpdatePassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'USER_UPDATED') {
          toast.success(t('password_updated_successfully'));
          navigate('/admin');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
          {t('update_password_button')}
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          view="update_password"
          localization={{
            variables: {
              update_password: {
                password_label: t('new_password_label'),
                password_input_placeholder: t('new_password_input_placeholder'),
                button_label: t('update_password_button'),
                confirmation_text: t('password_updated_successfully'),
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default UpdatePassword;