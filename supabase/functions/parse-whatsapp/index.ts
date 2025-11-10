import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParsedMessage {
  messageId: string;
  datetimeISO: string;
  author: string;
  text: string;
  attachments: string[];
  rawLine: string;
}

interface DetectedEvent {
  title: string;
  startDatetime: string;
  endDatetime: string;
  messageCount: number;
  keywords: string[];
  confidenceScore: number;
}

// Common WhatsApp timestamp patterns
const TIMESTAMP_PATTERNS = [
  // Format: [M/D/YY, h:mm[:ss] AM/PM] Author: Message (bracketed)
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s|\u202F|\u00A0)?(?:AM|PM|am|pm)?)\]\s+(.+?)\s*:\s*(.*)$/,
  // Format: M/D/YY, h:mm[:ss] AM/PM - Author: Message (dash)
  /^(\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s|\u202F|\u00A0)?(?:AM|PM|am|pm)?)\s*[-–—]\s*(.+?)\s*:\s*(.*)$/,
  // Format: YYYY-MM-DD HH:mm:ss - Author: Message
  /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s*[-–—]\s*(.+?)\s*:\s*(.*)$/,
];

const EVENT_KEYWORDS = {
  meeting: ['meeting', 'meet', 'conference', 'call', 'zoom', 'teams'],
  birthday: ['birthday', 'bday', 'born', 'cake'],
  wedding: ['wedding', 'marriage', 'bride', 'groom'],
  travel: ['flight', 'airport', 'train', 'ticket', 'booking', 'hotel'],
  appointment: ['appointment', 'doctor', 'clinic', 'hospital'],
  payment: ['invoice', 'payment', 'paid', 'transfer', 'amount'],
  celebration: ['party', 'celebrate', 'celebration', 'congrats']
};

function parseWhatsAppLine(line: string, lineNumber: number): ParsedMessage | null {
  // Normalize special unicode spaces and direction marks
  const cleanedLine = line
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "") // bidi and direction marks
    .replace(/[\u202F\u00A0]/g, " "); // narrow/nbsp to normal space

  for (const pattern of TIMESTAMP_PATTERNS) {
    const match = cleanedLine.match(pattern);
    if (match) {
      const [, timestamp, authorRaw, textRaw] = match;

      const author = authorRaw.replace(/[\u200E\u200F]/g, "").trim();
      const text = textRaw.replace(/[\u200E\u200F]/g, "").trim();
      
      // Extract attachments
      const attachments: string[] = [];
      const attachmentMatch = text.match(/<attached: (.+?)>/g);
      if (attachmentMatch) {
        attachmentMatch.forEach(a => {
          const filename = a.match(/<attached: (.+?)>/)?.[1];
          if (filename) attachments.push(filename);
        });
      }
      
      return {
        messageId: `msg_${lineNumber}`,
        datetimeISO: parseTimestamp(timestamp),
        author,
        text,
        attachments,
        rawLine: line
      };
    }
  }
  return null;
}

function parseTimestamp(timestamp: string): string {
  // Try to parse common formats
  const formats = [
    /(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s|\u202F|\u00A0)?(AM|PM|am|pm)?/,
    /(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/
  ];
  
  for (const format of formats) {
    const match = timestamp.match(format);
    if (match) {
      try {
        let date: Date;
        
        if (format === formats[0]) {
          let [, month, day, year, hours, minutes, seconds, period] = match;
          
          // Handle 2-digit year
          let fullYear = parseInt(year);
          if (fullYear < 100) {
            fullYear = fullYear > 50 ? 1900 + fullYear : 2000 + fullYear;
          }
          
          // Handle 12-hour format
          let hour = parseInt(hours);
          if (period) {
            if (period.toLowerCase() === 'pm' && hour < 12) hour += 12;
            if (period.toLowerCase() === 'am' && hour === 12) hour = 0;
          }
          
          date = new Date(fullYear, parseInt(month) - 1, parseInt(day), hour, parseInt(minutes), parseInt(seconds || '0'));
        } else {
          const [, year, month, day, hours, minutes, seconds] = match;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
        }
        
        return date.toISOString();
      } catch (e) {
        console.error('Failed to parse timestamp:', timestamp, e);
      }
    }
  }
  
  return new Date().toISOString();
}

function detectEvents(messages: ParsedMessage[]): DetectedEvent[] {
  const events: DetectedEvent[] = [];
  const messageBursts: ParsedMessage[][] = [];
  
  // Detect message bursts (>5 messages in 10 minutes)
  let currentBurst: ParsedMessage[] = [];
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (currentBurst.length === 0) {
      currentBurst.push(msg);
    } else {
      const lastMsg = currentBurst[currentBurst.length - 1];
      const timeDiff = new Date(msg.datetimeISO).getTime() - new Date(lastMsg.datetimeISO).getTime();
      
      if (timeDiff <= 10 * 60 * 1000) { // 10 minutes
        currentBurst.push(msg);
      } else {
        if (currentBurst.length >= 5) {
          messageBursts.push([...currentBurst]);
        }
        currentBurst = [msg];
      }
    }
  }
  
  if (currentBurst.length >= 5) {
    messageBursts.push(currentBurst);
  }
  
  // Analyze each burst for event keywords
  messageBursts.forEach(burst => {
    const allText = burst.map(m => m.text.toLowerCase()).join(' ');
    let detectedType = 'Conversation';
    let confidence = 0.5;
    const foundKeywords: string[] = [];
    
    for (const [eventType, keywords] of Object.entries(EVENT_KEYWORDS)) {
      for (const keyword of keywords) {
        if (allText.includes(keyword)) {
          detectedType = eventType.charAt(0).toUpperCase() + eventType.slice(1);
          confidence = 0.8;
          foundKeywords.push(keyword);
          break;
        }
      }
      if (confidence > 0.5) break;
    }
    
    events.push({
      title: `${detectedType} - ${new Date(burst[0].datetimeISO).toLocaleDateString()}`,
      startDatetime: burst[0].datetimeISO,
      endDatetime: burst[burst.length - 1].datetimeISO,
      messageCount: burst.length,
      keywords: [...new Set(foundKeywords)],
      confidenceScore: confidence
    });
  });
  
  return events;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const timezone = formData.get("timezone") as string || "UTC";
    
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check file size (1GB max)
    if (file.size > 1024 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "File too large. Maximum 1GB allowed." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read file content
    let content = await file.text();
    
// Parse messages
const lines = content.split('\n');
const messages: ParsedMessage[] = [];
let currentMessage: ParsedMessage | null = null;
let parseErrors = 0;
const failedLines: string[] = [];

lines.forEach((line, index) => {
  const trimmedLine = line.trim();
  if (!trimmedLine) return;
  
  const parsed = parseWhatsAppLine(trimmedLine, index);
  
  if (parsed) {
    if (currentMessage) {
      messages.push(currentMessage);
    }
    currentMessage = parsed;
  } else if (currentMessage) {
    // Multi-line message continuation
    currentMessage.text += '\n' + trimmedLine;
    currentMessage.rawLine += '\n' + trimmedLine;
  } else {
    // Only count as error if it's not a system message or blank
    if (trimmedLine && !trimmedLine.startsWith('‎')) {
      parseErrors++;
      if (failedLines.length < 10) {
        failedLines.push(`Line ${index}: ${trimmedLine.substring(0, 100)}`);
      }
    }
  }
});

if (currentMessage) {
  messages.push(currentMessage);
}

console.log(`Parse results: ${messages.length} messages, ${parseErrors} errors`);
if (failedLines.length > 0) {
  console.log('Failed lines:', failedLines);
}
    
// Check parse success rate (only count lines we attempted to parse)
const attempted = messages.length + parseErrors;
const parseSuccessRate = attempted > 0 ? messages.length / attempted : 1;
console.log(`Parse success rate: ${parseSuccessRate} (${messages.length}/${attempted})`);

if (parseSuccessRate < 0.85) {
  return new Response(JSON.stringify({ 
    error: "Low parse success rate. Please verify date format.",
    parseSuccessRate,
    sample: lines.slice(0, 20),
    failedLines
  }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
    
    // Create import record
    const { data: importRecord, error: importError } = await supabase
      .from('whatsapp_imports')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_size: file.size,
        status: 'completed',
        total_messages: messages.length,
        timezone,
        date_format: 'auto-detected'
      })
      .select()
      .single();
    
    if (importError) throw importError;
    
    // Detect events
    const detectedEvents = detectEvents(messages);
    
    // Insert events
    const eventsToInsert = detectedEvents.map(event => ({
      import_id: importRecord.id,
      user_id: user.id,
      title: event.title,
      start_datetime: event.startDatetime,
      end_datetime: event.endDatetime,
      message_count: event.messageCount,
      keywords: event.keywords,
      confidence_score: event.confidenceScore,
      tags: []
    }));
    
    const { data: insertedEvents, error: eventsError } = await supabase
      .from('whatsapp_events')
      .insert(eventsToInsert)
      .select();
    
    if (eventsError) throw eventsError;
    
    // Assign messages to events
    const messagesWithEvents = messages.map(msg => {
      const msgTime = new Date(msg.datetimeISO).getTime();
      const assignedEvent = insertedEvents?.find(event => {
        const start = new Date(event.start_datetime).getTime();
        const end = new Date(event.end_datetime).getTime();
        return msgTime >= start && msgTime <= end;
      });
      
      return {
        import_id: importRecord.id,
        event_id: assignedEvent?.id || null,
        message_id: msg.messageId,
        datetime_iso: msg.datetimeISO,
        author: msg.author,
        text: msg.text,
        attachments: msg.attachments,
        raw_line: msg.rawLine
      };
    });
    
    // Insert messages in batches
    const batchSize = 500;
    for (let i = 0; i < messagesWithEvents.length; i += batchSize) {
      const batch = messagesWithEvents.slice(i, i + batchSize);
      const { error: msgError } = await supabase
        .from('whatsapp_messages')
        .insert(batch);
      
      if (msgError) throw msgError;
    }
    
    return new Response(JSON.stringify({
      success: true,
      importId: importRecord.id,
      totalMessages: messages.length,
      eventsDetected: detectedEvents.length,
      parseSuccessRate
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Parse error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});