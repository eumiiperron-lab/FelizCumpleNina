// Pegar aquí el enlace definitivo de la carta virtual cuando el usuario lo comparta.
export const virtualLetterUrl='';
export function validateLetterUrl(value){try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}}
