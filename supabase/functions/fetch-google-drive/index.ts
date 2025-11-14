import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // Get folder ID or file ID from request body
    const body = await req.json().catch(() => ({}));
    const folderId = body.folderId || "14Ii-JQoy5k8NPSvLRowCjaOEBpcp6UWP";
    const fileId = body.fileId;

    // If fileId is provided, fetch single file metadata
    if (fileId) {
      const fileUrl =
        `https://www.googleapis.com/drive/v3/files/${fileId}` +
        `?fields=id,name,mimeType,thumbnailLink,webContentLink,webViewLink,iconLink,createdTime,modifiedTime` +
        `&key=${apiKey}`;
      
      const response = await fetch(fileUrl, { headers: { 'Accept': 'application/json' } });

      if (!response.ok) {
        const text = await response.text();
        console.error('Google Drive API error:', response.status, text);
        throw new Error(`Google Drive API error: ${response.status} ${text}`);
      }

      const fileData = await response.json();
      
      return new Response(JSON.stringify({ file: fileData }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Fetch all items from Google Drive folder (including subfolders)
    const url =
      `https://www.googleapis.com/drive/v3/files` +
      `?q='${folderId}'+in+parents` +
      `&fields=files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink,iconLink,createdTime,modifiedTime)` +
      `&key=${apiKey}`;

    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

    if (!response.ok) {
      const text = await response.text();
      console.error('Google Drive API error:', response.status, text);
      throw new Error(`Google Drive API error: ${response.status} ${text}`);
    }

    const data = await response.json();
    
    // For folders, fetch their first image as cover
    const itemsWithCovers = await Promise.all((data.files || []).map(async (file: any) => {
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        try {
          // Fetch first image from folder
          const folderUrl =
            `https://www.googleapis.com/drive/v3/files` +
            `?q='${file.id}'+in+parents+and+(mimeType+contains+'image/')` +
            `&fields=files(id,thumbnailLink)` +
            `&pageSize=1` +
            `&key=${apiKey}`;
          
          const folderResponse = await fetch(folderUrl);
          if (folderResponse.ok) {
            const folderData = await folderResponse.json();
            if (folderData.files && folderData.files.length > 0) {
              file.coverImage = folderData.files[0].thumbnailLink;
            }
          }
        } catch (err) {
          console.error('Error fetching folder cover:', err);
        }
      }
      return file;
    }));

    data.files = itemsWithCovers;

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
