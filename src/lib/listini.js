// Copia di sicurezza dei listini: DEVE restare identica alle righe della tabella
// `listini` su Supabase. Viene usata solo se la query a `listini` fallisce, così
// i prezzi non si rompono mai. Se cambi i numeri su Supabase, aggiornali anche qui.
export const FALLBACK_LISTINI = {
  piccolo: {
    tier: "piccolo",
    piano1_setup: 149,
    piano1_mese: 19,
    piano2_setup: 349,
    piano2_mese: 49,
    piano3_prezzo_pieno: 599,
    piano3_setup: 399,
    piano3_mese: 49,
    seo_continuativa_mese: 49,
  },
  medio: {
    tier: "medio",
    piano1_setup: 199,
    piano1_mese: 24,
    piano2_setup: 499,
    piano2_mese: 59,
    piano3_prezzo_pieno: 899,
    piano3_setup: 599,
    piano3_mese: 59,
    seo_continuativa_mese: 69,
  },
  grande: {
    tier: "grande",
    piano1_setup: 249,
    piano1_mese: 29,
    piano2_setup: 599,
    piano2_mese: 69,
    piano3_prezzo_pieno: 999,
    piano3_setup: 699,
    piano3_mese: 69,
    seo_continuativa_mese: 89,
  },
};

export const DEFAULT_TIER = "piccolo";

export function fallbackListino(tier) {
  return FALLBACK_LISTINI[tier] || FALLBACK_LISTINI[DEFAULT_TIER];
}

// I campi numeric di Postgres possono tornare come stringa: qui li forzo a numero
// e riempio eventuali buchi con il fallback della fascia.
export function normalizeListino(raw, tier) {
  const base = fallbackListino(tier);
  const src = raw || base;
  const num = (v, fb) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fb;
  };
  return {
    tier: src.tier || tier || DEFAULT_TIER,
    piano1_setup: num(src.piano1_setup, base.piano1_setup),
    piano1_mese: num(src.piano1_mese, base.piano1_mese),
    piano2_setup: num(src.piano2_setup, base.piano2_setup),
    piano2_mese: num(src.piano2_mese, base.piano2_mese),
    piano3_prezzo_pieno: num(src.piano3_prezzo_pieno, base.piano3_prezzo_pieno),
    piano3_setup: num(src.piano3_setup, base.piano3_setup),
    piano3_mese: num(src.piano3_mese, base.piano3_mese),
    seo_continuativa_mese: num(src.seo_continuativa_mese, base.seo_continuativa_mese),
  };
}
