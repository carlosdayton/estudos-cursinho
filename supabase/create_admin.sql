-- ============================================================
-- Foco ENEM — Create Admin / Test User Script
-- Run this in the Supabase SQL Editor (new query)
-- ============================================================

-- OPTION A: Create a brand new admin user and approve their subscription
-- Email: admin@focoenem.com
-- Password: admin123 (You can change this below)

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  admin_email TEXT := 'admin@focoenem.com';
  admin_password TEXT := 'admin123';
BEGIN
  -- 1. Insert into auth.users (if the user does not exist yet)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"admin"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    RAISE NOTICE 'User % created successfully.', admin_email;
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = admin_email;
    RAISE NOTICE 'User % already exists with ID %.', admin_email, new_user_id;
  END IF;

  -- 2. Insert/upgrade their subscription to 'approved' if not already done
  IF NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = new_user_id AND status = 'approved') THEN
    INSERT INTO public.subscriptions (user_id, payment_id, status)
    VALUES (
      new_user_id,
      'admin-bypass-' || gen_random_uuid(),
      'approved'
    );
    RAISE NOTICE 'Subscription approved for user %.', admin_email;
  ELSE
    RAISE NOTICE 'User % already has an approved subscription.', admin_email;
  END IF;
END $$;


-- ============================================================
-- OPTION B: Upgrade an existing user's subscription
-- If you already registered a user via the UI and want to approve them:
-- Un-comment and run the lines below (replacing the email):
-- ============================================================

-- DO $$
-- DECLARE
--   target_user_id UUID;
--   target_email TEXT := 'your-registered-email@example.com';
-- BEGIN
--   SELECT id INTO target_user_id FROM auth.users WHERE email = target_email LIMIT 1;
-- 
--   IF target_user_id IS NOT NULL THEN
--     IF NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = target_user_id AND status = 'approved') THEN
--       INSERT INTO public.subscriptions (user_id, payment_id, status)
--       VALUES (
--         target_user_id,
--         'admin-bypass-' || gen_random_uuid(),
--         'approved'
--       );
--       RAISE NOTICE 'Subscription approved for existing user %.', target_email;
--     ELSE
--       RAISE NOTICE 'User % already has an approved subscription.', target_email;
--     END IF;
--   ELSE
--     RAISE NOTICE 'User % not found in auth.users.', target_email;
--   END IF;
-- END $$;

