-- Preserve the previous map only for the existing configured location.
-- Other installations start without a map and choose their own location during setup.
INSERT OR IGNORE INTO archive_settings(key,data,updated,updated_by)
SELECT 'map','{"enabled":true,"provider":"ohm","place":"Bruchköbel","locationLabel":"Bruchköbel, Hessen, Deutschland","lat":50.1785201,"lon":8.9206998,"radius":5,"title":"","revision":"legacy-map-v1"}',strftime('%Y-%m-%dT%H:%M:%fZ','now'),'Migration'
FROM archive_settings WHERE key='installation' AND json_extract(data,'$.completed')=1 AND json_extract(data,'$.place') IN ('Bruchköbel','Bruchkoebel');
