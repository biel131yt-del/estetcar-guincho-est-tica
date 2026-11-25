CREATE TABLE IF NOT EXISTS admin_access (id integer PRIMARY KEY CHECK (id = 1), password_hash text);
INSERT INTO admin_access (id) VALUES (1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS admin_login_attempts (client_key text PRIMARY KEY, window_start bigint NOT NULL, attempts integer NOT NULL);