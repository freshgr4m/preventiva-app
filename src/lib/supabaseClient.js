import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigured) {
  console.warn(
    "Supabase: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY mancanti. " +
      "Crea un file .env nella root (vedi .env.example).",
  );
}

// Placeholder se le env non ci sono: il client si costruisce comunque, le query
// falliscono e gli hook mostrano lo stato "Proposta non trovata" invece di
// far crashare l'app all'avvio.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
);
