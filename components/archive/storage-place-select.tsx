'use client';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
type StoragePlace={id:string,name:string};
export function StoragePlaceSelect({value,places,onChange,emptyLabel,missingLabel='Früherer Ort nicht mehr verfügbar · bitte neu zuordnen',disabled=false}:{value:string,places:readonly StoragePlace[],onChange:(id:string)=>void,emptyLabel:string,missingLabel?:string,disabled?:boolean}){
 // Encode UI values separately so the explicit empty choice cannot collide with a stored ID.
 const selected=value?'place:'+value:'none',missing=!!value&&!places.some(place=>place.id===value);
 return <Select value={selected} disabled={disabled} onValueChange={next=>{if(disabled)return;if(next==='none')onChange('');else if(next.startsWith('place:')){const id=next.slice(6);if(id===value||places.some(place=>place.id===id))onChange(id)}}}>
  <SelectTrigger className="storage-place-select-trigger" aria-label="Aufbewahrungsort"><SelectValue/></SelectTrigger>
  <SelectContent className="storage-place-select-content" position="popper" align="start" sideOffset={4}>
   <SelectItem value="none">{emptyLabel}</SelectItem>
   {missing&&<SelectItem value={selected}>{missingLabel}</SelectItem>}
   {places.map(place=><SelectItem key={place.id} value={'place:'+place.id}>{place.name}</SelectItem>)}
  </SelectContent>
 </Select>;
}
