import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { DEFAULT_TIER, normalizeListino } from "../lib/listini.js";

/**
 * Carica da Supabase la riga della tabella `proposte` con lo slug dato, poi il
 * listino prezzi della fascia (`tier`) di quel cliente dalla tabella `listini`.
 *
 * `proposte`: slug, company_name, problem_line, company_logo, accent_color, tier,
 *   services (jsonb: [{label, base}]), freqs (jsonb: [{label, mult, unit}]),
 *   gallery (jsonb: [url]).
 * `listini`: tier, piano1_setup, piano1_mese, piano2_setup, piano2_mese,
 *   piano3_prezzo_pieno, piano3_setup, piano3_mese, seo_continuativa_mese.
 *
 * Ritorna { data, listino, loading, error }. `listino` è sempre valorizzato
 * quando `data` c'è: se la query a `listini` fallisce si usa il fallback locale
 * della fascia (vedi src/lib/listini.js).
 */
export default function useProposta(slug) {
  const [data, setData] = useState(null);
  const [listino, setListino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setData(null);
      setListino(null);
      setLoading(false);
      setError(new Error("slug mancante"));
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const { data: row, error: err } = await supabase
        .from("proposte")
        .select(
          "slug, company_name, problem_line, company_logo, accent_color, tier, services, freqs, gallery",
        )
        .eq("slug", slug)
        .single();

      if (cancelled) return;

      if (err || !row) {
        setError(err || new Error("proposta non trovata"));
        setData(null);
        setListino(null);
        setLoading(false);
        return;
      }

      const tier = row.tier || DEFAULT_TIER;

      const { data: listinoRow } = await supabase
        .from("listini")
        .select("*")
        .eq("tier", tier)
        .single();

      if (cancelled) return;

      setData(row);
      setListino(normalizeListino(listinoRow, tier));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { data, listino, loading, error };
}
