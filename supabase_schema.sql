-- ============================================================
-- Foco ENEM — Supabase Schema
-- Run this in Supabase SQL Editor (new query)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. SUBJECTS (Matérias)
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#818cf8',
  icon TEXT,
  "order" INTEGER DEFAULT 0,
  target_topics INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own subjects"
  ON subjects FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_subjects_user ON subjects(user_id);

-- ============================================================
-- 2. TOPICS (Tópicos de estudo)
-- ============================================================
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_studied BOOLEAN NOT NULL DEFAULT FALSE,
  is_exercises_done BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  review_date TIMESTAMPTZ,
  notes TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  review_count INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own topics"
  ON topics FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_topics_user ON topics(user_id);
CREATE INDEX idx_topics_subject ON topics(subject_id);
CREATE INDEX idx_topics_review ON topics(user_id, review_date) WHERE review_date IS NOT NULL;

-- ============================================================
-- 3. SIMULADOS
-- ============================================================
CREATE TABLE IF NOT EXISTS simulados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scores JSONB NOT NULL DEFAULT '{}',
  total INTEGER NOT NULL,
  label TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE simulados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own simulados"
  ON simulados FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_simulados_user ON simulados(user_id);

-- ============================================================
-- 4. NOTES (Anotações)
-- ============================================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own notes"
  ON notes FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_notes_user ON notes(user_id);
CREATE INDEX idx_notes_pinned ON notes(user_id, pinned) WHERE pinned = TRUE;

-- ============================================================
-- 5. FLASHCARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  next_review TIMESTAMPTZ,
  interval_days INTEGER NOT NULL DEFAULT 1,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  repetitions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own flashcards"
  ON flashcards FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_flashcards_user ON flashcards(user_id);
CREATE INDEX idx_flashcards_due ON flashcards(user_id, next_review) WHERE next_review IS NOT NULL;

-- ============================================================
-- 6. STUDY_CYCLES
-- ============================================================
CREATE TABLE IF NOT EXISTS study_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject_ids UUID[] NOT NULL DEFAULT '{}',
  pomodoros_per_subject INTEGER NOT NULL DEFAULT 1,
  loop BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE study_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own study_cycles"
  ON study_cycles FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_cycles_user ON study_cycles(user_id);

-- ============================================================
-- 7. ACTIVE_CYCLE_STATE
-- ============================================================
CREATE TABLE IF NOT EXISTS active_cycle_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES study_cycles(id) ON DELETE CASCADE,
  current_index INTEGER NOT NULL DEFAULT 0,
  pomodoros_in_current_subject INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE active_cycle_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own active_cycle_states"
  ON active_cycle_states FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_active_cycle_user ON active_cycle_states(user_id);

-- ============================================================
-- 8. SCHEDULE_CELLS
-- ============================================================
CREATE TABLE IF NOT EXISTS schedule_cells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day BETWEEN 0 AND 6),
  hour INTEGER NOT NULL CHECK (hour BETWEEN 0 AND 23),
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE schedule_cells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own schedule_cells"
  ON schedule_cells FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_schedule_user ON schedule_cells(user_id);
CREATE UNIQUE INDEX idx_schedule_user_day_hour ON schedule_cells(user_id, day, hour);

-- ============================================================
-- 9. WEEKLY_GOALS
-- ============================================================
CREATE TABLE IF NOT EXISTS weekly_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('topics', 'pomodoros', 'simulados', 'revisoes')),
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  target INTEGER NOT NULL,
  week_start TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE weekly_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own weekly_goals"
  ON weekly_goals FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_goals_user ON weekly_goals(user_id);
CREATE INDEX idx_goals_week ON weekly_goals(user_id, week_start);

-- ============================================================
-- 10. REDACOES
-- ============================================================
CREATE TABLE IF NOT EXISTS redacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  competencias JSONB NOT NULL DEFAULT '{}',
  total_score INTEGER NOT NULL DEFAULT 0,
  theme TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE redacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own redacoes"
  ON redacoes FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_redacoes_user ON redacoes(user_id);

-- ============================================================
-- 11. QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  statement TEXT NOT NULL,
  alternatives JSONB NOT NULL DEFAULT '{}',
  answer TEXT NOT NULL CHECK (answer IN ('a', 'b', 'c', 'd', 'e')),
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  subject_name TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own questions"
  ON questions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_questions_user ON questions(user_id);
CREATE INDEX idx_questions_subject ON questions(subject_id);

-- ============================================================
-- 12. QUESTION_ATTEMPTS
-- ============================================================
CREATE TABLE IF NOT EXISTS question_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own question_attempts"
  ON question_attempts FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_attempts_user ON question_attempts(user_id);
CREATE INDEX idx_attempts_question ON question_attempts(question_id);

-- ============================================================
-- 13. POMODORO_SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL
);

ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own pomodoro_sessions"
  ON pomodoro_sessions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_pomodoro_user ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_completed ON pomodoro_sessions(user_id, completed_at);

-- ============================================================
-- 14. USER_SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pomodoro_work_minutes INTEGER NOT NULL DEFAULT 25,
  pomodoro_break_minutes INTEGER NOT NULL DEFAULT 5,
  review_interval_days INTEGER NOT NULL DEFAULT 15,
  notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  theme TEXT NOT NULL DEFAULT 'dark',
  enem_date TEXT NOT NULL DEFAULT '2026-11-01T13:00:00Z',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own settings"
  ON user_settings FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE UNIQUE INDEX idx_settings_user ON user_settings(user_id);

-- ============================================================
-- 15. TRIGGERS for updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER flashcards_updated_at BEFORE UPDATE ON flashcards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER active_cycle_states_updated_at BEFORE UPDATE ON active_cycle_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER redacoes_updated_at BEFORE UPDATE ON redacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 16. SUBSCRIPTIONS (Payment System)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscription records
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Service role can insert and update subscription records
CREATE POLICY "Service role can insert subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can update subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_payment ON subscriptions(payment_id);

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
