CREATE TABLE `timeline_control` (
	`id` text PRIMARY KEY NOT NULL,
	`revision` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `timeline_selection_members` (
	`snapshot_id` text NOT NULL,
	`entry_id` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_timeline_members_snapshot_entry` ON `timeline_selection_members` (`snapshot_id`,`entry_id`);--> statement-breakpoint
CREATE TABLE `timeline_selections` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`created` text NOT NULL,
	`actor_name` text NOT NULL,
	`count` integer NOT NULL
);
