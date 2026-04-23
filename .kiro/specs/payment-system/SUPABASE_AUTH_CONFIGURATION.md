# Supabase Auth Configuration for Magic Link Authentication

This document describes the required Supabase Auth configuration for the payment system's magic link authentication flow.

## Overview

The payment system uses Supabase Auth's magic link feature to provide passwordless authentication. When a user completes payment, the webhook handler generates a magic link and sends it via email. The user clicks the link to authenticate and access the platform.

## Configuration Steps

### 1. Magic Link Expiration Duration

**Location**: Supabase Dashboard → Authentication → Settings → Auth Settings

**Setting**: `MAILER_AUTOCONFIRM_EXPIRY`

**Recommended Value**: `3600` (1 hour)

**Description**: Controls how long the magic link remains valid after generation. A 1-hour expiration provides a balance between security and user convenience.

**Validates**: Requirement 6.3 - Magic link expires after configured duration

### 2. Email Template Configuration

**Location**: Supabase Dashboard → Authentication → Email Templates → Magic Link

**Template Variables Available**:
- `{{ .ConfirmationURL }}` - The magic link URL
- `{{ .SiteURL }}` - Your application's site URL
- `{{ .Token }}` - The authentication token
- `{{ .TokenHash }}` - Hashed version of the token

**Recommended Email Template**:

```html
<h2>Bem-vindo ao Foco ENEM!</h2>

<p>Seu pagamento foi confirmado com sucesso. Clique no link abaixo para acessar a plataforma:</p>

<p><a href="{{ .ConfirmationURL }}">Acessar Plataforma</a></p>

<p>Este link expira em 1 hora por motivos de segurança.</p>

<p>Se você não solicitou este acesso, ignore este email.</p>

<p>Bons estudos!<br>Equipe Foco ENEM</p>
```

**Subject Line**: `Acesse sua conta Foco ENEM`

**Validates**: Requirement 6.2 - Auth_Service sends Magic_Link to user's email address

### 3. Redirect URL Configuration

**Location**: Supabase Dashboard → Authentication → URL Configuration

**Setting**: `SITE_URL`

**Value**: Your production domain (e.g., `https://focoenem.com.br`)

**For Development**: `http://localhost:5173`

**Description**: This is the base URL where users will be redirected after clicking the magic link. The AuthContext's `onAuthStateChange` listener will handle the authentication callback automatically.

**Additional Redirect URLs**: Add your production and development URLs to the "Redirect URLs" allowlist:
- `http://localhost:5173/**`
- `https://focoenem.com.br/**`

**Validates**: Requirement 6.5 - Successful authentication redirects to dashboard

### 4. Email Provider Configuration

**Location**: Supabase Dashboard → Project Settings → Auth → Email

**Options**:
1. **Use Supabase's SMTP server** (default, limited to 3 emails/hour in free tier)
2. **Custom SMTP provider** (recommended for production)

**For Production - Custom SMTP Setup**:
- **Provider**: Use a reliable email service (SendGrid, AWS SES, Mailgun, etc.)
- **SMTP Host**: Your provider's SMTP host
- **SMTP Port**: Usually 587 (TLS) or 465 (SSL)
- **SMTP User**: Your SMTP username
- **SMTP Password**: Your SMTP password
- **Sender Email**: `noreply@focoenem.com.br` (or your domain)
- **Sender Name**: `Foco ENEM`

**Important**: Configure SPF, DKIM, and DMARC records for your domain to improve email deliverability and prevent emails from going to spam.

### 5. Auth Settings

**Location**: Supabase Dashboard → Authentication → Settings

**Required Settings**:

| Setting | Value | Description |
|---------|-------|-------------|
| Enable Email Confirmations | ✅ Enabled | Required for magic link flow |
| Enable Email Provider | ✅ Enabled | Allows email-based authentication |
| Disable Email Signups | ❌ Disabled | Allow new users to sign up via email |
| Mailer Secure Email Change | ✅ Enabled | Require email confirmation for email changes |
| Enable Phone Confirmations | ❌ Disabled | Not used in this system |

### 6. Environment Variables

The following environment variables must be configured:

**Frontend (.env)**:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Edge Function Secrets** (configured via Supabase CLI or Dashboard):
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MERCADO_PAGO_ACCESS_TOKEN=your-mercado-pago-access-token
MERCADO_PAGO_WEBHOOK_SECRET=your-webhook-secret
```

## How Magic Link Authentication Works

### Flow Diagram

```
1. User completes payment on Mercado Pago
   ↓
2. Mercado Pago sends webhook to Edge Function
   ↓
3. Edge Function verifies payment and creates user account
   ↓
4. Edge Function calls supabase.auth.admin.generateLink()
   ↓
5. Supabase sends magic link email to user
   ↓
6. User clicks magic link in email
   ↓
7. Browser navigates to app with auth token in URL
   ↓
8. AuthContext's onAuthStateChange listener detects new session
   ↓
9. User is authenticated and redirected to /dashboard
```

### Code Implementation

The magic link authentication is handled automatically by the existing `AuthContext.tsx`:

```typescript
useEffect(() => {
  // Restore existing session on mount
  supabase.auth.getSession().then(({ data }) => {
    setSession(data.session);
    setUser(data.session?.user ?? null);
    setLoading(false);
  });

  // Listen for auth state changes (login, logout, token refresh)
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);
```

When a user clicks the magic link:
1. The browser navigates to your app with the auth token in the URL
2. Supabase JS SDK automatically extracts the token
3. `onAuthStateChange` fires with the new authenticated session
4. The `AuthContext` updates the user state
5. The `ProtectedRoute` component allows access to `/dashboard`

**No additional code is required** - the magic link flow is fully handled by Supabase Auth and the existing AuthContext implementation.

## Testing Magic Link Flow

### Manual Testing

1. **Trigger a test payment**:
   - Use Mercado Pago's test mode
   - Complete a test payment with a valid email address

2. **Check webhook processing**:
   - Verify webhook handler logs show successful processing
   - Confirm user account was created in Supabase Auth
   - Confirm subscription record was created in database

3. **Check email delivery**:
   - Verify magic link email was sent to the user's email
   - Check spam folder if email doesn't arrive
   - Verify email template renders correctly

4. **Test magic link authentication**:
   - Click the magic link in the email
   - Verify browser redirects to your app
   - Verify user is authenticated (check AuthContext state)
   - Verify user is redirected to `/dashboard`
   - Verify user can access protected platform features

5. **Test magic link expiration**:
   - Wait for the expiration duration (1 hour by default)
   - Try clicking an expired magic link
   - Verify appropriate error message is displayed

### Troubleshooting

**Magic link email not received**:
- Check Supabase logs for email sending errors
- Verify SMTP configuration is correct
- Check spam/junk folder
- Verify email address is valid
- Check email provider rate limits

**Magic link doesn't authenticate**:
- Verify `SITE_URL` matches your app's domain
- Check that redirect URL is in the allowlist
- Verify browser allows cookies (required for session)
- Check browser console for errors
- Verify Supabase Auth is properly initialized

**User redirected but not authenticated**:
- Check AuthContext is properly wrapping the app
- Verify `onAuthStateChange` listener is active
- Check for JavaScript errors in console
- Verify Supabase client is initialized with correct credentials

## Security Considerations

1. **Magic Link Expiration**: Keep expiration time reasonable (1 hour recommended). Shorter times are more secure but less convenient.

2. **HTTPS Required**: Magic links should only be used over HTTPS in production to prevent token interception.

3. **One-Time Use**: Supabase magic links are single-use by default. Once clicked, the link becomes invalid.

4. **Email Verification**: The webhook handler sets `email_confirm: true` when creating users, so email verification is automatic.

5. **Rate Limiting**: Supabase has built-in rate limiting for auth endpoints. Monitor for abuse.

## Requirements Validation

This configuration validates the following requirements:

- **Requirement 6.1**: Auth_Service generates Magic_Link when user account is created ✅
- **Requirement 6.2**: Auth_Service sends Magic_Link to user's email address ✅
- **Requirement 6.3**: Magic_Link expires after configured duration ✅
- **Requirement 6.4**: User clicks Magic_Link to authenticate ✅
- **Requirement 6.5**: Successful authentication redirects to dashboard ✅

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Magic Link Authentication](https://supabase.com/docs/guides/auth/auth-magic-link)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Auth Configuration](https://supabase.com/docs/reference/javascript/auth-admin-generatelink)
