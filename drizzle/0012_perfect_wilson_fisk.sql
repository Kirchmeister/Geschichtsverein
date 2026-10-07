CREATE TABLE `storage_places` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX idx_entries_storage_place ON entries(json_extract(data,'$.storagePlaceId'));
--> statement-breakpoint
CREATE TRIGGER storage_place_delete_guard BEFORE DELETE ON storage_places
WHEN EXISTS(SELECT 1 FROM entries WHERE json_extract(data,'$.storagePlaceId')=OLD.id)
BEGIN SELECT RAISE(ABORT,'storage_place_in_use'); END;
--> statement-breakpoint
CREATE TRIGGER entry_storage_place_insert_guard BEFORE INSERT ON entries
WHEN COALESCE(json_extract(NEW.data,'$.storagePlaceId'),'')<>'' AND NOT EXISTS(SELECT 1 FROM storage_places WHERE id=json_extract(NEW.data,'$.storagePlaceId'))
BEGIN SELECT RAISE(ABORT,'storage_place_missing'); END;
--> statement-breakpoint
CREATE TRIGGER entry_storage_place_update_guard BEFORE UPDATE OF data ON entries
WHEN COALESCE(json_extract(NEW.data,'$.storagePlaceId'),'')<>'' AND NOT EXISTS(SELECT 1 FROM storage_places WHERE id=json_extract(NEW.data,'$.storagePlaceId'))
BEGIN SELECT RAISE(ABORT,'storage_place_missing'); END;
