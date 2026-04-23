# Webhook Handler Edge Function

This Supabase Edge Function handles webhook notifications from Mercado Pago for payment processing.

## Features

- **Signature Verification**: Validates webhook authenticity using HMAC-SHA256
- **Payment Status Validation**: Only processes approved payments
- **Idempotent Processing**: Prevents duplicate account creation for the same payment
- **Error Handling**: Comprehensive error logging with payment context
- **CORS Support**: Handles preflight requests for webhook endpoint

## Environment Variables

The following environment variables must be configured in Supabase:

### Required Variables

- `MERCADO_PAGO_ACCESS_TOKEN`: Your Mercado Pago access token for API calls
- `MERCADO_PAGO_WEBHOOK_SECRET`: Your Mercado Pago webhook secret for signature verification
- `SUPABASE_URL`: Your Supabase project URL (automatically available in Edge Functions)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (automatically available in Edge Functions)

### Setting Environment Variables

```bash
# Set Mercado Pago credentials
supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=your_access_token_here
supabase secrets set MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret_here
```

## Deployment

### Prerequisites

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Get your Supabase project reference**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to **Settings** → **General**
   - Copy the **Reference ID**

3. **Get your Mercado Pago credentials**:
   - Go to [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel/credentials)
   - Copy your **Access Token** (use Test credentials for development)
   - Go to **Webhooks** section and note your **Webhook Secret**

### Step-by-Step Deployment

#### 1. Link Your Supabase Project

```bash
# Link your local project to Supabase
supabase link --project-ref your-project-ref

# You'll be prompted to enter your database password
# Get it from: Supabase Dashboard → Settings → Database → Database password
```

#### 2. Configure Edge Function Secrets

Set the required environment variables as Supabase secrets:

```bash
# Set Mercado Pago Access Token (for API calls)
supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=your_access_token_here

# Set Mercado Pago Webhook Secret (for signature verification)
supabase secrets set MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret_here
```

**Note**: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available in Edge Functions.

#### 3. Deploy the Edge Function

```bash
# Deploy the webhook-handler function
supabase functions deploy webhook-handler

# Expected output:
# Deploying webhook-handler (project ref: your-project-ref)
# Deployed Function webhook-handler
# Function URL: https://your-project-ref.supabase.co/functions/v1/webhook-handler
```

#### 4. Get the Function URL

After deployment, your webhook endpoint will be:
```
https://your-project-ref.supabase.co/functions/v1/webhook-handler
```

Copy this URL - you'll need it for the next step.

#### 5. Configure Mercado Pago Webhook

1. Log in to [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Go to **Your integrations** → **Webhooks**
3. Click **Add new webhook**
4. Configure:
   - **Production URL**: `https://your-project-ref.supabase.co/functions/v1/webhook-handler`
   - **Events to receive**: Select **Payments**
   - **Version**: v1
5. Click **Save**

#### 6. Verify Deployment

Test the webhook endpoint:

```bash
# Test with a simple request
curl -X POST https://your-project-ref.supabase.co/functions/v1/webhook-handler \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Expected response: 405 Method Not Allowed (because we need proper webhook payload)
```

### Updating the Function

When you make changes to the Edge Function code:

```bash
# Deploy the updated function
supabase functions deploy webhook-handler

# The function URL remains the same
```

### Monitoring and Logs

View function logs in real-time:

```bash
# Stream logs from the Edge Function
supabase functions logs webhook-handler --follow
```

Or view logs in the Supabase Dashboard:
1. Go to **Edge Functions** → **webhook-handler**
2. Click on **Logs** tab
3. View execution logs, errors, and performance metrics

### Troubleshooting

#### Function deployment fails

```bash
# Check if you're linked to the correct project
supabase projects list

# Re-link if necessary
supabase link --project-ref your-project-ref
```

#### Secrets not working

```bash
# List all secrets
supabase secrets list

# Unset and reset a secret
supabase secrets unset MERCADO_PAGO_ACCESS_TOKEN
supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=new_value
```

#### Webhook signature verification fails

- Verify your `MERCADO_PAGO_WEBHOOK_SECRET` matches the one in Mercado Pago dashboard
- Check the Edge Function logs for signature verification errors
- Ensure the webhook is configured for "Payments" events only

## Configuring Mercado Pago Webhook

1. Log in to your Mercado Pago account
2. Go to **Your integrations** → **Webhooks**
3. Add a new webhook with:
   - **URL**: `https://your-project-ref.supabase.co/functions/v1/webhook-handler`
   - **Events**: Select "Payments"
4. Save the webhook configuration

## Testing

### Local Testing with Supabase CLI

#### 1. Start Local Supabase Environment

```bash
# Initialize Supabase locally (first time only)
supabase init

# Start all Supabase services locally
supabase start

# Expected output will show:
# - API URL: http://localhost:54321
# - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# - Studio URL: http://localhost:54323
# - Anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# - Service role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. Set Local Environment Variables

Create a `.env.local` file in `supabase/functions/webhook-handler/`:

```bash
MERCADO_PAGO_ACCESS_TOKEN=your_test_access_token
MERCADO_PAGO_WEBHOOK_SECRET=your_test_webhook_secret
```

#### 3. Serve the Function Locally

```bash
# Serve the webhook-handler function
supabase functions serve webhook-handler --env-file supabase/functions/webhook-handler/.env.local

# The function will be available at:
# http://localhost:54321/functions/v1/webhook-handler
```

#### 4. Test with cURL

**Test invalid signature (should return 401)**:
```bash
curl -X POST http://localhost:54321/functions/v1/webhook-handler \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1234567890,v1=invalid_signature" \
  -H "x-request-id: test-request-id" \
  -d '{
    "type": "payment",
    "action": "payment.created",
    "data": {
      "id": "test-payment-123"
    }
  }'

# Expected: 401 Unauthorized
```

**Test missing payment ID (should return 400)**:
```bash
curl -X POST http://localhost:54321/functions/v1/webhook-handler \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1234567890,v1=test_signature" \
  -d '{
    "type": "payment",
    "action": "payment.created",
    "data": {}
  }'

# Expected: 400 Bad Request
```

**Test OPTIONS request (CORS preflight)**:
```bash
curl -X OPTIONS http://localhost:54321/functions/v1/webhook-handler \
  -H "Origin: https://www.mercadopago.com" \
  -H "Access-Control-Request-Method: POST"

# Expected: 200 OK with CORS headers
```

### Property-Based Tests

Run the comprehensive property-based tests to verify webhook logic:

```bash
# Run all webhook handler tests
npm test src/test/webhook-handler.test.ts

# Run with verbose output
npm test src/test/webhook-handler.test.ts -- --reporter=verbose
```

These tests validate:
- **Property 3**: Valid signature acceptance
- **Property 4**: Invalid signature rejection
- **Property 5**: Approved payment status validation
- **Property 12**: Idempotent webhook processing

### Integration Testing with Mercado Pago

#### Using Mercado Pago Test Mode

1. **Get test credentials**:
   - Go to [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel/credentials)
   - Switch to **Test credentials**
   - Copy your test Access Token and Public Key

2. **Configure test webhook**:
   - Go to **Webhooks** section
   - Add webhook URL: `https://your-project-ref.supabase.co/functions/v1/webhook-handler`
   - Select **Test mode**

3. **Create test payment**:
   - Use the Checkout Page with test credentials
   - Use test credit card numbers from [Mercado Pago Test Cards](https://www.mercadopago.com.br/developers/en/docs/checkout-api/testing)
   - Example test card: `5031 4332 1540 6351` (approved)

4. **Monitor webhook execution**:
   ```bash
   # Watch Edge Function logs in real-time
   supabase functions logs webhook-handler --follow
   ```

#### Test Payment Scenarios

| Scenario | Test Card | Expected Status | Expected Behavior |
|----------|-----------|-----------------|-------------------|
| Approved payment | 5031 4332 1540 6351 | approved | Account created, magic link sent |
| Pending payment | 5031 4332 1540 6351 (with pending flag) | pending | No account created |
| Rejected payment | 5031 4332 1540 6351 (with rejection flag) | rejected | No account created |
| Duplicate webhook | Same payment_id twice | approved | Second request returns 200 OK without creating duplicate |

### Manual Testing Checklist

- [ ] Deploy Edge Function successfully
- [ ] Configure Mercado Pago webhook with correct URL
- [ ] Test approved payment creates user account
- [ ] Test approved payment creates subscription record
- [ ] Test approved payment sends magic link email
- [ ] Test duplicate webhook doesn't create duplicate account
- [ ] Test pending payment doesn't create account
- [ ] Test rejected payment doesn't create account
- [ ] Test invalid signature returns 401
- [ ] Test missing payment ID returns 400
- [ ] Verify logs show payment context on errors
- [ ] Verify CORS headers allow Mercado Pago requests

## Webhook Flow

1. **Receive Webhook**: Mercado Pago sends a POST request with payment notification
2. **Verify Signature**: Validate the `x-signature` header using HMAC-SHA256
3. **Fetch Payment Details**: Retrieve full payment information from Mercado Pago API
4. **Validate Status**: Only process payments with "approved" status
5. **Check Idempotency**: Verify if subscription already exists for this payment_id
6. **Process Payment**: Create user account and subscription record (implemented in Task 4)
7. **Return Response**: Return 200 OK to acknowledge webhook receipt

## Error Handling

The function returns the following HTTP status codes:

- **200 OK**: Webhook processed successfully (or already processed)
- **400 Bad Request**: Missing payment ID in webhook payload
- **401 Unauthorized**: Invalid or missing signature
- **405 Method Not Allowed**: Non-POST request received
- **500 Internal Server Error**: Server-side error (API failure, database error, etc.)

All errors are logged with payment context for troubleshooting.

## Security

- **Signature Verification**: All webhooks must have a valid HMAC-SHA256 signature
- **Service Role Access**: Database operations use Supabase service role for elevated permissions
- **Environment Variables**: Sensitive credentials are stored as Supabase secrets
- **CORS Configuration**: Only necessary headers are allowed

## Requirements Validated

This Edge Function validates the following requirements:

- **Requirement 4.1**: Verify x-signature header
- **Requirement 4.2**: Reject invalid signatures with 401
- **Requirement 4.3**: Retrieve full payment details from Mercado Pago
- **Requirement 4.4**: Validate payment status is "approved"
- **Requirement 10.1, 10.2**: Idempotent webhook processing
- **Requirement 11.1**: Error logging with payment context

## Next Steps

Task 4 will implement:
- User account creation using Supabase Admin API
- Subscription record storage in the database
- Magic link email sending for authentication
