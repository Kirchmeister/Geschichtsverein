CREATE TABLE archive_message_references (
 thread_id TEXT PRIMARY KEY NOT NULL REFERENCES archive_message_threads(id),
 entry_id TEXT NOT NULL REFERENCES entries(id),
 review_key TEXT
);
--> statement-breakpoint
CREATE INDEX idx_message_reference_entry ON archive_message_references(entry_id,review_key);
