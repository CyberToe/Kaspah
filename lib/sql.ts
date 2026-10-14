export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS countries (
  code text PRIMARY KEY,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  token_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name text,
  country_code text REFERENCES countries(code),
  timezone text,
  date_of_birth text,
  personal_touches jsonb,
  disclaimer_acknowledged_at timestamptz,
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lottos (
  id text PRIMARY KEY,
  name text NOT NULL,
  country_code text NOT NULL REFERENCES countries(code),
  jurisdiction_note text,
  main_count integer NOT NULL,
  main_min integer NOT NULL,
  main_max integer NOT NULL,
  bonus_count integer NOT NULL,
  bonus_min integer,
  bonus_max integer,
  bonus_from_main_pool boolean NOT NULL,
  draw_days jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_lotto_selections (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lotto_id text NOT NULL REFERENCES lottos(id),
  selected_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lotto_id)
);

CREATE TABLE IF NOT EXISTS prediction_requests (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lotto_id text NOT NULL REFERENCES lottos(id),
  requested_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL,
  provider_name text NOT NULL,
  provider_version text NOT NULL
);

CREATE TABLE IF NOT EXISTS predictions (
  id text PRIMARY KEY,
  request_id text NOT NULL UNIQUE REFERENCES prediction_requests(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lotto_id text NOT NULL REFERENCES lottos(id),
  outcome text NOT NULL,
  main_numbers jsonb,
  bonus_numbers jsonb,
  sentiment_message text,
  personal_note text,
  confidence_level integer,
  refusal_message text,
  lotto_name text NOT NULL,
  country_name text NOT NULL,
  draw_days jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);

CREATE TABLE IF NOT EXISTS kaspah_lines (
  id text PRIMARY KEY,
  kind text NOT NULL,
  confidence_level integer,
  body text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS share_links (
  id text PRIMARY KEY,
  prediction_id text NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  is_revoked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE TABLE IF NOT EXISTS guest_prediction_requests (
  id text PRIMARY KEY,
  country_code text NOT NULL REFERENCES countries(code),
  lotto_id text NOT NULL REFERENCES lottos(id),
  requested_at timestamptz NOT NULL DEFAULT now(),
  reveal_at timestamptz NOT NULL,
  status text NOT NULL,
  outcome text,
  provider_name text NOT NULL,
  provider_version text NOT NULL,
  main_numbers jsonb,
  bonus_numbers jsonb,
  sentiment_message text,
  confidence_level integer,
  refusal_message text,
  lotto_name text NOT NULL,
  country_name text NOT NULL,
  draw_days jsonb NOT NULL,
  error_message text
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS predictions_user_created ON predictions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS requests_user_requested ON prediction_requests (user_id, requested_at DESC);
`;

export const TRIGGER_SQL = `
CREATE OR REPLACE FUNCTION enforce_selection_country()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM profiles p
    JOIN lottos l ON l.id = NEW.lotto_id
    WHERE p.user_id = NEW.user_id
      AND p.country_code IS NOT NULL
      AND p.country_code = l.country_code
  ) THEN
    RAISE EXCEPTION 'lotto country does not match profile country';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS selection_country_guard ON user_lotto_selections;
CREATE TRIGGER selection_country_guard
BEFORE INSERT OR UPDATE ON user_lotto_selections
FOR EACH ROW EXECUTE FUNCTION enforce_selection_country();
`;
