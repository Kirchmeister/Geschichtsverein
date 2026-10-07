import fs from 'node:fs';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
const target=path.resolve(process.argv[2]||'linux-config');fs.mkdirSync(target,{recursive:true,mode:0o700});const file=path.join(target,'app.env');if(fs.existsSync(file))throw Error('Konfiguration existiert bereits; wird nicht überschrieben.');fs.writeFileSync(file,`ARCHIVE_ORIGIN=http://localhost:8080\nARCHIVE_SESSION_KEY=${randomBytes(32).toString('hex')}\nARCHIVE_SETTINGS_KEY=${randomBytes(32).toString('hex')}\nARCHIVE_RUNNER_KEY=${randomBytes(32).toString('hex')}\n`,{mode:0o600});console.log('Konfiguration erzeugt. ARCHIVE_ORIGIN vor der ersten Registrierung prüfen.');
