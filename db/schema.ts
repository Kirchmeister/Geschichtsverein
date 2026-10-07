import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const storagePlaces=sqliteTable('storage_places',{id:text('id').primaryKey(),name:text('name').notNull(),updated:text('updated').notNull()});
export const archiveUsers = sqliteTable('archive_users', {
 id: text('id').primaryKey(), identityProvider:text('identity_provider').notNull(), identitySubject:text('identity_subject').notNull(), displayName:text('display_name').notNull(), role:text('role',{enum:['admin','manager','user']}).notNull().default('user'), created:text('created').notNull()
},t=>[uniqueIndex('idx_archive_users_identity').on(t.identityProvider,t.identitySubject)]);
export const entries = sqliteTable('entries', {
 id:text('id').primaryKey(), timelineVisible:integer('timeline_visible').notNull().default(1), data:text('data').notNull(), updated:text('updated').notNull(), deleted:integer('deleted').notNull().default(0), createdBy:text('created_by'), updatedBy:text('updated_by'), publicationStatus:text('publication_status',{enum:['draft','pending','approved','rejected']}).notNull().default('draft'), approvedVersion:integer('approved_version'), approvedBy:text('approved_by'), approvedAt:text('approved_at'), requestedVersion:integer('requested_version'),requestedBy:text('requested_by'),requestedAt:text('requested_at'),reviewToken:text('review_token')
});
export const entryVersions = sqliteTable('entry_versions', {
 version:integer('version').primaryKey({autoIncrement:true}), entryId:text('entry_id').notNull(), data:text('data').notNull(), created:text('created').notNull(), action:text('action').notNull(), actorId:text('actor_id'), actorName:text('actor_name')
},t=>[index('idx_entry_versions_entry').on(t.entryId,t.version),index('idx_entry_versions_actor').on(t.actorId,t.version),index('idx_entry_versions_date').on(t.created,t.version)]);

export const archiveSettings=sqliteTable('archive_settings',{key:text('key').primaryKey(),data:text('data').notNull(),updated:text('updated').notNull(),updatedBy:text('updated_by').notNull()});

export const archiveComments=sqliteTable('archive_comments',{
 id:text('id').primaryKey(),entryId:text('entry_id').notNull(),parentId:text('parent_id'),authorId:text('author_id'),authorName:text('author_name').notNull(),body:text('body').notNull(),status:text('status',{enum:['pending','approved','rejected']}).notNull().default('pending'),created:text('created').notNull(),reviewedBy:text('reviewed_by'),reviewedAt:text('reviewed_at')
},t=>[index('idx_comments_entry_status').on(t.entryId,t.status,t.created),index('idx_comments_status_created').on(t.status,t.created)]);

export const entryReferences=sqliteTable('entry_references',{entryId:text('entry_id').primaryKey(),reference:text('reference').notNull(),created:text('created').notNull()},t=>[uniqueIndex('idx_entry_references_reference').on(t.reference)]);
export const qrPrintJobs=sqliteTable('qr_print_jobs',{id:text('id').primaryKey(),kind:text('kind').notNull(),labels:text('labels').notNull(),created:text('created').notNull(),createdBy:text('created_by').notNull(),answer:text('answer').notNull().default('pending'),confirmedAt:text('confirmed_at')});
export const qrPrintItems=sqliteTable('qr_print_items',{id:text('id').primaryKey(),jobId:text('job_id').notNull(),entryId:text('entry_id').notNull(),url:text('url').notNull(),printed:integer('printed').notNull().default(0),created:text('created').notNull()},t=>[index('idx_qr_print_items_entry').on(t.entryId,t.created),index('idx_qr_print_items_job').on(t.jobId)]);

export const timelineControl=sqliteTable('timeline_control',{id:text('id').primaryKey(),revision:text('revision').notNull()});
export const timelineSelections=sqliteTable('timeline_selections',{id:text('id').primaryKey(),label:text('label').notNull(),created:text('created').notNull(),actorName:text('actor_name').notNull(),count:integer('count').notNull()});
export const timelineSelectionMembers=sqliteTable('timeline_selection_members',{snapshotId:text('snapshot_id').notNull(),entryId:text('entry_id').notNull()},t=>[uniqueIndex('idx_timeline_members_snapshot_entry').on(t.snapshotId,t.entryId)]);
export const timelineRotation=sqliteTable('timeline_rotation',{id:text('id').primaryKey(),revision:text('revision').notNull(),enabled:integer('enabled').notNull().default(0),filters:text('filters').notNull(),amount:integer('amount').notNull(),cadence:text('cadence').notNull(),firstLocal:text('first_local').notNull(),nextRun:text('next_run'),lastRun:text('last_run'),lastResult:text('last_result'),updated:text('updated').notNull()});

export const publicPageViews=sqliteTable('public_page_views',{id:integer('id').primaryKey({autoIncrement:true}),day:text('day').notNull(),entryId:text('entry_id').notNull(),source:text('source').notNull(),views:integer('views').notNull().default(0),authenticatedViews:integer('authenticated_views').notNull().default(0)},t=>[uniqueIndex('idx_public_views_day_entry_source').on(t.day,t.entryId,t.source)]);

export const archiveBackups=sqliteTable('archive_backups',{id:text('id').primaryKey(),created:text('created').notNull(),finished:text('finished'),status:text('status').notNull(),destination:text('destination').notNull(),data:text('data').notNull(),error:text('error'),verified:text('verified'),actor:text('actor').notNull()},t=>[index('idx_archive_backups_created').on(t.created)]);

export const qrAccessAlerts=sqliteTable('qr_access_alerts',{entryId:text('entry_id').primaryKey(),attempts:integer('attempts').notNull(),lastSeen:text('last_seen').notNull()});
