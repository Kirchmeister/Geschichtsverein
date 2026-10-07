CREATE TABLE `entry_versions` (
	`version` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_id` text NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL,
	`action` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_entry_versions_entry` ON `entry_versions` (`entry_id`,`version`);--> statement-breakpoint
ALTER TABLE `entries` ADD `deleted` integer DEFAULT 0 NOT NULL;