/**
 * Normalizza il campo `gallery` che arriva da Supabase in un array di URL puliti.
 *
 * Accetta:
 *  - un array di stringhe URL (formato atteso)                -> ["https://...", "/foo.png"]
 *  - una stringa JSON con dentro quell'array (colonna `text`) -> '["https://..."]'
 *  - null / undefined / qualsiasi altra cosa                  -> []
 *
 * Scarta le voci che non sono un URL plausibile (stringhe vuote, segnaposto
 * tipo "<<link foto 1>>", ecc.), così una riga compilata a metà non produce
 * immagini rotte.
 */
export function toGalleryUrls(raw) {
  let arr = raw;

  if (typeof arr === "string") {
    try {
      arr = JSON.parse(arr);
    } catch {
      arr = [];
    }
  }

  if (!Array.isArray(arr)) return [];

  return arr
    .filter((u) => typeof u === "string")
    .map((u) => u.trim())
    .filter((u) => /^(https?:\/\/|\/)/.test(u));
}
