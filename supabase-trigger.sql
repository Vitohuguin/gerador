-- Rode este SQL no Supabase SQL Editor (https://supabase.com/dashboard/project/ektzitvnmdxfzvtntdiw/sql/new)

-- Trigger: quando um usuário confirmar o email, cria o registro em public.users automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, plan, "createdAt")
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'none',
    to_char(NEW.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
