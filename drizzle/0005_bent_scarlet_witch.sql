CREATE TABLE `archive_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`parent_id` text,
	`author_id` text,
	`author_name` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created` text NOT NULL,
	`reviewed_by` text,
	`reviewed_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_comments_entry_status` ON `archive_comments` (`entry_id`,`status`,`created`);--> statement-breakpoint
CREATE INDEX `idx_comments_status_created` ON `archive_comments` (`status`,`created`);