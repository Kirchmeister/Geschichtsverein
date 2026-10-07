CREATE TABLE `qr_access_alerts` (
	`entry_id` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`last_seen` text NOT NULL
);
