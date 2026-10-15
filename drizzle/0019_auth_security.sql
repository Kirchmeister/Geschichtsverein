CREATE TABLE IF NOT EXISTS linux_sessions(id TEXT PRIMARY KEY,account_id TEXT NOT NULL,created INTEGER NOT NULL,expires INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_linux_sessions_expiry ON linux_sessions(expires);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_linux_sessions_account ON linux_sessions(account_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS linux_auth_limits(id TEXT PRIMARY KEY,expires INTEGER NOT NULL,attempts INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_linux_auth_limits_expiry ON linux_auth_limits(expires);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS linux_challenge_context(hash TEXT PRIMARY KEY,owner TEXT NOT NULL,source TEXT NOT NULL,expires INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_linux_challenge_context_source ON linux_challenge_context(source);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_linux_challenge_context_owner ON linux_challenge_context(owner);
--> statement-breakpoint
