CREATE TABLE `archive_backups` (
	`id` text PRIMARY KEY NOT NULL,
	`created` text NOT NULL,
	`finished` text,
	`status` text NOT NULL,
	`destination` text NOT NULL,
	`data` text NOT NULL,
	`error` text,
	`verified` text,
	`actor` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_archive_backups_created` ON `archive_backups` (`created`);