CREATE TABLE `archive_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `entries` ADD `requested_version` integer;--> statement-breakpoint
ALTER TABLE `entries` ADD `requested_by` text;--> statement-breakpoint
ALTER TABLE `entries` ADD `requested_at` text;--> statement-breakpoint
ALTER TABLE `entries` ADD `review_token` text;