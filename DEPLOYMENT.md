# 🚀 Deployment Guide - Foco ENEM Payment System

This guide covers the complete deployment process for the Foco ENEM payment system, including frontend, backend (Supabase Edge Functions), and payment gateway (Mercado Pago) configuration.

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Supabase account ([Create free account](https://supabase.com))
- [ ] Mercado Pago developer account ([Create account](https://www.mercadopago.com.br/developers))
- [ ] Domain name (optional, for production)

## 🗂️ Deployment Overview

The deployment process consists of 4 main steps:

1. **Database Setup** - Create tables and configure Row Level Security
2. **Backend Deployment** - Deploy Supabase Edge Function for webhook handling
3. **Frontend Deployment** - Build and deploy React application
4. **Payment Gateway Configuration** - Configure Mercado Pago webhooks

---

## 1️⃣ Database Setup

### Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in:
   - **Name**: foco-enem (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your users (e.g., South America - São Paulo)
4. Click **Create new project**
5. Wait for project initialization (~2 minutes)

### Run Database Migrations

1. **Get your project credentials**:
   - Go to **Settings** → **API**
   - Copy:
     - Project URL (e.g., `https://bzahiysaveiyfwdegzmk.supabase.co`)
     - Project Reference ID (e.g., `bzahiysaveiyfwdegzmk`)
     - anon public key
     - service_role key (keep this secret!)

2. **Run the schema migration**:
   - Go to **SQL Editor** in Supabase Dashboard
   - Click **New query**
   - Copy the contents of `supabase_schema.sql` from your project
   - Click **Run** to execute the migration

3. **Verify tables created**:
   - Go to **Table Editor**
   - You should see the `subscriptions` table
   - Click on the table to verify columns: `id`, `user_id`, `payment_id`, `status`, `created_at`, `updated_at`

4. **Verify RLS policies**:
   - Go to **Authentication** → **Policies**
   - You should see policies for the `subscriptions` table:
     - `Users can read own subscriptions`
     - `Service role can insert subscriptions`
     - `Service role can update subscriptions`

---

## 2️⃣ Backend Deployment (Supabase Edge Function)

### Install Supabase CLI

```bash
# Install globally
npm install -g supabase

# Verify installation
supabase --version
```

### Link Your Project

```bash
# Navigate to your project directory
cd estudos-cursinho

# Link to your Supabase project
supabase link --project-ref your-project-ref

# You'll be prompted for your database password
# Enter the password you created when setting up the project
```

### Configure Mercado Pago Credentials

1. **Get Mercado Pago credentials**:
   - Go to [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel/credentials)
   - For testing: Use **Test credentials**
   - For production: Use **Production credentials**
   - Copy:
     - **Public Key** (starts with `APP_USR-` or `TEST-`)
     - **Access Token** (starts with `APP_USR-` or `TEST-`)

2. **Get Webhook Secret**:
   - Go to **Your integrations** → **Webhooks**
   - Your webhook secret is displayed in the webhook configuration
   - If you don't have one yet, you'll get it after creating the webhook (step 4)

3. **Set Edge Function secrets**:
   ```bash
   # Set Mercado Pago Access Token
   supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=your_access_token_here
   
   # Set Mercado Pago Webhook Secret
   supabase secrets set MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret_here
   ```

4. **Verify secrets**:
   ```bash
   # List all secrets (values are hidden)
   supabase secrets list
   ```

### Deploy the Edge Function

```bash
# Deploy webhook-handler function
supabase functions deploy webhook-handler

# Expected output:
# Deploying webhook-handler (project ref: your-project-ref)
# Deployed Function webhook-handler
# Function URL: https://your-project-ref.supabase.co/functions/v1/webhook-handler
```

**Save the Function URL** - you'll need it for Mercado Pago webhook configuration.

### Test the Edge Function

```bash
# Test with a simple request (should return 405 Method Not Allowed)
curl -X GET https://your-project-ref.supabase.co/functions/v1/webhook-handler

# Test OPTIONS request (CORS preflight - should return 200 OK)
curl -X OPTIONS https://your-project-ref.supabase.co/functions/v1/webhook-handler
```

---

## 3️⃣ Frontend Deployment

### Configure Environment Variables

1. **Create production `.env` file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your credentials**:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
   
   # Mercado Pago Configuration
   VITE_MERCADO_PAGO_PUBLIC_KEY=your_public_key_here
   ```

### Build the Application

```bash
# Install dependencies
npm install

# Run tests to verify everything works
npm test

# Build for production
npm run build

# The build output will be in the `dist/` directory
```

### Deploy to Hosting Provider

#### Option A: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   
   # Follow the prompts:
   # - Set up and deploy? Yes
   # - Which scope? Your account
   # - Link to existing project? No
   # - Project name? foco-enem
   # - Directory? ./
   # - Override settings? No
   ```

3. **Configure environment variables in Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_MERCADO_PAGO_PUBLIC_KEY`

4. **Redeploy**:
   ```bash
   vercel --prod
   ```

#### Option B: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod
   
   # Follow the prompts:
   # - Publish directory? dist
   ```

3. **Configure environment variables**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Select your site
   - Go to **Site settings** → **Environment variables**
   - Add the same variables as Vercel

#### Option C: GitHub Pages

1. **Update `vite.config.ts`**:
   ```typescript
   export default defineConfig({
     base: '/estudos-cursinho/', // Your repo name
     // ... rest of config
   });
   ```

2. **Build and deploy**:
   ```bash
   npm run build
   
   # Deploy to gh-pages branch
   npx gh-pages -d dist
   ```

3. **Configure GitHub Pages**:
   - Go to your repository → **Settings** → **Pages**
   - Source: Deploy from branch `gh-pages`
   - Save

---

## 4️⃣ Payment Gateway Configuration

### Configure Mercado Pago Webhook

1. **Go to Mercado Pago Developers**:
   - Visit [Mercado Pago Webhooks](https://www.mercadopago.com.br/developers/panel/webhooks)

2. **Add new webhook**:
   - Click **Add new webhook**
   - Configure:
     - **Production URL**: `https://your-project-ref.supabase.co/functions/v1/webhook-handler`
     - **Events to receive**: Select **Payments**
     - **Version**: v1
   - Click **Save**

3. **Copy Webhook Secret**:
   - After saving, you'll see your webhook secret
   - If you haven't set it yet, update the Edge Function secret:
     ```bash
     supabase secrets set MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret_here
     ```

4. **Test the webhook**:
   - Mercado Pago provides a "Send test" button
   - Click it to send a test notification
   - Check Edge Function logs:
     ```bash
     supabase functions logs webhook-handler --follow
     ```

### Update Redirect URLs

Update the success and failure redirect URLs in your checkout code:

1. Open `src/components/CheckoutPage.tsx`
2. Update the redirect URLs to your production domain:
   ```typescript
   back_urls: {
     success: 'https://your-domain.com/success',
     failure: 'https://your-domain.com/success?status=rejected',
     pending: 'https://your-domain.com/success?status=pending',
   },
   ```

3. Redeploy the frontend

---

## ✅ Verification Checklist

### Database
- [ ] Supabase project created
- [ ] `subscriptions` table exists with correct schema
- [ ] RLS policies are enabled and configured
- [ ] Can query subscriptions table from SQL Editor

### Backend (Edge Function)
- [ ] Supabase CLI installed and linked
- [ ] Edge Function secrets configured (MERCADO_PAGO_ACCESS_TOKEN, MERCADO_PAGO_WEBHOOK_SECRET)
- [ ] Edge Function deployed successfully
- [ ] Function URL accessible (returns 405 for GET requests)
- [ ] Function logs are visible in Supabase Dashboard

### Frontend
- [ ] Environment variables configured
- [ ] Application builds without errors
- [ ] Application deployed to hosting provider
- [ ] Landing page loads correctly
- [ ] Checkout page loads correctly
- [ ] Success page loads correctly
- [ ] Can navigate between pages

### Payment Gateway
- [ ] Mercado Pago webhook configured with Edge Function URL
- [ ] Webhook secret matches Edge Function secret
- [ ] Test webhook sends successfully
- [ ] Redirect URLs point to production domain

---

## 🧪 End-to-End Testing

### Test the Complete Payment Flow

1. **Visit your landing page**:
   - Go to `https://your-domain.com`
   - Verify the landing page loads correctly
   - Click "Assinar Agora" button

2. **Test checkout**:
   - Enter a test email address
   - Click "Prosseguir para Pagamento"
   - Verify redirect to Mercado Pago checkout

3. **Complete test payment**:
   - Use a test credit card (if in test mode):
     - Card: `5031 4332 1540 6351`
     - Expiry: Any future date
     - CVV: Any 3 digits
     - Name: Any name
   - Complete the payment

4. **Verify webhook processing**:
   ```bash
   # Watch Edge Function logs
   supabase functions logs webhook-handler --follow
   ```
   - You should see:
     - Webhook received
     - Signature verified
     - Payment status validated
     - User account created
     - Subscription record created
     - Magic link sent

5. **Check success page**:
   - After payment, you should be redirected to `/success`
   - Verify the success message displays correctly

6. **Check email**:
   - Open the email inbox for the test email address
   - You should receive a magic link email from Supabase
   - Click the magic link

7. **Verify dashboard access**:
   - After clicking magic link, you should be redirected to `/dashboard`
   - Verify you can access the dashboard
   - Verify the dashboard loads correctly

8. **Verify database records**:
   - Go to Supabase Dashboard → **Table Editor** → `subscriptions`
   - You should see a new subscription record with:
     - `user_id`: UUID of the created user
     - `payment_id`: Mercado Pago payment ID
     - `status`: "approved"
     - `created_at`: Timestamp of creation

---

## 🔧 Troubleshooting

### Edge Function Issues

**Problem**: Function deployment fails
```bash
# Solution: Check if you're linked to the correct project
supabase projects list
supabase link --project-ref your-project-ref
```

**Problem**: Webhook signature verification fails
```bash
# Solution: Verify webhook secret matches
supabase secrets list
supabase secrets set MERCADO_PAGO_WEBHOOK_SECRET=correct_secret
```

**Problem**: User account creation fails
```bash
# Solution: Check Edge Function logs
supabase functions logs webhook-handler --follow

# Verify service role key is available
# (It should be automatically available in Edge Functions)
```

### Frontend Issues

**Problem**: Environment variables not working
- Ensure variables start with `VITE_` prefix
- Rebuild the application after changing `.env`
- Verify variables are set in hosting provider dashboard

**Problem**: Checkout redirect fails
- Verify `VITE_MERCADO_PAGO_PUBLIC_KEY` is correct
- Check browser console for errors
- Verify Mercado Pago API is accessible

### Payment Issues

**Problem**: Webhook not receiving notifications
- Verify webhook URL is correct in Mercado Pago dashboard
- Check Edge Function logs for incoming requests
- Ensure webhook is configured for "Payments" events

**Problem**: Duplicate accounts created
- This should not happen due to idempotency logic
- Check Edge Function logs for duplicate payment_id
- Verify unique constraint on `payment_id` in database

---

## 📊 Monitoring

### Edge Function Logs

```bash
# Stream logs in real-time
supabase functions logs webhook-handler --follow

# View recent logs
supabase functions logs webhook-handler --limit 100
```

### Database Monitoring

- Go to Supabase Dashboard → **Database** → **Query Performance**
- Monitor subscription queries
- Check for slow queries or errors

### Payment Monitoring

- Go to Mercado Pago Dashboard → **Transactions**
- Monitor payment status
- Check for failed or pending payments

---

## 🔐 Security Checklist

- [ ] Service role key is never exposed to frontend
- [ ] Webhook secret is stored as Edge Function secret
- [ ] RLS policies are enabled on all tables
- [ ] CORS is configured correctly in Edge Function
- [ ] Environment variables are not committed to Git
- [ ] Production credentials are used in production (not test credentials)
- [ ] HTTPS is enforced on all endpoints

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Mercado Pago API Documentation](https://www.mercadopago.com.br/developers/en/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Documentation](https://reactrouter.com)

---

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Edge Function logs: `supabase functions logs webhook-handler`
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
5. Ensure database schema is up to date

---

**Deployment complete! 🎉**

Your payment system is now live and ready to accept payments.
