CREATE TABLE archive_contact_challenges(id TEXT PRIMARY KEY, data TEXT NOT NULL, source TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE INDEX archive_contact_challenges_expiry ON archive_contact_challenges(expires);
CREATE TABLE archive_contact_limits(id TEXT PRIMARY KEY, expires INTEGER NOT NULL, attempts INTEGER NOT NULL);
CREATE TABLE archive_contact_outbox(id TEXT PRIMARY KEY, data TEXT NOT NULL, state TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, next_at INTEGER NOT NULL, lease TEXT, created INTEGER NOT NULL);
CREATE INDEX archive_contact_outbox_due ON archive_contact_outbox(state,next_at);
