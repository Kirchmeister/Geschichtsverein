/** Keep retired data from the stored current record, never from an editable web payload. */
export function preserveInterpretation(next:any,previous:any){
 if(previous&&Object.hasOwn(previous,'interpretation'))next.interpretation=previous.interpretation;else delete next.interpretation;
 next.fieldFormats={...next.fieldFormats};
 if(previous?.fieldFormats&&Object.hasOwn(previous.fieldFormats,'interpretation'))next.fieldFormats.interpretation=previous.fieldFormats.interpretation;else delete next.fieldFormats.interpretation;
 return next;
}
