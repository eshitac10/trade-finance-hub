import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, summaryType = 'medium', systemPrompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Format messages for summarization
    const conversationText = messages
      .map((msg: any) => `[${msg.author}]: ${msg.text}`)
      .join('\n');

    // Use custom system prompt if provided, otherwise use default
    const defaultPrompts = {
      short: "You are a professional summarizer for trade finance discussions. Create a very brief 1-2 line summary highlighting the main topic and key outcome.",
      medium: "You are a professional summarizer for trade finance discussions. Create a 3-5 bullet point summary covering key topics, decisions, and action items. Include main participants where relevant.",
      long: "You are a professional summarizer for trade finance discussions. Create a detailed 150-250 word summary. Include: main topics discussed, key decisions made, action items identified, important participants, relevant dates, and any concerns or follow-ups. Structure it clearly with paragraphs."
    };

    const systemContent = systemPrompt || defaultPrompts[summaryType as keyof typeof defaultPrompts] || defaultPrompts.medium;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemContent
          },
          {
            role: "user",
            content: `Please summarize this conversation:\n\n${conversationText}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Summarization error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});