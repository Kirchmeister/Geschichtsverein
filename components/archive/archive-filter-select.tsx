'use client';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
export function ArchiveFilterSelect({label,value,options,onChange}:{label:string,value:string,options:readonly {value:string,label:string}[],onChange:(value:string)=>void}){
 // UI encoding preserves an explicit selectable empty filter without changing query values.
 return <Select value={'option:'+value} onValueChange={next=>{if(!next.startsWith('option:'))return;const selected=next.slice(7);if(options.some(option=>option.value===selected))onChange(selected)}}>
  <SelectTrigger className="archive-filter-select-trigger" aria-label={label}><SelectValue/></SelectTrigger>
  <SelectContent className="archive-filter-select-content" position="popper" align="start" sideOffset={4}>
   {options.map(option=><SelectItem key={option.value} value={'option:'+option.value}>{option.label}</SelectItem>)}
  </SelectContent>
 </Select>;
}
