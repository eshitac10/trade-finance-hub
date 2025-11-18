import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
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

    // Accept both multipart/form-data and JSON (fallback)
    const contentType = req.headers.get("content-type") || "";
    let file: File | undefined;
    let timezone: string = "UTC";
    let filename = "upload.txt";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const f = formData.get("file");
      if (f && typeof f !== "string") file = f as File;
      timezone = (formData.get("timezone") as string) || "UTC";
      filename = (formData.get("filename") as string) || (file?.name ?? filename);
    } else {
      const body = await req.json().catch(() => null);
      if (body && typeof body === "object") {
        if (body.fileContent && typeof body.fileContent === "string") {
          // Create a File from the raw text to reuse the same streaming code path
          file = new File([body.fileContent], body.filename || "upload.txt", { type: "text/plain" });
        }
        timezone = body?.timezone || "UTC";
        filename = body?.filename || (file?.name ?? filename);
      }
    }

    
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

    console.log('Processing file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    // Create import record early (processing state)
    const { data: importRecord, error: importError } = await supabase
      .from('whatsapp_imports')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_size: file.size,
        status: 'processing',
        total_messages: 0,
        timezone,
        date_format: 'auto-detected'
      })
      .select()
      .single();

    if (importError) throw importError;

    console.log('Created import record:', importRecord.id);

    // Return immediately for large files to avoid timeout
    // Processing will continue in the background
    if (file.size > 10 * 1024 * 1024) { // > 10MB
      console.log('Large file detected, returning importId immediately and processing in background');
      
      // Start background processing
      EdgeRuntime.waitUntil(processFileInBackground(file, importRecord, user.id, timezone, supabase));
      
      return new Response(JSON.stringify({
        success: true,
        importId: importRecord.id,
        message: 'Processing started in background'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let buffer = '';
    let lineNumber = 0;

    let currentMessage: ParsedMessage | null = null;
    let parseErrors = 0;
    const failedLines: string[] = [];

    // Batch insert to reduce memory/CPU usage
    const batchSize = 300;
    const messageBatch: Array<{
      import_id: string;
      event_id: string | null;
      message_id: string;
      datetime_iso: string;
      author: string;
      text: string;
      attachments: string[];
      raw_line: string;
    }> = [];

    let insertedCount = 0;

    async function insertBatch() {
      if (messageBatch.length === 0) return;
      const batch = messageBatch.splice(0, messageBatch.length);
      const { error: batchError } = await supabase
        .from('whatsapp_messages')
        .insert(batch);
      if (batchError) {
        console.error('Batch insert error:', batchError);
        // continue; partial errors do not fail the entire import
      } else {
        insertedCount += batch.length;
        // Yield to event loop to avoid CPU spikes
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    // Streaming-friendly event detection (message bursts)
    type BurstMsg = { datetimeISO: string; text: string };
    type EventRange = { startDatetime: string; endDatetime: string; messageCount: number; keywords: string[] };

    let currentBurst: BurstMsg[] = [];
    const detectedEventRanges: EventRange[] = [];

    function finalizeBurstIfNeeded() {
      if (currentBurst.length >= 5) {
        const allText = currentBurst.map(m => m.text.toLowerCase()).join(' ');
        let foundKeywords: string[] = [];
        for (const [, keywords] of Object.entries(EVENT_KEYWORDS)) {
          for (const keyword of keywords) {
            if (allText.includes(keyword)) { foundKeywords.push(keyword); break; }
          }
          if (foundKeywords.length) break;
        }
        detectedEventRanges.push({
          startDatetime: currentBurst[0].datetimeISO,
          endDatetime: currentBurst[currentBurst.length - 1].datetimeISO,
          messageCount: currentBurst.length,
          keywords: [...new Set(foundKeywords)]
        });
      }
      currentBurst = [];
    }

    function handleFinalizedMessage(msg: ParsedMessage) {
      // Build row and push to batch
      messageBatch.push({
        import_id: importRecord.id,
        event_id: null, // will be assigned after events are inserted
        message_id: msg.messageId,
        datetime_iso: msg.datetimeISO,
        author: msg.author,
        text: msg.text,
        attachments: msg.attachments,
        raw_line: msg.rawLine,
      });

      // Update burst
      const last = currentBurst[currentBurst.length - 1];
      if (!last) {
        currentBurst.push({ datetimeISO: msg.datetimeISO, text: msg.text });
      } else {
        const timeDiff = new Date(msg.datetimeISO).getTime() - new Date(last.datetimeISO).getTime();
        if (timeDiff <= 10 * 60 * 1000) {
          currentBurst.push({ datetimeISO: msg.datetimeISO, text: msg.text });
        } else {
          finalizeBurstIfNeeded();
          currentBurst.push({ datetimeISO: msg.datetimeISO, text: msg.text });
        }
      }
    }

    // Stream read loop
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) { lineNumber++; continue; }
        const parsed = parseWhatsAppLine(trimmedLine, lineNumber);
        if (parsed) {
          if (currentMessage) {
            handleFinalizedMessage(currentMessage);
            if (messageBatch.length >= batchSize) {
              await insertBatch();
            }
          }
          currentMessage = parsed;
        } else if (currentMessage) {
          // Multi-line continuation
          currentMessage.text += '\n' + trimmedLine;
          currentMessage.rawLine += '\n' + trimmedLine;
        } else {
          // Count as error if not a system/blank
          parseErrors++;
          if (failedLines.length < 10) {
            failedLines.push(`Line ${lineNumber}: ${trimmedLine.substring(0, 100)}`);
          }
        }
        lineNumber++;
      }
    }

    // Flush remainder buffer
    if (buffer.length) {
      const trimmedLine = buffer.trim();
      if (trimmedLine) {
        const parsed = parseWhatsAppLine(trimmedLine, lineNumber);
        if (parsed) {
          if (currentMessage) handleFinalizedMessage(currentMessage);
          currentMessage = parsed;
        } else if (currentMessage) {
          currentMessage.text += '\n' + trimmedLine;
          currentMessage.rawLine += '\n' + trimmedLine;
        } else {
          parseErrors++;
          if (failedLines.length < 10) failedLines.push(`Line ${lineNumber}: ${trimmedLine.substring(0, 100)}`);
        }
      }
    }

    // Flush last message
    if (currentMessage) handleFinalizedMessage(currentMessage);

    // Finish burst detection and insert last batch
    finalizeBurstIfNeeded();
    await insertBatch();

    const attempted = insertedCount + parseErrors; // approximate attempt count
    const parseSuccessRate = attempted > 0 ? insertedCount / attempted : 1;
    console.log(`Stream parse inserted: ${insertedCount} messages, errors: ${parseErrors}`);
    if (failedLines.length > 0) console.log('Failed lines:', failedLines);

    // Insert events based on detected ranges
    const eventsToInsert = detectedEventRanges.map((range) => {
      // Determine title type from keywords
      let detectedType = 'Conversation';
      for (const [eventType, keywords] of Object.entries(EVENT_KEYWORDS)) {
        if (keywords.some(k => range.keywords.includes(k))) {
          detectedType = eventType.charAt(0).toUpperCase() + eventType.slice(1);
          break;
        }
      }
      return {
        import_id: importRecord.id,
        user_id: user.id,
        title: `${detectedType} - ${new Date(range.startDatetime).toLocaleDateString()}`,
        start_datetime: range.startDatetime,
        end_datetime: range.endDatetime,
        message_count: range.messageCount,
        keywords: range.keywords,
        confidence_score: range.keywords.length ? 0.8 : 0.5,
        tags: [] as string[],
      };
    });

    let insertedEvents: any[] = [];
    if (eventsToInsert.length) {
      const { data: evts, error: eventsError } = await supabase
        .from('whatsapp_events')
        .insert(eventsToInsert)
        .select();
      if (eventsError) {
        console.error('Events insert error:', eventsError);
      } else {
        insertedEvents = evts ?? [];
      }
    }

    // Assign messages to events using range updates to avoid re-reading all messages
    for (let i = 0; i < insertedEvents.length; i++) {
      const evt = insertedEvents[i];
      const range = detectedEventRanges[i];
      const { error: updateErr } = await supabase
        .from('whatsapp_messages')
        .update({ event_id: evt.id })
        .eq('import_id', importRecord.id)
        .gte('datetime_iso', range.startDatetime)
        .lte('datetime_iso', range.endDatetime);
      if (updateErr) console.error('Event assignment error:', updateErr);
      // Yield
      await new Promise((r) => setTimeout(r, 0));
    }

    // Finalize import record
    const { error: updateImportErr } = await supabase
      .from('whatsapp_imports')
      .update({ status: 'completed', total_messages: insertedCount })
      .eq('id', importRecord.id);
    if (updateImportErr) console.error('Import update error:', updateImportErr);

    return new Response(JSON.stringify({
      success: true,
      importId: importRecord.id,
      totalMessages: insertedCount,
      eventsDetected: insertedEvents.length,
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