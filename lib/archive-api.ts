export type PreviewRole='admin'|'manager'|'user'|'public';
let previewRole:PreviewRole|null=null;
export function setArchivePreviewRole(role:PreviewRole|null){previewRole=role}
export function archivePreviewHeaders(){return previewRole?{'x-archive-preview-role':previewRole}:{} as Record<string,string>}
/** Never parse gateway/login HTML as archive data. */
export async function readArchiveResponse(response: Response): Promise<any> {
  const type = response.headers.get('content-type') || '';
  if (response.status === 401 || response.redirected || response.status === 403 && !type.toLowerCase().includes('application/json')) {
    throw new Error('Der Zugriff auf die private Website muss erneut bestätigt werden. Öffnen Sie die Website in einem neuen Tab und melden Sie sich bei Bedarf an. Versuchen Sie anschließend erneut zu speichern.');
  }
  if (!type.toLowerCase().includes('application/json')) {
    throw new Error(`Die Website hat keine gültige Speicherantwort zurückgegeben (HTTP ${response.status}). Öffnen Sie sie in einem neuen Tab und versuchen Sie es erneut. Ihre Eingaben bleiben im Formular erhalten.`);
  }
  let data: any;
  try { data = await response.json(); }
  catch { throw new Error('Die Antwort der Website war unvollständig. Bitte erneut versuchen. Ihre Eingaben bleiben erhalten.'); }
  if (!response.ok) throw new Error(typeof data?.error === 'string' ? data.error : `Die Anfrage ist fehlgeschlagen (HTTP ${response.status}). Bitte erneut versuchen.`);
  return data;
}

export async function archiveRequest(path: string, options: RequestInit = {}) {
  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json', ...archivePreviewHeaders(), ...options.headers },
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw new Error('Die Verbindung zur Website wurde unterbrochen oder hat zu lange gedauert. Bitte erneut versuchen. Ihre Eingaben bleiben erhalten.');
  }
  return readArchiveResponse(response);
}
