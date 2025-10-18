import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// IMPORTANT: You need to set your translation API key as a secret in your Supabase project.
// Go to Project Settings > Edge Functions > Add New Secret
// Name the secret 'DEEPL_API_KEY' and paste your key.
const DEEPL_API_KEY = Deno.env.get("DEEPL_API_KEY");
const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (!DEEPL_API_KEY) {
    return new Response(JSON.stringify({ error: "Translator API key is not configured." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    const { text, target_lang } = await req.json();

    if (!text || !target_lang) {
      return new Response(JSON.stringify({ error: "Missing 'text' or 'target_lang' in request body." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        target_lang: target_lang.toUpperCase(),
        source_lang: 'FA',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`DeepL API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const translatedText = data.translations[0].text;

    return new Response(JSON.stringify({ translatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Translation function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})