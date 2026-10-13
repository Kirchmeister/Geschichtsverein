// One client per updater process and credential set. Cache only successful GETs.
export function createGitHubFetch({fetcher=fetch,now=Date.now,ttl=5*60*1000}={}){
 const cache=new Map(),pending=new Map();let blockedUntil=0,blockedError;
 return async function githubFetch(url,options={}){
  if(blockedUntil>now())throw blockedError;
  const key=String(url),entry=cache.get(key);
  if(entry&&entry.expires>now())return entry.response.clone();
  if(pending.has(key))return (await pending.get(key)).clone();
  const request=(async()=>{
   let response;try{response=await fetcher(url,options)}catch{const error=Error('GitHub ist derzeit nicht erreichbar. Bitte Verbindung prüfen und später erneut versuchen.');error.githubRequestFailure=true;throw error}
   if(!response.ok){
    let secondaryLimit=false;if(response.status===403){try{const body=await response.clone().json();secondaryLimit=/secondary rate limit|abuse detection/i.test(String(body?.message||''))}catch{}}
    const status=response.status,remaining=response.headers.get('x-ratelimit-remaining'),reset=Number(response.headers.get('x-ratelimit-reset'))*1000,retry=response.headers.get('retry-after');
    const retryTime=retry?(Number.isFinite(Number(retry))?now()+Math.max(0,Number(retry))*1000:Date.parse(retry)):NaN;
    let message='GitHub-Prüfung fehlgeschlagen (HTTP '+status+'). ';
    if((status===403||status===429)&&(remaining==='0'||status===429||retry||secondaryLimit)){
     blockedUntil=Math.max(now()+60000,remaining==='0'&&Number.isFinite(reset)?reset:0,Number.isFinite(retryTime)?retryTime:0);
     message+='GitHub-Anfragelimit erreicht. Erneut versuchen ab '+new Date(blockedUntil).toISOString()+'. Bei wiederholtem Auftreten kann der Betreiber einen GitHub-Token mit Leserechten einrichten.';
    }else if(status===401)message+='GitHub-Zugang abgewiesen. Der Betreiber muss den konfigurierten GitHub-Token prüfen.';
    else if(status===403)message+='GitHub verweigert den Zugriff. Der Betreiber muss Repositoryzugriff und gegebenenfalls Token-Berechtigungen prüfen. Ein Anfragelimit ist ohne entsprechende Antwortangaben nicht bestätigt.';
    else if(status===404)message+='Repository oder Release nicht verfügbar; Update-Quelle und Zugriffsrechte prüfen.';
    else message+='Bitte später erneut prüfen.';
    const error=Error(message);error.githubRequestFailure=true;if(blockedUntil>now())blockedError=error;throw error;
   }
   // Materialize before storing: clones must remain readable for concurrent callers.
   const bytes=await response.arrayBuffer();if(bytes.byteLength>2*1024*1024){const error=Error('GitHub-Antwort zu groß.');error.githubRequestFailure=true;throw error}
   const stored=new Response(bytes,{status:response.status,headers:response.headers});
   if(cache.size>=100)cache.delete(cache.keys().next().value);
   cache.set(key,{response:stored,expires:now()+ttl});return stored;
  })();pending.set(key,request);
  try{return (await request).clone()}finally{pending.delete(key)}
 };
}
