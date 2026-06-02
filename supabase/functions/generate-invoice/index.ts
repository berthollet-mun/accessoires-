import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { jsPDF } from "https://esm.sh/jspdf@2.5.1"

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

    // Fetch order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*, order_items(*, products(name))')
      .eq('id', order_id)
      .single()

    if (orderError || !order) throw new Error('Order not found')

    // Create PDF
    const doc = new jsPDF()
    doc.text(`Invoice for Order: ${order.id}`, 10, 10)
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 10, 20)
    doc.text(`Total Amount: $${order.total_amount}`, 10, 30)
    doc.text('Items:', 10, 40)
    
    let y = 50
    order.order_items.forEach((item: any) => {
      doc.text(`- ${item.products.name} x${item.quantity} ($${item.unit_price} each)`, 15, y)
      y += 10
    })

    const pdfOutput = doc.output('arraybuffer')

    // Upload to Storage
    const fileName = `invoice_${order.id}.pdf`
    const { error: uploadError } = await supabaseClient.storage
      .from('invoices')
      .upload(fileName, pdfOutput, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Get signed URL
    const { data: urlData } = await supabaseClient.storage
      .from('invoices')
      .createSignedUrl(fileName, 60 * 60 * 24 * 30) // 30 days

    // Update order with invoice URL
    await supabaseClient
      .from('orders')
      .update({ invoice_url: urlData?.signedUrl })
      .eq('id', order_id)

    return new Response(JSON.stringify({ url: urlData?.signedUrl }), {
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
