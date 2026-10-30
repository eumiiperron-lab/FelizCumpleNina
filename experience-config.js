// Enlace o ruta del archivo HTML local en el directorio principal
export const virtualLetterUrl = './carta-nina-interactiva/index.html';

export function validateLetterUrl(value) {
  if (!value) return null;
  
  // Permitir rutas relativas locales o archivos con extensión .html
  if (value.startsWith('./') || value.startsWith('/') || value.endsWith('.html')) {
    return value;
  }
  
  // Mantener compatibilidad con URLs absolutas http/https si en algún momento lo requieres
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
