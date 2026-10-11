/** One-finger pull refresh for installed touch web apps, away from nested controls. */
export function installPullRefresh({win=window,doc=document,onChange,onRefresh}){
 let start=null,distance=0,refreshing=false;
 const touchDevice=()=>win.matchMedia('(hover: none) and (pointer: coarse)').matches;
 const standalone=()=>win.matchMedia('(display-mode: standalone)').matches||win.navigator.standalone===true;
 const atTop=()=>win.scrollY<=1&&(doc.scrollingElement?.scrollTop||0)<=1;
 const blocked=target=>{if(doc.querySelector('[role="dialog"][data-state="open"],[role="alertdialog"][data-state="open"],[data-pull-refresh-block]'))return true;if(target?.closest?.('input,textarea,select,button,a,summary,iframe,audio,video,[contenteditable="true"],[data-slot="sidebar"],.map-wrap,.maplibregl-map'))return true;if(doc.activeElement?.matches?.('input,textarea,select,[contenteditable="true"]'))return true;for(let el=target;el&&el!==doc.body&&el!==doc.documentElement;el=el.parentElement){if(el.scrollHeight>el.clientHeight+2&&/(auto|scroll)/.test(win.getComputedStyle(el).overflowY))return true}return false};
 const reset=()=>{start=null;distance=0;if(!refreshing)onChange({phase:'idle',distance:0})};
 function begin(e){if(refreshing)return;reset();if(!touchDevice()||!standalone()||e.touches.length!==1||!atTop()||blocked(e.target))return;const p=e.touches[0];start={x:p.clientX,y:p.clientY}}
 function move(e){if(!start||refreshing)return;if(e.touches.length!==1||!atTop()||blocked(e.target)){reset();return}const p=e.touches[0],dy=p.clientY-start.y,dx=Math.abs(p.clientX-start.x);if(dy<0||dx>Math.max(12,Math.abs(dy))){reset();return}if(!e.cancelable){reset();return}e.preventDefault();distance=Math.min(dy,180);onChange({phase:distance<12?'idle':distance>=100?'ready':'pulling',distance})}
 function end(){if(!start||refreshing)return;if(distance>=100&&atTop()){refreshing=true;start=null;onChange({phase:'refreshing',distance:100});onRefresh()}else reset()}
 doc.addEventListener('touchstart',begin,{passive:true});doc.addEventListener('touchmove',move,{passive:false});doc.addEventListener('touchend',end,{passive:true});doc.addEventListener('touchcancel',reset,{passive:true});
 return()=>{doc.removeEventListener('touchstart',begin);doc.removeEventListener('touchmove',move);doc.removeEventListener('touchend',end);doc.removeEventListener('touchcancel',reset)};
}
