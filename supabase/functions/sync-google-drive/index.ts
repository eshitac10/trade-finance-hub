import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const clientId = Deno.env.get('GOOGLE_DRIVE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_DRIVE_CLIENT_SECRET');
    const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');

    if (!clientId || !clientSecret || !folderId) {
      throw new Error('Missing Google Drive credentials');
    }

    console.log('Fetching files from Google Drive folder:', folderId);

    // Get access token using service account or OAuth2
    // For simplicity, we'll use the Drive API with the folder being publicly accessible
    const driveUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType,webViewLink,thumbnailLink,createdTime,modifiedTime)&key=${clientId}`;
    
    const driveResponse = await fetch(driveUrl);
    
    if (!driveResponse.ok) {
      const errorText = await driveResponse.text();
      console.error('Google Drive API error:', errorText);
      throw new Error(`Failed to fetch from Google Drive: ${driveResponse.status}`);
    }

    const driveData = await driveResponse.json();
    console.log('Fetched files:', driveData.files?.length || 0);

    if (driveData.files && driveData.files.length > 0) {
      // Upsert files into database
      for (const file of driveData.files) {
        const { error } = await supabaseClient
          .from('google_drive_articles')
          .upsert({
            file_id: file.id,
            name: file.name,
            mime_type: file.mimeType,
            web_view_link: file.webViewLink,
            thumbnail_link: file.thumbnailLink,
            created_time: file.createdTime,
            modified_time: file.modifiedTime,
            synced_at: new Date().toISOString(),
          }, {
            onConflict: 'file_id'
          });

        if (error) {
          console.error('Error upserting file:', file.name, error);
        }
      }
    }

    // Fetch all articles from database
    const { data: articles, error: fetchError } = await supabaseClient
      .from('google_drive_articles')
      .select('*')
      .order('modified_time', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    return new Response(
      JSON.stringify({ articles, synced: driveData.files?.length || 0 }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in sync-google-drive function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});