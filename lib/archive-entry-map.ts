export type EntryMapProvider='default'|'osm'|'ohm';
export type MapAvailability={enabled?:boolean,provider?:string};
export function availableEntryMaps(config:MapAvailability|null|undefined):('osm'|'ohm')[]{
 if(!config?.enabled)return [];
 return config.provider==='both'?['osm','ohm']:config.provider==='osm'||config.provider==='ohm'?[config.provider]:[];
}
export function entryMapProvider(preference:EntryMapProvider|undefined,config:MapAvailability|null|undefined){
 const available=availableEntryMaps(config);
 return available.find(provider=>provider===preference)||available[0]||null;
}
