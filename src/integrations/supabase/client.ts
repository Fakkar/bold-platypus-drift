import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qzthgmioxohdqzfjxtch.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dGhnbWlveG9oZHF6Zmp4dGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjUxMTksImV4cCI6MjA3NTQ0MTExOX0.lgEChe-Q5H22tLI9ovr8XnVGvpQdJnT3JaDBp3XcFW4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);