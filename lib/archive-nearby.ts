export type NearbyPoint={lat:number,lon:number,accuracy:number};
export type NearbyArea={lat:number,lon:number,radius:number,place:string};
export type NearbyEntry={reference:string,title:string,location:{lat:number,lon:number,label?:string,approximate?:boolean}};
export const nearbyRadii=[50,100,250] as const;
export function distanceMeters(a:{lat:number,lon:number},b:{lat:number,lon:number}){
 const rad=Math.PI/180,dlat=(b.lat-a.lat)*rad,dlon=(b.lon-a.lon)*rad;
 const h=Math.sin(dlat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dlon/2)**2;
 return 6371000*2*Math.atan2(Math.sqrt(Math.min(1,h)),Math.sqrt(Math.max(0,1-h)));
}
export function validNearbyPoint(point:unknown):point is NearbyPoint{
 const p=point as NearbyPoint;return !!p&&Number.isFinite(p.lat)&&Math.abs(p.lat)<=90&&Number.isFinite(p.lon)&&Math.abs(p.lon)<=180&&Number.isFinite(p.accuracy)&&p.accuracy>=0;
}
export function nearbyPhone(navigator:{userAgent:string,userAgentData?:{mobile?:boolean}}){
 if(typeof navigator.userAgentData?.mobile==='boolean')return navigator.userAgentData.mobile;
 return /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(navigator.userAgent);
}
export function nearbyPositionStatus(point:NearbyPoint,area:NearbyArea,radius:number){
 if(!validNearbyPoint(point))return 'invalid';
 const distance=distanceMeters(point,area),limit=area.radius*1000;
 if(distance-point.accuracy>limit)return 'outside';
 if(point.accuracy>radius)return 'inaccurate';
 if(distance+point.accuracy>limit)return 'boundary';
 return 'inside';
}
export function nearbyEntries(entries:NearbyEntry[],point:NearbyPoint,area:NearbyArea,radius:number){
 const seen=new Set<string>();
 return entries.filter(entry=>{
  if(!entry||typeof entry.reference!=='string'||seen.has(entry.reference)||!validNearbyPoint({...entry.location,accuracy:0}))return false;
  seen.add(entry.reference);return distanceMeters(entry.location,area)<=area.radius*1000;
 }).map(entry=>({...entry,distance:distanceMeters(point,entry.location)})).filter(entry=>entry.distance<=radius).sort((a,b)=>a.distance-b.distance||a.reference.localeCompare(b.reference));
}
