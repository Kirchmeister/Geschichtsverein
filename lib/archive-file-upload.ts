import {imageCaption} from './archive-image-caption';
export type PendingFile={id:string,file:File,caption:string};
export async function uploadFileBatch(pending:PendingFile[],attach:(file:File,caption?:string)=>Promise<void>,completed:(id:string)=>void){
 // Validate the entire selection before uploading any file.
 const prepared=pending.map(item=>({...item,caption:item.file.type.startsWith('image/')?imageCaption(item.caption):undefined}));
 for(const item of prepared){await attach(item.file,item.caption);completed(item.id)}
}
