import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Type definitions for Mercado Pago webhook payload
interface MercadoPagoWebhookPayload {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

interface MercadoPagoPaymentDetails {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  date_created: string;
  date_approved: string | null;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  metadata: {
    email?: string;
  };
}

// CORS headers for webhook endpoint
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
};

/**
 * Verify Mercado Pago webhook signature using HMAC-SHA256
 * @param signature - The x-signature header value
 * @param requestId - The x-request-id header value
 * @param paymentId - The payment ID from the webhook payload
 * @param secret - The webhook secret from environment variables
 * @returns true if signature is valid, false otherwise
 */
async function verifyWebhookSignature(
  signature: string,
  requestId: string,
  paymentId: string,
  secret: string
): Promise<boolean> {
  try {
    // Parse signature header (format: "ts=timestamp,v1=hash")
    const signatureParts = signature.split(',').reduce((acc, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const timestamp = signatureParts.ts;
    const receivedHash = signatureParts.v1;

    if (!timestamp || !receivedHash) {
      console.error('Invalid signature format');
      return false;
    }

    // Construct the signed content: id + request_id + timestamp
    const signedContent = `id:${paymentId};request-id:${requestId};ts:${timestamp};`;

    // Create HMAC-SHA256 hash
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(signedContent);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature_buffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signature_buffer));
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Compare hashes
    return computedHash === receivedHash;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Fetch payment details from Mercado Pago API
 * @param paymentId - The payment ID to fetch
 * @param accessToken - Mercado Pago access token
 * @returns Payment details or null if fetch fails
 */
async function fetchPaymentDetails(
  paymentId: string,
  accessToken: string
): Promise<MercadoPagoPaymentDetails | null> {
  try {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch payment details', {
        paymentId,
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const paymentDetails: MercadoPagoPaymentDetails = await response.json();
    return paymentDetails;
  } catch (error) {
    console.error('Error fetching payment details:', { paymentId, error });
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse webhook payload
    const payload: MercadoPagoWebhookPayload = await req.json();
    
    console.log('Webhook received:', {
      type: payload.type,
      action: payload.action,
      paymentId: payload.data?.id,
    });

    // Only process payment notifications
    if (payload.type !== 'payment') {
      console.log('Ignoring non-payment notification');
      return new Response(
        JSON.stringify({ message: 'Notification type not processed' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract payment ID
    const paymentId = payload.data?.id;
    if (!paymentId) {
      console.error('Missing payment ID in webhook payload');
      return new Response(
        JSON.stringify({ error: 'Missing payment ID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sub-task 2.2: Verify webhook signature
    const signature = req.headers.get('x-signature');
    const requestId = req.headers.get('x-request-id');
    
    if (!signature || !requestId) {
      console.error('Missing signature or request ID', { paymentId });
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing signature' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify signature using HMAC-SHA256
    const webhookSecret = Deno.env.get('MERCADO_PAGO_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('MERCADO_PAGO_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const isValidSignature = await verifyWebhookSignature(
      signature,
      requestId,
      paymentId,
      webhookSecret
    );

    if (!isValidSignature) {
      console.error('Invalid webhook signature', { paymentId, requestId });
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid signature' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Signature verified successfully', { paymentId });

    // Sub-task 2.5: Fetch and validate payment status
    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const paymentDetails = await fetchPaymentDetails(paymentId, accessToken);
    if (!paymentDetails) {
      console.error('Failed to fetch payment details', { paymentId });
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve payment details' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Payment details retrieved', {
      paymentId,
      status: paymentDetails.status,
      email: paymentDetails.metadata?.email || paymentDetails.payer?.email,
    });

    // Only process approved payments
    if (paymentDetails.status !== 'approved') {
      console.log('Payment not approved, skipping processing', {
        paymentId,
        status: paymentDetails.status,
      });
      return new Response(
        JSON.stringify({ message: 'Payment not approved, no action taken' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sub-task 2.7: Implement idempotent webhook processing
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase environment variables not configured');
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if subscription already exists for this payment_id
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('id, user_id')
      .eq('payment_id', paymentId.toString())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new payments
      console.error('Error checking existing subscription', {
        paymentId,
        error: checkError,
      });
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (existingSubscription) {
      console.log('Subscription already exists for payment, returning 200 OK', {
        paymentId,
        subscriptionId: existingSubscription.id,
        userId: existingSubscription.user_id,
      });
      return new Response(
        JSON.stringify({ 
          message: 'Payment already processed',
          subscription_id: existingSubscription.id,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sub-task 4.1: Extract email and create user account
    const email = paymentDetails.metadata?.email || paymentDetails.payer?.email;
    
    if (!email) {
      console.error('No email found in payment details', { paymentId });
      return new Response(
        JSON.stringify({ error: 'Email not found in payment details' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Creating user account', { paymentId, email });

    try {
      // Create user account using Supabase Admin API
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true, // Auto-confirm email
      });

      if (userError) {
        // Handle duplicate email scenario gracefully
        if (userError.message?.includes('already registered') || userError.message?.includes('already exists')) {
          console.log('User already exists, fetching existing user', { paymentId, email });
          
          // Bug #5 fix: listUsers() without params only returns up to 1000 users.
          // Use pagination to search all pages until the user is found by email.
          let foundUser = null;
          let currentPage = 1;
          const usersPerPage = 1000;

          while (!foundUser) {
            const { data: pageData, error: pageError } = await supabase.auth.admin.listUsers({
              page: currentPage,
              perPage: usersPerPage,
            });

            if (pageError) {
              console.error('Error fetching existing user (page ' + currentPage + ')', { paymentId, email, error: pageError });
              return new Response(
                JSON.stringify({ error: 'Failed to retrieve user account' }),
                { 
                  status: 500, 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                }
              );
            }

            if (!pageData?.users?.length) break; // No more pages

            foundUser = pageData.users.find((u: { email?: string }) => u.email === email) ?? null;

            // Stop if this was the last page (returned fewer than perPage)
            if (pageData.users.length < usersPerPage) break;
            currentPage++;
          }
          

          if (!foundUser) {
            console.error('User exists but could not be found', { paymentId, email });
            return new Response(
              JSON.stringify({ error: 'Failed to retrieve user account' }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          // Use existing user's ID
          const userId = foundUser.id;
          console.log('Using existing user account', { paymentId, userId, email });

          // Sub-task 4.3: Create subscription record
          const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: userId,
              payment_id: paymentId.toString(),
              status: 'approved',
            })
            .select()
            .single();

          if (subError) {
            console.error('Error creating subscription record', { paymentId, userId, error: subError });
            return new Response(
              JSON.stringify({ error: 'Failed to create subscription record' }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          console.log('Subscription record created', { paymentId, subscriptionId: subscription.id, userId });

          // Sub-task 4.5: Send magic link email
          const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
          });

          if (linkError) {
            // Log error but don't fail the webhook (Requirement 11.3)
            console.error('Error sending magic link email', { paymentId, userId, email, error: linkError });
          } else {
            console.log('Magic link generated successfully', { paymentId, userId, email });
          }

          return new Response(
            JSON.stringify({ 
              message: 'Webhook processed successfully',
              subscription_id: subscription.id,
              user_id: userId,
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Other user creation errors
        console.error('Error creating user account', { paymentId, email, error: userError });
        return new Response(
          JSON.stringify({ error: 'Failed to create user account' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const userId = userData.user.id;
      console.log('User account created successfully', { paymentId, userId, email });

      // Sub-task 4.3: Create subscription record
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          payment_id: paymentId.toString(),
          status: 'approved',
        })
        .select()
        .single();

      if (subError) {
        console.error('Error creating subscription record', { paymentId, userId, error: subError });
        return new Response(
          JSON.stringify({ error: 'Failed to create subscription record' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('Subscription record created', { paymentId, subscriptionId: subscription.id, userId });

      // Sub-task 4.5: Send magic link email
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
      });

      if (linkError) {
        // Log error but don't fail the webhook (Requirement 11.3)
        console.error('Error sending magic link email', { paymentId, userId, email, error: linkError });
      } else {
        console.log('Magic link generated successfully', { paymentId, userId, email });
      }

      return new Response(
        JSON.stringify({ 
          message: 'Webhook processed successfully',
          subscription_id: subscription.id,
          user_id: userId,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (error) {
      // Sub-task 4.6: Error handling and logging
      console.error('Unexpected error processing webhook', { 
        paymentId, 
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
