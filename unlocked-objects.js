const STORAGE_KEY='memoria-unlocked-objects-v1';
const allowed=new Set(['letter','seal','bottle']);
export function createUnlockStore(storage){
 if(storage===undefined)try{storage=globalThis.localStorage;}catch{}
 let values=new Set();try{const parsed=JSON.parse(storage?.getItem(STORAGE_KEY)||'[]');if(Array.isArray(parsed))values=new Set(parsed.filter(id=>allowed.has(id)));}catch{}
 function unlock(id){if(!allowed.has(id))return false;const fresh=!values.has(id);values.add(id);try{storage?.setItem(STORAGE_KEY,JSON.stringify([...values]));}catch{}return fresh;}
 return {unlock,has:id=>values.has(id),get count(){return values.size;},get items(){return [...values];}};
}
