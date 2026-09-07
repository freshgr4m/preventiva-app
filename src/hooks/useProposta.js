import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

/**
 * Carica da Supabase la riga della tabella `proposte` con lo slug dato.
 * Colonne attese: slug, company_name, problem_line, company_logo, accent_color,
 * services (jsonb: [{label, base}]), freqs (jsonb: [{label, mult, unit}]),
 * gallery (jsonb: [url]).
 *
 * Ritorna { data, loading, error }.
 */
export default function useProposta(slug) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setData(null);
      setLoading(false);
      setError(new Error("slug mancante"));
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    supabase
      .from("proposte")
      .select(
        "slug, company_name, problem_line, company_logo, accent_color, services, freqs, gallery",
      )
      .eq("slug", slug)
      .single()
      .then(({ data: row, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError(err);
          setData(null);
        } else {
          setData(row);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { data, loading, error };
}
