CREATE TABLE `public_page_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day` text NOT NULL,
	`entry_id` text NOT NULL,
	`source` text NOT NULL,
	`views` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_public_views_day_entry_source` ON `public_page_views` (`day`,`entry_id`,`source`);