import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_DRIVE_FOLDER_ID = "14Ii-JQoy5k8NPSvLRowCjaOEBpcp6UWP";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'Missing GOOGLE_API_KEY secret in function environment' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Fetch files from Google Drive public folder
    const url =
      `https://www.googleapis.com/drive/v3/files` +
      `?q='${GOOGLE_DRIVE_FOLDER_ID}'+in+parents` +
      `&fields=files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink,iconLink,createdTime,modifiedTime)` +
      `&key=${apiKey}`;

    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

    if (!response.ok) {
      const text = await response.text();
      console.error('Google Drive API error:', response.status, text);
      throw new Error(`Google Drive API error: ${response.status} ${text}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Error fetching from Google Drive:', error?.message || error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
