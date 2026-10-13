'use client';
import {useEffect,useLayoutEffect,useRef,type ComponentProps} from 'react';
import {growTextarea} from '@/lib/textarea-size';
export function AutoTextarea(props:ComponentProps<'textarea'>){
 const input=useRef<HTMLTextAreaElement>(null);
 useLayoutEffect(()=>{if(input.current)growTextarea(input.current)},[props.value]);
 useEffect(()=>{
  const node=input.current;if(!node)return;
  let alive=true,width=node.clientWidth;
  const resize=()=>{if(alive)growTextarea(node)};
  const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(()=>{if(node.clientWidth!==width){width=node.clientWidth;resize()}});
  observer?.observe(node);window.addEventListener('resize',resize);document.fonts?.ready.then(resize);
  return()=>{alive=false;observer?.disconnect();window.removeEventListener('resize',resize)};
 },[]);
 return <textarea {...props} ref={input} rows={1} className={['auto-growing-textarea',props.className].filter(Boolean).join(' ')}/>;
}
