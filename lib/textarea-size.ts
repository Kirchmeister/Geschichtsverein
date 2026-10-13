/** Measure an off-screen mirror: never collapse the focused textarea (Safari caret/scroll stability). */
export function growTextarea(input:HTMLTextAreaElement){
 const doc=input.ownerDocument,view=doc.defaultView;if(!view||!input.getBoundingClientRect().width)return;
 const computed=view.getComputedStyle(input),mirror=doc.createElement('textarea');mirror.tabIndex=-1;mirror.setAttribute('aria-hidden','true');
 for(const key of ['fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','wordSpacing','textIndent','textTransform','paddingTop','paddingBottom','paddingLeft','paddingRight','borderTopWidth','borderBottomWidth','borderLeftWidth','borderRightWidth','borderStyle','tabSize','direction','whiteSpace','overflowWrap','wordBreak'])(mirror.style as any)[key]=(computed as any)[key];
 Object.assign(mirror.style,{position:'fixed',left:'-10000px',top:'0',visibility:'hidden',pointerEvents:'none',width:input.getBoundingClientRect().width+'px',boxSizing:'border-box',height:'0px',minHeight:'0px',maxHeight:'none',overflow:'hidden',resize:'none'});mirror.rows=1;mirror.value=input.value||' ';
 doc.body.appendChild(mirror);try{const height=Math.max(parseFloat(computed.minHeight)||120,mirror.scrollHeight+(parseFloat(computed.borderTopWidth)||0)+(parseFloat(computed.borderBottomWidth)||0));if(input.style.height!==height+'px')input.style.height=height+'px'}finally{mirror.remove()}
}
