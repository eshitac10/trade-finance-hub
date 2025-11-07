import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateThumbnail(articleTitle: string): Promise<string | null> {
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not found');
      return null;
    }

    const prompt = `Create a professional, modern thumbnail image for a trade finance article titled "${articleTitle}". The image should be clean, corporate, and visually appealing with finance-related imagery like graphs, currency symbols, documents, or global trade elements. Use a professional color scheme with blues, greens, and gold accents.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    return imageUrl || null;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');
    if (!folderId) {
      throw new Error('Missing Google Drive folder ID');
    }

    // Get access token from database
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('google_oauth_tokens')
      .select('access_token, refresh_token, expiry_time')
      .eq('id', 'google_drive')
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ 
          error: 'Not authenticated', 
          needsAuth: true,
          message: 'Please authenticate with Google Drive first'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    let accessToken = tokenData.access_token;

    // Check if token is expired and refresh if needed
    const expiryTime = new Date(tokenData.expiry_time);
    if (expiryTime <= new Date()) {
      console.log('Token expired, refreshing...');
      
      const clientId = Deno.env.get('GOOGLE_DRIVE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_DRIVE_CLIENT_SECRET');

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          refresh_token: tokenData.refresh_token!,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();
      
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh token');
      }

      accessToken = refreshData.access_token;
      const newExpiryTime = new Date(Date.now() + refreshData.expires_in * 1000);

      await supabaseClient
        .from('google_oauth_tokens')
        .update({
          access_token: accessToken,
          expiry_time: newExpiryTime.toISOString(),
        })
        .eq('id', 'google_drive');
    }

    console.log('Fetching files from Google Drive folder:', folderId);

    // Use OAuth token to fetch files
    const driveUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType,webViewLink,thumbnailLink,createdTime,modifiedTime)`;
    
    const driveResponse = await fetch(driveUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!driveResponse.ok) {
      const errorText = await driveResponse.text();
      console.error('Google Drive API error:', errorText);
      throw new Error(`Failed to fetch from Google Drive: ${driveResponse.status}`);
    }

    const driveData = await driveResponse.json();
    console.log('Fetched files:', driveData.files?.length || 0);

    if (driveData.files && driveData.files.length > 0) {
      for (const file of driveData.files) {
        // Check if article already has AI thumbnail
        const { data: existingArticle } = await supabaseClient
          .from('google_drive_articles')
          .select('ai_thumbnail')
          .eq('file_id', file.id)
          .single();

        let aiThumbnail = existingArticle?.ai_thumbnail;

        // Generate AI thumbnail if it doesn't exist
        if (!aiThumbnail) {
          console.log('Generating thumbnail for:', file.name);
          aiThumbnail = await generateThumbnail(file.name);
        }

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
            ai_thumbnail: aiThumbnail,
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