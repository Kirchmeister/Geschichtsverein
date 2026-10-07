CREATE TABLE archive_message_threads (
 id TEXT PRIMARY KEY NOT NULL,
 subject TEXT NOT NULL,
 created TEXT NOT NULL,
 announcement INTEGER NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE archive_message_members (
 thread_id TEXT NOT NULL REFERENCES archive_message_threads(id),
 account_id TEXT NOT NULL REFERENCES archive_users(id),
 name TEXT NOT NULL,
 last_read_id INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(thread_id,account_id)
);
--> statement-breakpoint
CREATE INDEX idx_message_member_account ON archive_message_members(account_id,thread_id);
--> statement-breakpoint
CREATE TABLE archive_messages (
 id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
 thread_id TEXT NOT NULL REFERENCES archive_message_threads(id),
 sender_id TEXT NOT NULL REFERENCES archive_users(id),
 sender_name TEXT NOT NULL,
 body TEXT NOT NULL,
 created TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX idx_messages_thread ON archive_messages(thread_id,id);
