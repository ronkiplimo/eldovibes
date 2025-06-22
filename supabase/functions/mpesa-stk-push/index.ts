
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
    console.log('STK Push request received:', { phoneNumber: phoneNumber.substring(0, 6) + '***', amount, userId });

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
      const errorMsg = 'Missing M-Pesa credentials. Please configure MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, and MPESA_BUSINESS_SHORTCODE in your Supabase secrets.';
      console.error(errorMsg);
      return new Response(JSON.stringify({
        success: false,
        error: errorMsg,
        errorCode: 'MISSING_CREDENTIALS'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log('Attempting to get M-Pesa access token...');
    
    // Generate access token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    const tokenResponseText = await tokenResponse.text();
    console.log('Token response status:', tokenResponse.status);
    console.log('Token response:', tokenResponseText);

    if (!tokenResponse.ok) {
      const errorMsg = `Failed to get access token: ${tokenResponse.status} - ${tokenResponseText}`;
      console.error(errorMsg);
      return new Response(JSON.stringify({
        success: false,
        error: errorMsg,
        errorCode: 'TOKEN_FAILED'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    let tokenData;
    try {
      tokenData = JSON.parse(tokenResponseText);
    } catch (e) {
      console.error('Failed to parse token response:', e);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid token response format',
        errorCode: 'TOKEN_PARSE_ERROR'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('No access token in response:', tokenData);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to obtain access token from M-Pesa API',
        errorCode: 'NO_ACCESS_TOKEN'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log('Access token obtained successfully');

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    
    // Generate password (Base64 encoded: BusinessShortCode + Passkey + Timestamp)
    const passkeyToUse = passkey || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const password = btoa(`${businessShortCode}${passkeyToUse}${timestamp}`);

    // Format phone number (ensure it starts with 254)
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      formattedPhone = `254${phoneNumber.slice(1)}`;
    } else if (!phoneNumber.startsWith('254')) {
      formattedPhone = `254${phoneNumber}`;
    }

    console.log('Formatted phone number:', formattedPhone.substring(0, 6) + '***');

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

    console.log('STK Push payload (password redacted):', {
      ...stkPushPayload,
      Password: '[REDACTED]'
    });

    console.log('Initiating STK Push...');

    // Initiate STK Push
    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPushPayload),
    });

    const stkResponseText = await stkResponse.text();
    console.log('STK Push response status:', stkResponse.status);
    console.log('STK Push response:', stkResponseText);

    let stkData;
    try {
      stkData = JSON.parse(stkResponseText);
    } catch (e) {
      console.error('Failed to parse STK response:', e);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid STK Push response format',
        errorCode: 'STK_PARSE_ERROR',
        details: stkResponseText
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log('STK Push Response parsed:', stkData);

    if (stkData.ResponseCode === '0') {
      console.log('STK Push successful, saving to database...');
      
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
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to save transaction to database',
          errorCode: 'DB_ERROR',
          details: error.message
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      console.log('Transaction saved successfully');

      return new Response(JSON.stringify({
        success: true,
        message: 'STK Push sent successfully',
        checkoutRequestId: stkData.CheckoutRequestID
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      const errorMessage = stkData.errorMessage || stkData.ResultDesc || `STK Push failed with code: ${stkData.ResponseCode}`;
      console.error('STK Push failed:', errorMessage, stkData);
      
      return new Response(JSON.stringify({
        success: false,
        error: errorMessage,
        errorCode: 'STK_FAILED',
        responseCode: stkData.ResponseCode,
        details: stkData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

  } catch (error) {
    console.error('Error in mpesa-stk-push:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      errorCode: 'UNKNOWN_ERROR',
      details: 'Please check the function logs for more details.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
};

serve(handler);
