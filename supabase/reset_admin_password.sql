-- ============================================================
-- Foco ENEM — Reset Admin Password
-- Run this in the Supabase SQL Editor (new query)
-- ============================================================

-- Redefine a senha do admin@focoenem.com diretamente no banco.
-- Altere NEW_PASSWORD abaixo para a senha desejada antes de executar.

DO $$
DECLARE
  target_email TEXT := 'admin@focoenem.com';
  new_password TEXT := 'admin123'; -- 👈 MUDE AQUI para a nova senha
  rows_updated INT;
BEGIN
  UPDATE auth.users
  SET
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at         = NOW()
  WHERE email = target_email;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;

  IF rows_updated = 0 THEN
    RAISE EXCEPTION 'Usuário % não encontrado em auth.users.', target_email;
  ELSE
    RAISE NOTICE 'Senha redefinida com sucesso para o usuário %.', target_email;
  END IF;
END $$;
