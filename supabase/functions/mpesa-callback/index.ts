
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const callbackData = await req.json();
    console.log('M-Pesa Callback received:', callbackData);

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = "https://htbnolnksxidbnobdgjf.supabase.co";
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { Body } = callbackData;
    const { stkCallback } = Body;

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const checkoutRequestId = stkCallback.CheckoutRequestID;
      const mpesaReceiptNumber = stkCallback.CallbackMetadata.Item.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = stkCallback.CallbackMetadata.Item.find((item: any) => item.Name === 'TransactionDate')?.Value;
      const amount = stkCallback.CallbackMetadata.Item.find((item: any) => item.Name === 'Amount')?.Value;

      // Update transaction status
      const { data: transaction, error: transactionError } = await supabase
        .from('mpesa_transactions')
        .update({
          status: 'success',
          mpesa_receipt_number: mpesaReceiptNumber,
          transaction_date: new Date(transactionDate.toString()).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('checkout_request_id', checkoutRequestId)
        .select('user_id')
        .single();

      if (transactionError) {
        console.error('Transaction update error:', transactionError);
        throw transactionError;
      }

      // Update or create membership
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

      const { error: membershipError } = await supabase
        .from('memberships')
        .upsert({
          user_id: transaction.user_id,
          status: 'paid',
          payment_reference: mpesaReceiptNumber,
          amount: amount,
          currency: 'KES',
          payment_method: 'mpesa',
          paid_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        });

      if (membershipError) {
        console.error('Membership update error:', membershipError);
        throw membershipError;
      }

      console.log('Payment processed successfully for user:', transaction.user_id);

    } else {
      // Payment failed
      const checkoutRequestId = stkCallback.CheckoutRequestID;
      const errorMessage = stkCallback.ResultDesc;

      // Update transaction status to failed
      await supabase
        .from('mpesa_transactions')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('checkout_request_id', checkoutRequestId);

      console.log('Payment failed:', errorMessage);
    }

    return new Response(JSON.stringify({ message: 'Callback processed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Callback processing error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
};

serve(handler);
