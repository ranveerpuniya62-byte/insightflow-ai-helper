
-- =========== ROLES ===========
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- =========== PROFILES ===========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =========== CREDITS ===========
CREATE TABLE public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  chats_remaining INT NOT NULL DEFAULT 10,
  homework_remaining INT NOT NULL DEFAULT 10,
  image_credits_remaining INT NOT NULL DEFAULT 5,
  reset_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.user_credits TO authenticated;
GRANT ALL ON public.user_credits TO service_role;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own credits read" ON public.user_credits FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- =========== CHAT ===========
CREATE TABLE public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_threads TO authenticated;
GRANT ALL ON public.chat_threads TO service_role;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own threads" ON public.chat_threads FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_thread_idx ON public.chat_messages(thread_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chat messages" ON public.chat_messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========== HISTORY ===========
CREATE TABLE public.history_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('homework','analysis','generation')),
  title TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX history_items_user_idx ON public.history_items(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.history_items TO authenticated;
GRANT ALL ON public.history_items TO service_role;
ALTER TABLE public.history_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own history" ON public.history_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========== CONTACT ===========
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can send contact" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

-- =========== TRIGGER: on signup, create profile + credits + role ===========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles(id, full_name, avatar_url)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_credits(user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========== helper to reset credits when expired ===========
CREATE OR REPLACE FUNCTION public.ensure_credits(_uid UUID)
RETURNS public.user_credits LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.user_credits;
BEGIN
  INSERT INTO public.user_credits(user_id) VALUES (_uid) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO r FROM public.user_credits WHERE user_id = _uid;
  IF r.reset_at <= now() THEN
    UPDATE public.user_credits
      SET chats_remaining = 10, homework_remaining = 10, image_credits_remaining = 5,
          reset_at = now() + interval '24 hours', updated_at = now()
      WHERE user_id = _uid RETURNING * INTO r;
  END IF;
  RETURN r;
END; $$;

CREATE OR REPLACE FUNCTION public.consume_credit(_uid UUID, _kind TEXT)
RETURNS public.user_credits LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.user_credits;
BEGIN
  r := public.ensure_credits(_uid);
  IF _kind = 'chat' THEN
    IF r.chats_remaining <= 0 THEN RAISE EXCEPTION 'no_credits'; END IF;
    UPDATE public.user_credits SET chats_remaining = chats_remaining - 1, updated_at = now() WHERE user_id = _uid RETURNING * INTO r;
  ELSIF _kind = 'homework' THEN
    IF r.homework_remaining <= 0 THEN RAISE EXCEPTION 'no_credits'; END IF;
    UPDATE public.user_credits SET homework_remaining = homework_remaining - 1, updated_at = now() WHERE user_id = _uid RETURNING * INTO r;
  ELSIF _kind = 'image' THEN
    IF r.image_credits_remaining <= 0 THEN RAISE EXCEPTION 'no_credits'; END IF;
    UPDATE public.user_credits SET image_credits_remaining = image_credits_remaining - 1, updated_at = now() WHERE user_id = _uid RETURNING * INTO r;
  ELSE
    RAISE EXCEPTION 'bad_kind';
  END IF;
  RETURN r;
END; $$;
