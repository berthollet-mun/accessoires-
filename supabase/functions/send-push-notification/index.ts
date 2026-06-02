import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, title, message } = await req.json()
    if (!user_id || !title || !message) throw new Error('Missing parameters')

    // Find user's push tokens
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('push_tokens')
      .eq('id', user_id)
      .single()

    const playerIds = profile?.push_tokens || []

    // Save notification in database
    await supabaseClient.from('notifications').insert({
        user_id,
        title,
        body: message
    })

    if (playerIds.length > 0) {
      // Send OneSignal Notification
      const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID')
      const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY')

      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          include_player_ids: playerIds,
          headings: { en: title },
          contents: { en: message }
        })
      })

      const responseData = await response.json()
      if (!response.ok) {
        console.error("OneSignal Error:", responseData)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
