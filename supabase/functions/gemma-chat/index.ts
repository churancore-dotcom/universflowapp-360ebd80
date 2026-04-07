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
    // Auth check - admin only
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const HF_TOKEN = Deno.env.get('HUGGINGFACE_API_TOKEN');
    if (!HF_TOKEN) {
      return new Response(JSON.stringify({ error: 'Hugging Face API token not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch platform stats for context
    let platformContext = '';
    if (context === 'dashboard') {
      const [songsRes, usersRes, requestsRes] = await Promise.all([
        supabase.from('songs').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('song_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);
      platformContext = `\nPlatform stats: ${songsRes.count ?? 0} songs, ${usersRes.count ?? 0} users, ${requestsRes.count ?? 0} pending requests.`;
    }

    const systemPrompt = `You are Gemma 4, a powerful AI admin assistant for UniversFlow music streaming platform. You help admins with:
- Content moderation decisions
- Analytics insights and recommendations
- User management advice
- Platform optimization suggestions
- Music catalog management
- Security threat analysis
- Growth strategies and engagement ideas
- Technical troubleshooting

Be concise, actionable, and data-driven. Format responses with markdown.${platformContext}`;

    // Call Hugging Face Inference API with Gemma 4
    const hfResponse = await fetch(
      'https://router.huggingface.co/novita/v3/openai/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemma-3-27b-it',
          messages: [
            { role: 'user', content: systemPrompt },
            ...messages,
          ],
          max_tokens: 2048,
          temperature: 0.7,
          stream: true,
        }),
      }
    );

    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      console.error('HF API error:', hfResponse.status, errText);

      if (hfResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited. Try again shortly.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (hfResponse.status === 401 || hfResponse.status === 403) {
        return new Response(JSON.stringify({ error: 'Invalid Hugging Face token. Please update it.' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Gemma 4 service temporarily unavailable' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stream the response back
    return new Response(hfResponse.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Gemma chat error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
