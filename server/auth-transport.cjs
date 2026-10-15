// Run before the standalone server: derive source only from the actual TCP peer.
const http=require('node:http'),net=require('node:net'),{createHmac}=require('node:crypto');
function normalize(ip){if(typeof ip!=='string')return '';if(ip.startsWith('::ffff:')&&net.isIP(ip.slice(7))===4)ip=ip.slice(7);return net.isIP(ip)?ip.toLowerCase():''}
function sourceAddress(peer,forwarded,trusted=[]){peer=normalize(peer);const trust=ip=>trusted.includes(normalize(ip));if(!peer)return 'unknown';if(!trust(peer))return peer;if(typeof forwarded!=='string'||forwarded.length>2048)return peer;const chain=forwarded.split(',').map(x=>normalize(x.trim()));if(chain.length>20||chain.some(x=>!x))return peer;let source=peer;for(let i=chain.length-1;i>=0&&trust(source);i--)source=chain[i];return source}
const trusted=(process.env.ARCHIVE_TRUSTED_PROXIES||'').split(',').filter(Boolean).map(x=>{const ip=normalize(x.trim());if(!ip)throw Error('ARCHIVE_TRUSTED_PROXIES enthält eine ungültige IP-Adresse.');return ip});
const key=process.env.ARCHIVE_AUTH_TRANSPORT_KEY,original=http.Server.prototype.emit;
if(key)http.Server.prototype.emit=function(type,...args){if(type==='request'){const req=args[0],source=sourceAddress(req.socket?.remoteAddress,req.headers['x-forwarded-for'],trusted);delete req.headers['x-archive-auth-source'];req.headers['x-archive-auth-source']=source+'|'+createHmac('sha256',key).update(source).digest('hex')}return original.call(this,type,...args)};
module.exports={sourceAddress,normalize};
