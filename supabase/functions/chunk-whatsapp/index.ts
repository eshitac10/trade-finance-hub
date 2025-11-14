import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface ParsedMessage {
  datetime: string;
  author: string;
  text: string;
  year: number;
  month: number;
}

interface MonthlyChunk {
  year: number;
  month: number;
  label: string;
  messages: ParsedMessage[];
  count: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Processing file for chunking:', file.name, 'Size:', file.size);

    const text = await file.text();
    const lines = text.split('\n');

    // Parse messages with datetime extraction
    const messages: ParsedMessage[] = [];
    const datePatterns = [
      /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\s*[-–]\s*([^:]+):\s*(.*)$/,
      /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\]\s*([^:]+):\s*(.*)$/,
      /^(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\s*[-–]\s*([^:]+):\s*(.*)$/,
    ];

    for (const line of lines) {
      if (!line.trim()) continue;

      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          const [, datePart, timePart, author, text] = match;
          
          // Parse date (supports DD/MM/YYYY and MM/DD/YYYY)
          const dateParts = datePart.split('/');
          let day: number, month: number, year: number;
          
          if (dateParts[2].length === 4) {
            // DD/MM/YYYY or MM/DD/YYYY format
            day = parseInt(dateParts[0]);
            month = parseInt(dateParts[1]);
            year = parseInt(dateParts[2]);
          } else {
            // DD/MM/YY or MM/DD/YY format
            day = parseInt(dateParts[0]);
            month = parseInt(dateParts[1]);
            year = parseInt(dateParts[2]) + 2000;
          }

          messages.push({
            datetime: `${datePart} ${timePart}`,
            author: author.trim(),
            text: text.trim(),
            year,
            month,
          });
          break;
        }
      }
    }

    console.log('Parsed messages:', messages.length);

    // Group messages by month
    const monthlyChunks = new Map<string, MonthlyChunk>();

    for (const msg of messages) {
      const key = `${msg.year}-${msg.month.toString().padStart(2, '0')}`;
      
      if (!monthlyChunks.has(key)) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        monthlyChunks.set(key, {
          year: msg.year,
          month: msg.month,
          label: `${monthNames[msg.month - 1]} ${msg.year}`,
          messages: [],
          count: 0,
        });
      }

      const chunk = monthlyChunks.get(key)!;
      chunk.messages.push(msg);
      chunk.count++;
    }

    // Convert to array and sort by date
    const chunks = Array.from(monthlyChunks.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    console.log('Created chunks:', chunks.length);

    return new Response(
      JSON.stringify({
        chunks: chunks.map(c => ({
          year: c.year,
          month: c.month,
          label: c.label,
          count: c.count,
        })),
        totalMessages: messages.length,
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('Chunking error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to chunk file' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
