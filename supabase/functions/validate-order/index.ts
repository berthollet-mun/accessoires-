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

    const { order_id } = await req.json()
    if (!order_id) throw new Error('order_id is required')

    // Call stored procedure to validate order (deducts stock, updates status, adds log)
    const { error: procError } = await supabaseClient.rpc('valider_commande', { p_order_id: order_id })
    if (procError) throw procError

    // Fetch user_id from order to send notification
    const { data: order } = await supabaseClient.from('orders').select('user_id').eq('id', order_id).single()

    // Trigger generate-invoice asynchronously
    // Not strictly waiting for it here to speed up response
    supabaseClient.functions.invoke('generate-invoice', {
      body: { order_id }
    })

    // Trigger push notification asynchronously
    if (order?.user_id) {
       supabaseClient.functions.invoke('send-push-notification', {
        body: { user_id: order.user_id, title: "Order Validated", message: "Your order has been validated and is being processed." }
      })
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
