-- Tabella letta dal frontend (src/hooks/useProposta.js) filtrando per slug.
-- Da eseguire nel SQL editor del progetto Supabase.

create table if not exists public.proposte (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  company_name  text not null,
  problem_line  text,
  company_logo  text,           -- URL immagine logo cliente (opzionale)
  accent_color  text,           -- es. '#1c7a4d'; se null il frontend usa il verde di default
  services      jsonb not null default '[]'::jsonb,  -- [{ "label": "...", "base": 0.9 }]
  freqs         jsonb not null default '[]'::jsonb,  -- [{ "label": "...", "mult": 0.85, "unit": "a intervento" }]
  gallery       jsonb not null default '[]'::jsonb,  -- ["https://.../img1.png", ...]
  created_at    timestamptz not null default now()
);

-- Lettura pubblica con la anon key (il sito è condiviso via link, nessun login).
-- Servono SIA il GRANT a livello di tabella SIA la policy RLS: creando la tabella
-- via SQL il ruolo `anon` non riceve il SELECT in automatico.
grant select on public.proposte to anon;
grant select on public.proposte to authenticated;

alter table public.proposte enable row level security;

create policy "Proposte leggibili pubblicamente"
  on public.proposte
  for select
  using (true);

-- Riga di esempio (equivalente ai vecchi valori hardcoded del template).
insert into public.proposte (slug, company_name, problem_line, accent_color, services, freqs, gallery)
values (
  'demo-azienda',
  'Demo Azienda',
  'Ho notato che dal telefono il sito è difficile da leggere e non c''è modo di farsi un''idea del prezzo.',
  '#1c7a4d',
  '[
    { "label": "Pulizia uffici", "base": 0.9 },
    { "label": "Condomini", "base": 0.75 },
    { "label": "Fine cantiere", "base": 1.6 }
  ]'::jsonb,
  '[
    { "label": "Una volta", "mult": 1.35, "unit": "una tantum" },
    { "label": "Settimanale", "mult": 0.85, "unit": "a intervento" },
    { "label": "Giornaliera", "mult": 0.62, "unit": "a intervento" }
  ]'::jsonb,
  '[
    "/assets/mockup-home-desktop.png",
    "/assets/mockup-mobile-calcolatore.png",
    "/assets/mockup-home-calcolatore.png",
    "/assets/mockup-galleria-contatti.png"
  ]'::jsonb
)
on conflict (slug) do nothing;
