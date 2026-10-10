'use client';
import {useLayoutEffect,useRef,type ReactNode} from 'react';

// Measure the actual role-specific menu. Never infer density from screen size alone.
export function AdaptiveSidebar({children}:{children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const root=ref.current;if(!root)return;
  let frame=0,disposed=false;
  const measure=()=>{
   frame=0;if(disposed||!root.clientHeight||!root.getClientRects().length)return;
   const header=root.querySelector<HTMLElement>('[data-slot=sidebar-header]');
   const footer=root.querySelector<HTMLElement>('[data-slot=sidebar-footer]');
   const content=root.querySelector<HTMLElement>('[data-slot=sidebar-content]');
   const menu=root.querySelector<HTMLElement>('[data-slot=sidebar-menu]');
   if(!header||!footer||!content||!menu)return;
   const available=root.clientHeight-parseFloat(getComputedStyle(root).paddingTop||'0')-parseFloat(getComputedStyle(root).paddingBottom||'0');
   for(const density of ['normal','compact','tight']){
    root.dataset.density=density;
    const style=getComputedStyle(content);
    const needed=header.getBoundingClientRect().height+footer.getBoundingClientRect().height+menu.getBoundingClientRect().height+parseFloat(style.paddingTop||'0')+parseFloat(style.paddingBottom||'0');
    if(needed<=available+.5)break;
   }
  };
  const schedule=()=>{if(!frame&&!disposed)frame=requestAnimationFrame(measure)};
  const resize=new ResizeObserver(schedule);resize.observe(root);
  for(const element of root.querySelectorAll<HTMLElement>('[data-slot=sidebar-header],[data-slot=sidebar-menu],[data-slot=sidebar-footer]'))resize.observe(element);
  const mutations=new MutationObserver(schedule);mutations.observe(root,{childList:true,characterData:true,subtree:true});
  window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);
  document.fonts?.ready.then(schedule);measure();
  return ()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();mutations.disconnect();window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule)};
 },[]);
 return <div ref={ref} className="archive-sidebar-layout" data-density="normal">{children}</div>;
}
