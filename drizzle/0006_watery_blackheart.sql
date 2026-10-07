CREATE TABLE `entry_references` (
	`entry_id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_entry_references_reference` ON `entry_references` (`reference`);--> statement-breakpoint
CREATE TABLE `qr_print_items` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`entry_id` text NOT NULL,
	`url` text NOT NULL,
	`printed` integer DEFAULT 0 NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_qr_print_items_entry` ON `qr_print_items` (`entry_id`,`created`);--> statement-breakpoint
CREATE INDEX `idx_qr_print_items_job` ON `qr_print_items` (`job_id`);--> statement-breakpoint
CREATE TABLE `qr_print_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`labels` text NOT NULL,
	`created` text NOT NULL,
	`created_by` text NOT NULL,
	`answer` text DEFAULT 'pending' NOT NULL,
	`confirmed_at` text
);
