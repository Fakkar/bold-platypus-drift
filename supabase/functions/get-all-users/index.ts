import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user's profile to check if they are an admin
    const { data: userProfile, error: userError } = await supabaseClient
      .from('profiles')
      .select('role')
      .single();

    if (userError || !userProfile || userProfile.role !== 'admin') {
      throw new Error('Forbidden: You must be an admin to perform this action.');
    }

    // If the user is an admin, create a service role client to fetch all users
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        role,
        user:auth_users(email)
      `);

    if (usersError) throw usersError;

    // Re-shape the data to be more convenient for the client
    const formattedUsers = users.map(u => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role,
      email: u.user.email,
    }));

    return new Response(JSON.stringify(formattedUsers), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})