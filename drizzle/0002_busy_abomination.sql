CREATE TABLE `archive_users` (
	`id` text PRIMARY KEY NOT NULL,
	`identity_provider` text NOT NULL,
	`identity_subject` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_archive_users_identity` ON `archive_users` (`identity_provider`,`identity_subject`);--> statement-breakpoint
ALTER TABLE `entries` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `entries` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `entries` ADD `publication_status` text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` ADD `approved_version` integer;--> statement-breakpoint
ALTER TABLE `entries` ADD `approved_by` text;--> statement-breakpoint
ALTER TABLE `entries` ADD `approved_at` text;--> statement-breakpoint
ALTER TABLE `entry_versions` ADD `actor_id` text;--> statement-breakpoint
ALTER TABLE `entry_versions` ADD `actor_name` text;--> statement-breakpoint
CREATE INDEX `idx_entry_versions_actor` ON `entry_versions` (`actor_id`,`version`);