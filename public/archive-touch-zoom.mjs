/** Lock browser pinch zoom on touch devices; map touch events still reach MapLibre. */
export function installTouchZoomLock(win=window,doc=document){
 const media=win.matchMedia('(hover: none) and (pointer: coarse)'),viewport=doc.querySelector('meta[name="viewport"]'),original=viewport?.getAttribute('content');
 let active=false;
 const prevent=e=>{if(active&&e.cancelable)e.preventDefault()};
 const touch=e=>{if(e.touches?.length>1)prevent(e)};
 function sync(){active=media.matches;doc.documentElement.toggleAttribute('data-public-fixed-zoom',active);if(viewport){if(active)viewport.setAttribute('content','width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');else if(original===null)viewport.removeAttribute('content');else viewport.setAttribute('content',original)}}
 sync();media.addEventListener('change',sync);
 for(const name of ['gesturestart','gesturechange'])doc.addEventListener(name,prevent,{passive:false});
 doc.addEventListener('touchmove',touch,{passive:false});
 return()=>{media.removeEventListener('change',sync);for(const name of ['gesturestart','gesturechange'])doc.removeEventListener(name,prevent);doc.removeEventListener('touchmove',touch);doc.documentElement.removeAttribute('data-public-fixed-zoom');if(viewport){if(original===null)viewport.removeAttribute('content');else viewport.setAttribute('content',original)}};
}
