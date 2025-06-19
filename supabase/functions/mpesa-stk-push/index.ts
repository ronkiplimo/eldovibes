
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, amount, userId }: STKPushRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get M-Pesa credentials from environment
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
    const businessShortCode = Deno.env.get('MPESA_BUSINESS_SHORTCODE');
    const passkey = Deno.env.get('MPESA_PASSKEY');

    console.log('M-Pesa credentials check:', {
      hasConsumerKey: !!consumerKey,
      hasConsumerSecret: !!consumerSecret,
      hasBusinessShortCode: !!businessShortCode,
      hasPasskey: !!passkey
    });

    if (!consumerKey || !consumerSecret || !businessShortCode) {
      throw new Error('Missing M-Pesa credentials. Please configure MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, and MPESA_BUSINESS_SHORTCODE in your Supabase secrets.');
    }

    // Generate access token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('Failed to obtain access token from M-Pesa API');
    }

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    
    // Generate password (Base64 encoded: BusinessShortCode + Passkey + Timestamp)
    // If passkey is not available, use a default value for testing
    const passkeyToUse = passkey || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const password = btoa(`${businessShortCode}${passkeyToUse}${timestamp}`);

    // Format phone number (ensure it starts with 254)
    const formattedPhone = phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.slice(1)}`;

    // STK Push payload
    const stkPushPayload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: `${supabaseUrl}/functions/v1/mpesa-callback`,
      AccountReference: `EldoVibes-${userId}`,
      TransactionDesc: 'EldoVibes Membership Payment'
    };

    console.log('STK Push payload:', {
      ...stkPushPayload,
      Password: '[REDACTED]'
    });

    // Initiate STK Push
    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPushPayload),
    });

    const stkData = await stkResponse.json();
    console.log('STK Push Response:', stkData);

    if (stkData.ResponseCode === '0') {
      // Save transaction to database
      const { error } = await supabase
        .from('mpesa_transactions')
        .insert({
          user_id: userId,
          checkout_request_id: stkData.CheckoutRequestID,
          merchant_request_id: stkData.MerchantRequestID,
          phone_number: formattedPhone,
          amount: amount,
          status: 'pending'
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'STK Push sent successfully',
        checkoutRequestId: stkData.CheckoutRequestID
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      throw new Error(stkData.errorMessage || `STK Push failed with code: ${stkData.ResponseCode}`);
    }

  } catch (error) {
    console.error('Error in mpesa-stk-push:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Please check that your M-Pesa credentials are properly configured in Supabase secrets.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
};

serve(handler);
