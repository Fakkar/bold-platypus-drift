import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, target_lang } = await req.json();

    if (!text || !target_lang) {
      return new Response(JSON.stringify({ error: "Missing 'text' or 'target_lang' in request body." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // The source language is always Persian (Farsi)
    const source_lang = 'fa';

    const params = new URLSearchParams({
      client: 'gtx',
      sl: source_lang,
      tl: target_lang,
      dt: 't',
      q: text,
    });

    const response = await fetch(`${GOOGLE_TRANSLATE_URL}?${params.toString()}`);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Google Translate API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    
    // The translated text is in the first element of the nested array
    const translatedText = data[0]?.[0]?.[0] || text;

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