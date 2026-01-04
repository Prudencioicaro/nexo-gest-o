-- Notion Pedrada - Supabase Schema (Anti-Recursion Version)

-- 1. Tables (Idempotent)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS board_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'viewer',
  UNIQUE(board_id, user_id)
);

CREATE TABLE IF NOT EXISTS board_columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  options JSONB,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  data_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  position FLOAT DEFAULT 0
);

-- 2. Security Functions (The Loop Breakers)
CREATE OR REPLACE FUNCTION public.check_board_access(target_board_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM boards b 
    WHERE b.id = target_board_id AND b.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM board_members bm 
    WHERE bm.board_id = target_board_id AND bm.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RLS Enable
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 4. Clean and Apply Policies
DO $$ 
BEGIN
    -- This block ensures we don't have duplicate policies
    EXECUTE (SELECT 'DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON ' || quote_ident(tablename) 
             FROM pg_policies WHERE schemaname = 'public');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Boards
CREATE POLICY "boards_select" ON boards FOR SELECT USING (owner_id = auth.uid() OR id IN (SELECT board_id FROM board_members WHERE user_id = auth.uid()));
CREATE POLICY "boards_insert" ON boards FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "boards_update" ON boards FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "boards_delete" ON boards FOR DELETE USING (owner_id = auth.uid());

-- Board Members
CREATE POLICY "members_select" ON board_members FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM boards WHERE id = board_id AND owner_id = auth.uid()));
CREATE POLICY "members_insert" ON board_members FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM boards WHERE id = board_id AND owner_id = auth.uid()));

-- Columns & Tasks (Using the helper function)
CREATE POLICY "columns_all" ON board_columns FOR ALL USING (public.check_board_access(board_id));
CREATE POLICY "tasks_all" ON tasks FOR ALL USING (public.check_board_access(board_id));

-- 5. Auto-Owner Trigger
CREATE OR REPLACE FUNCTION public.handle_new_board() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.board_members (board_id, user_id, role)
  VALUES (new.id, new.owner_id, 'owner');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_board_created ON public.boards;
CREATE TRIGGER on_board_created
  AFTER INSERT ON public.boards
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_board();
