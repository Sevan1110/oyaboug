import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing env' }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const ipFromHeaders = (headers: Headers): string | null => {
    const cf = headers.get('cf-connecting-ip');
    if (cf) return cf;
    const real = headers.get('x-real-ip');
    if (real) return real;
    const fwd = headers.get('x-forwarded-for');
    if (fwd) return fwd.split(',')[0]?.trim() || null;
    return null;
  };

  try {
    const body = await req.json();
    const action = body?.action;

    if (action !== 'session_start') {
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }

    const payload = body?.payload;

    const ip = ipFromHeaders(req.headers);

    const { error } = await supabase.from('telemetry_sessions').insert({
      ...payload,
      ip,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
