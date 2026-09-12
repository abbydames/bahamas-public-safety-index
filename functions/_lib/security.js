const enc=new TextEncoder();
function bytesToB64(bytes){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s)}
function b64ToBytes(s){const raw=atob(s);return Uint8Array.from(raw,c=>c.charCodeAt(0))}
export function clean(value,max=240){return String(value??'').trim().replace(/\s+/g,' ').slice(0,max)}
export function normalizeName(value){return clean(value,220).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim()}
export function identityFingerprintInput(data){const name=normalizeName(data.accused_name);const age=clean(data.accused_age_hint,40).toLowerCase().replace(/[^a-z0-9]/g,'');return `${name}|${age||'age-unknown'}`}
export async function hmacHex(secret,message){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const sig=new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(message)));return [...sig].map(b=>b.toString(16).padStart(2,'0')).join('')}
export async function encryptJson(base64Key,value){const keyBytes=b64ToBytes(base64Key);if(keyBytes.byteLength!==32)throw new Error('REPORT_ENCRYPTION_KEY must decode to exactly 32 bytes.');const key=await crypto.subtle.importKey('raw',keyBytes,{name:'AES-GCM'},false,['encrypt']);const iv=crypto.getRandomValues(new Uint8Array(12));const cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(JSON.stringify(value))));return `${bytesToB64(iv)}.${bytesToB64(cipher)}`}
export function isHttpUrl(value){try{const u=new URL(String(value));return u.protocol==='https:'||u.protocol==='http:'}catch{return false}}
