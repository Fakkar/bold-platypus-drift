import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleAuthError = (error: Error) => {
    console.error('Auth error:', error);
    toast.error(t('login_error', { message: error.message }));
  };

  React.useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          navigate('/admin'); // Redirect to admin dashboard on successful login/signup
          toast.success(t('login_success'));
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
          {t('admin_login')}
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light" // Can be dynamic based on app theme
          providers={[]} // No third-party providers for now
          redirectTo={window.location.origin + '/admin'} // Redirect after auth
          view="sign_in" // Only show sign-in form
          localization={{
            variables: {
              sign_in: {
                email_label: t('email_label'),
                password_label: t('password_label'),
                email_input_placeholder: t('email_input_placeholder'),
                password_input_placeholder: t('password_input_placeholder'),
                button_label: t('sign_in_button'),
                link_text: t('sign_in_link_text'),
              },
              // Removed sign_up localization to disable it
              forgotten_password: {
                email_label: t('email_label'),
                password_label: t('password_label'),
                email_input_placeholder: t('email_input_placeholder'),
                button_label: t('send_reset_instructions'),
                link_text: t('forgot_password_link_text'),
                confirmation_text: t('check_email_for_reset_link'),
              },
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

export default Login;