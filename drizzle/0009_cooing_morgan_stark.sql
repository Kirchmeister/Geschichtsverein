CREATE TABLE `timeline_rotation` (
	`id` text PRIMARY KEY NOT NULL,
	`revision` text NOT NULL,
	`enabled` integer DEFAULT 0 NOT NULL,
	`filters` text NOT NULL,
	`amount` integer NOT NULL,
	`cadence` text NOT NULL,
	`first_local` text NOT NULL,
	`next_run` text,
	`last_run` text,
	`last_result` text,
	`updated` text NOT NULL
);
