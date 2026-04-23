// Supabase Edge Function: create-preference
// Creates a Mercado Pago payment preference securely on the server side

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
const WEBHOOK_URL = 'https://bzahiysaveiyfwdegzmk.supabase.co/functions/v1/webhook-handler';

interface CreatePreferenceRequest {
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    // Parse request body
    const { email }: CreatePreferenceRequest = await req.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Check if access token is configured
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Payment configuration error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Always use the production URL for back_urls.
    // Mercado Pago rejects localhost URLs when auto_return is enabled.
    const PRODUCTION_URL = 'https://foco-enem-curso.vercel.app';

    // Create payment preference
    const preferenceData = {
      items: [
        {
          title: 'Foco ENEM - Acesso Vitalício',
          description: 'Acesso completo e permanente à plataforma de estudos para o ENEM',
          unit_price: 47.00,
          quantity: 1,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: email,
      },
      metadata: {
        email: email,
      },
      back_urls: {
        success: `${PRODUCTION_URL}/success?status=approved`,
        failure: `${PRODUCTION_URL}/success?status=failed`,
        pending: `${PRODUCTION_URL}/success?status=pending`,
      },
      auto_return: 'approved',
      payment_methods: {
        installments: 4,
        default_installments: 1,
      },
      notification_url: WEBHOOK_URL,
      statement_descriptor: 'FOCO ENEM',
    };

    console.log('Creating payment preference for email:', email);

    // Call Mercado Pago API
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Mercado Pago API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      return new Response(
        JSON.stringify({
          error: 'Failed to create payment preference',
          details: errorData,
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const preference = await response.json();
    console.log('Payment preference created successfully:', preference.id);

    // Return preference data
    return new Response(
      JSON.stringify({
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in create-preference function:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
