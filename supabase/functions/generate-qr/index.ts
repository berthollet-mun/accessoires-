import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import * as QRCode from "https://esm.sh/qrcode@1.5.3"

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

    const { target_url } = await req.json()
    if (!target_url) throw new Error('target_url is required')

    // Generate QR code as Base64 string
    const qrDataUrl = await QRCode.toDataURL(target_url, { margin: 1 })
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "")
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

    const fileName = `qr_${Date.now()}.png`

    // Upload to public storage bucket
    const { error: uploadError } = await supabaseClient.storage
      .from('product-images') // Reusing product-images bucket as it's public
      .upload(`qrcodes/${fileName}`, buffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('product-images')
      .getPublicUrl(`qrcodes/${fileName}`)

    // Create record in qr_codes table
    const { data: qrRecord, error: dbError } = await supabaseClient
      .from('qr_codes')
      .insert({
        target_url,
        image_url: urlData.publicUrl
      })
      .select()
      .single()
      
    if (dbError) throw dbError

    return new Response(JSON.stringify(qrRecord), {
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
