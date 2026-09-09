import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Hover from "../lib/Hover.jsx";
import Message from "../lib/Message.jsx";
import { toGalleryUrls } from "../lib/gallery.js";
import { fallbackListino } from "../lib/listini.js";
import useProposta from "../hooks/useProposta.js";

const MONO = "'JetBrains Mono',monospace";
const FALLBACK_ACCENT = "#1c7a4d";

const WHATSAPP_NUMBER = "393282994717";
const WHATSAPP_MESSAGE = "Ciao Francesco! Ho visto la tua proposta e vorrei parlarne.";

// Piccola freccia diagonale (↗), la stessa usata sul bottone "Guarda i
// dettagli e gli screenshot" — la riuso qui per coerenza visiva.
function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="8 7 17 7 17 16" />
    </svg>
  );
}

export default function Proposta() {
  const { slug } = useParams();
  const { data, listino, loading, error } = useProposta(slug);

  const [service, setService] = useState(0);
  const [sqm, setSqm] = useState(80);
  const [freq, setFreq] = useState(1);
  const [lb, setLb] = useState(null);

  // Galleria: da Supabase arriva un array di URL (stringhe). Lo normalizzo a
  // { src, alt } scartando voci vuote o segnaposto non-URL.
  const gallery = toGalleryUrls(data?.gallery).map((src, i) => ({
    src,
    alt: "Anteprima " + (i + 1) + " del sito",
  }));

  useEffect(() => {
    const onKey = (e) => {
      if (lb == null) return;
      const n = gallery.length;
      if (n === 0) return;
      if (e.key === "Escape") setLb(null);
      else if (e.key === "ArrowLeft") setLb((v) => (v + n - 1) % n);
      else if (e.key === "ArrowRight") setLb((v) => (v + 1) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb, gallery.length]);

  if (loading) {
    return <Message title="Caricamento…" />;
  }
  if (error || !data) {
    return (
      <Message
        label="404"
        title="Proposta non trovata"
        note="Controlla il link che hai ricevuto: dovrebbe avere un indirizzo del tipo /nome-azienda."
      />
    );
  }

  const accent = data.accent_color || FALLBACK_ACCENT;
  // Listino prezzi della fascia del cliente (tier). Il fallback è la rete di
  // sicurezza se l'hook non l'ha risolto: i numeri restano corretti per fascia.
  const L = listino || fallbackListino(data.tier);
  const companyName = data.company_name || "";
  const problemLine = data.problem_line || "";
  const companyLogo = data.company_logo || "";
  const hasLogo = !!companyLogo.trim();
  const logoStyle = {
    height: "34px",
    width: "160px",
    backgroundImage: companyLogo.trim() ? 'url("' + companyLogo + '")' : "none",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "left center",
  };

  const chip = (active) => ({
    font: "inherit",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    padding: "10px 16px",
    borderRadius: "999px",
    border: active ? "1px solid " + accent : "1px solid #dedeD8",
    background: active ? accent : "#fff",
    color: active ? "#fff" : "#3f423f",
  });

  // --- Dati del calcolatore (da Supabase) ---
  const services = Array.isArray(data.services) ? data.services : [];
  const freqs = Array.isArray(data.freqs) ? data.freqs : [];
  const s = services[service] || services[0] || { label: "", base: 0 };
  const f = freqs[freq] || freqs[0] || { label: "", mult: 1, unit: "" };

  // Formula invariata: 45 + m² * base_servizio * moltiplicatore_frequenza.
  // Mostrata come forbice min–max (±15%), arrotondata ai 5€.
  const raw = 45 + sqm * s.base * f.mult;
  const priceMin = Math.max(5, Math.round((raw * 0.85) / 5) * 5);
  const priceMax = Math.max(priceMin + 5, Math.round((raw * 1.15) / 5) * 5);
  const priceStr = "€ " + priceMin + " – " + priceMax;
  const priceUnit = f.unit;
  const priceNote =
    s.label +
    " · " +
    sqm +
    " m² · " +
    f.label.toLowerCase() +
    ". Il preventivo definitivo lo confermi tu.";
  const sqmLabel = sqm + " m²";

  // Righe della tabella "lavoro continuativo": i canoni mensili (tolti dalle card)
  // più la SEO continuativa opzionale. I numeri arrivano dal listino della fascia.
  const canoneRows = [
    {
      label: "Manutenzione — Piano 1",
      desc: "Il calcolatore preventivi sempre online, aggiornamenti e piccole modifiche.",
      price: L.piano1_mese,
    },
    {
      label:
        L.piano2_mese === L.piano3_mese ? "Manutenzione — Piano 2 e 3" : "Manutenzione — Piano 2",
      desc: "Tutto il sito online e curato da me: hosting, aggiornamenti, correzioni e modifiche.",
      price: L.piano2_mese,
    },
  ];
  if (L.piano3_mese !== L.piano2_mese) {
    canoneRows.push({
      label: "Manutenzione — Piano 3",
      desc: "Come il Piano 2, con la parte SEO di base sempre monitorata.",
      price: L.piano3_mese,
    });
  }
  canoneRows.push({
    label: "SEO continuativa — opzionale",
    desc: "Contenuti, controlli e ottimizzazioni ogni settimana per salire su Google. Si aggiunge al canone del piano.",
    price: L.seo_continuativa_mese,
    plus: true,
  });

  const lbOpen = lb != null && gallery[lb];

  // Sezione "chi sono": un'unica griglia di tile (etichetta + valore) invece di
  // due blocchi con formati diversi, per un allineamento più ordinato.
  const contactLinkStyle = {
    color: "#f4f4f2",
    textDecoration: "none",
    borderBottom: "1px solid #4b5158",
    paddingBottom: "2px",
  };
  const waNumber = WHATSAPP_NUMBER.replace(/\D/g, "");
  const waHref = waNumber
    ? "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(WHATSAPP_MESSAGE)
    : null;
  // Griglia 2x2 (come prima): ruolo, sede, focus, disponibilità.
  const metaTiles = [
    { label: "RUOLO", value: "Sviluppatore web" },
    { label: "SEDE", value: "Roma, IT · Remote" },
    { label: "FOCUS", value: "Siti e strumenti su misura" },
    {
      label: "DISPONIBILITÀ",
      value: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3fbd7c" }} />
          Disponibile ora
        </span>
      ),
    },
  ];

  // Contatti: una riga ciascuno (come prima), così un valore lungo (l'email)
  // non si scontra mai con quello accanto.
  const contactRows = [
    {
      label: "EMAIL",
      value: (
        <a href="mailto:mancinofrancesco91@gmail.com" style={contactLinkStyle}>
          mancinofrancesco91@gmail.com
        </a>
      ),
    },
    ...(waHref
      ? [
          {
            label: "WHATSAPP",
            value: (
              <a href={waHref} target="_blank" rel="noopener" style={contactLinkStyle}>
                +39 328 299 4717
              </a>
            ),
          },
        ]
      : []),
    {
      label: "GITHUB",
      value: (
        <a href="https://github.com/freshgr4m" style={contactLinkStyle}>
          @freshgr4m
        </a>
      ),
    },
    {
      label: "LINKEDIN",
      value: (
        <a href="https://www.linkedin.com/in/francesco-mancino-dev" style={contactLinkStyle}>
          in/francesco-mancino-dev
        </a>
      ),
    },
  ];

  return (
    <div style={{ background: "#f4f4f2", color: "#141614", minHeight: "100%", padding: "0 0 0 0" }}>
      <div style={{ height: "10px", background: "#22262a" }} />

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "56px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", marginBottom: "34px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "11px", height: "11px", background: accent, borderRadius: "2px" }} />
            <div style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.01em" }}>Francesco Mancino</div>
          </div>
          {hasLogo && (
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ width: "1px", height: "26px", background: "#d5d5d0" }} />
              <div style={logoStyle} role="img" aria-label="Logo cliente" />
            </div>
          )}
        </div>

        <h1
          style={{
            fontSize: "clamp(40px,6.4vw,68px)",
            lineHeight: 1.03,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            margin: "0 0 18px",
            maxWidth: "24ch",
            textWrap: "pretty",
          }}
        >
          <span style={{ display: "block" }}>Una proposta su misura per</span>
          <span style={{ display: "block", color: accent }}>{companyName}</span>
        </h1>
        <p style={{ margin: 0, fontSize: "17px", lineHeight: 1.55, color: "#6b6f6b", maxWidth: "60ch" }}>
          {problemLine}
        </p>
      </div>

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "72px 28px 0" }}>
        <div style={{ fontFamily: MONO, fontSize: "12px", letterSpacing: "0.12em", color: "#8a8f8a", marginBottom: "14px" }}>
          01 — LA PROPOSTA
        </div>
        <h2
          style={{
            fontSize: "clamp(28px,3.6vw,40px)",
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            margin: "0 0 12px",
          }}
        >
          Ecco cosa ho pensato per te
        </h2>
        <p style={{ margin: "0 0 40px", fontSize: "16px", lineHeight: 1.6, color: "#6b6f6b", maxWidth: "62ch" }}>
          Un sito che si legge bene da telefono e un calcolatore che dà subito un preventivo indicativo, così chi ti
          scrive sa già di cosa stiamo parlando.
        </p>

        {gallery.length > 0 && (
          <div
            style={{
              border: "1px solid #e2e2dd",
              borderRadius: "22px",
              background: "#fff",
              padding: "clamp(18px,3vw,40px)",
              marginBottom: "22px",
            }}
          >
            {gallery.slice(0, 1).map((shot, i) => (
              <div
                key={i}
                onClick={() => setLb(0)}
                style={{
                  width: "100%",
                  border: "1px solid #ececea",
                  borderRadius: "14px",
                  overflow: "hidden",
                  marginBottom: gallery.length > 1 ? "18px" : 0,
                  cursor: "zoom-in",
                }}
              >
                <img
                  src={shot.src}
                  alt={shot.alt}
                  style={{ display: "block", width: "100%", aspectRatio: "4/3", objectFit: "cover" }}
                />
              </div>
            ))}

            {gallery.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                  gap: "18px",
                  width: "100%",
                }}
              >
                {gallery.slice(1).map((shot, i) => {
                  const idx = i + 1;
                  return (
                    <div
                      key={idx}
                      onClick={() => setLb(idx)}
                      style={{ border: "1px solid #ececea", borderRadius: "14px", overflow: "hidden", cursor: "zoom-in" }}
                    >
                      <img
                        src={shot.src}
                        alt={shot.alt}
                        style={{ display: "block", width: "100%", aspectRatio: "4/3", objectFit: "cover" }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {lbOpen && (
          <div
            onClick={() => setLb(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              background: "rgba(18,20,18,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "clamp(16px,5vw,64px)",
            }}
          >
            <button
              type="button"
              onClick={() => setLb(null)}
              aria-label="Chiudi"
              style={{
                position: "absolute",
                top: "18px",
                right: "20px",
                width: "44px",
                height: "44px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: "20px",
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLb((v) => (v + gallery.length - 1) % gallery.length);
              }}
              aria-label="Immagine precedente"
              style={{
                position: "absolute",
                left: "clamp(8px,3vw,32px)",
                top: "50%",
                transform: "translateY(-50%)",
                width: "48px",
                height: "48px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: "24px",
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLb((v) => (v + 1) % gallery.length);
              }}
              aria-label="Immagine successiva"
              style={{
                position: "absolute",
                right: "clamp(8px,3vw,32px)",
                top: "50%",
                transform: "translateY(-50%)",
                width: "48px",
                height: "48px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: "24px",
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ›
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "14px",
                maxWidth: "92vw",
              }}
            >
              <img
                src={gallery[lb].src}
                alt={gallery[lb].alt}
                style={{
                  display: "block",
                  maxWidth: "92vw",
                  maxHeight: "80vh",
                  width: "auto",
                  height: "auto",
                  borderRadius: "12px",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
                }}
              />
              <div style={{ fontFamily: MONO, fontSize: "12px", letterSpacing: "0.12em", color: "#c9cdc9" }}>
                {lb + 1 + " / " + gallery.length}
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            border: "1px solid #e2e2dd",
            borderRadius: "22px",
            background: "#fff",
            padding: "clamp(20px,3vw,34px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "22px",
            }}
          >
            <div>
              <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.12em", color: "#8a8f8a", marginBottom: "8px" }}>
                PROVALO
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em" }}>Calcolatore preventivi</div>
            </div>
            <div style={{ fontSize: "14px", color: "#6b6f6b", maxWidth: "34ch" }}>
              Un esempio di come potrebbe apparire sul tuo sito.
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
              gap: "26px",
              alignItems: "start",
            }}
          >
            <div style={{ display: "grid", gap: "20px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "9px" }}>Tipo di servizio</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {services.map((x, i) => (
                    <button key={i} type="button" onClick={() => setService(i)} style={chip(i === service)}>
                      {x.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "9px",
                  }}
                >
                  <span>Metri quadri</span>
                  <span style={{ fontFamily: MONO, color: accent }}>{sqmLabel}</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="400"
                  step="10"
                  value={sqm}
                  onChange={(e) => setSqm(Number(e.target.value))}
                  style={{ width: "100%", accentColor: accent }}
                />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "9px" }}>Frequenza</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {freqs.map((x, i) => (
                    <button key={i} type="button" onClick={() => setFreq(i)} style={chip(i === freq)}>
                      {x.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: "#f0f6f2", border: "1px solid #d3e6da", borderRadius: "16px", padding: "26px" }}>
              <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.1em", color: "#4b7d61", marginBottom: "10px" }}>
                PREVENTIVO INDICATIVO
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                <div style={{ fontSize: "clamp(30px,5.5vw,42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#14603c" }}>
                  {priceStr}
                </div>
                <div style={{ fontSize: "15px", color: "#4b7d61" }}>{priceUnit}</div>
              </div>
              <div style={{ fontSize: "13px", lineHeight: 1.55, color: "#4b7d61", marginBottom: "18px" }}>{priceNote}</div>
              <div style={{ height: "1px", background: "#d3e6da", marginBottom: "18px" }} />
              <div style={{ fontSize: "13px", lineHeight: 1.6, color: "#3f6b52" }}>
                Il cliente vede questa cifra in due secondi, poi ti scrive già informato. Meno telefonate a vuoto.
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "36px", display: "flex", justifyContent: "center" }}>
          <Hover
            as={Link}
            to={"/" + slug + "/mockup"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "17px",
              fontWeight: 700,
              color: "#fff",
              background: accent,
              textDecoration: "none",
              padding: "20px 34px",
              borderRadius: "999px",
              border: "2px solid " + accent,
              boxShadow: "0 12px 30px rgba(20,22,20,0.22)",
            }}
            hoverStyle={{
              filter: "brightness(1.08)",
              boxShadow: "0 16px 36px rgba(20,22,20,0.3)",
            }}
          >
            Guarda i dettagli e gli screenshot
            <ArrowIcon />
          </Hover>
        </div>
      </div>

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "96px 28px 0" }}>
        <div style={{ fontFamily: MONO, fontSize: "12px", letterSpacing: "0.12em", color: "#8a8f8a", marginBottom: "14px" }}>
          02 — PREZZI
        </div>
        <h2
          style={{
            fontSize: "clamp(28px,3.6vw,40px)",
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            margin: "0 0 12px",
          }}
        >
          Come possiamo lavorare insieme
        </h2>
        <p style={{ margin: "0 0 40px", fontSize: "16px", lineHeight: 1.6, color: "#6b6f6b", maxWidth: "76ch" }}>
          Tre modi di partire, con un prezzo una tantum: il sito è tuo. Il canone mensile per tenerlo online e curato è
          qui sotto, a parte, e si interrompe quando vuoi. Tempi di consegna: solitamente entro 1-2 settimane.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "22px",
            alignItems: "stretch",
          }}
        >
          {/* PIANO 1 */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e2dd",
              borderRadius: "20px",
              padding: "30px 28px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.14em", color: "#8a8f8a", marginBottom: "14px" }}>
              PIANO 1
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: "12px",
                minHeight: "58px",
              }}
            >
              Solo il Calcolatore Preventivi
            </div>
            <div
              style={{ fontSize: "15px", lineHeight: 1.5, color: "#6b6f6b", marginBottom: "24px", minHeight: "45px" }}
            >
              Hai già un sito? Aggiungo solo il preventivo automatico
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "28px", minHeight: "40px" }}>
              <div style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.03em" }}>{L.piano1_setup}€</div>
              <div style={{ fontSize: "15px", color: "#6b6f6b" }}>una tantum</div>
            </div>
            <div style={{ height: "1px", background: "#e6e6e1", marginBottom: "22px" }} />
            <div style={{ display: "grid", gap: "12px", alignContent: "start" }}>
              <div style={{ display: "flex", gap: "11px", fontSize: "15px", lineHeight: 1.5 }}>
                <span style={{ color: accent }}>✓</span>
                <span>Calcolatore Preventiva personalizzato</span>
              </div>
              <div style={{ display: "flex", gap: "11px", fontSize: "15px", lineHeight: 1.5 }}>
                <span style={{ color: accent }}>✓</span>
                <span>Installazione sul sito esistente</span>
              </div>
              <div style={{ display: "flex", gap: "11px", fontSize: "15px", lineHeight: 1.5 }}>
                <span style={{ color: accent }}>✓</span>
                <span>Aggiornamenti</span>
              </div>
            </div>
          </div>

          {/* PIANO 2 */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e2dd",
              borderRadius: "20px",
              padding: "30px 28px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.14em", color: "#8a8f8a", marginBottom: "14px" }}>
              PIANO 2
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: "12px",
                minHeight: "58px",
              }}
            >
              Sito Web + Calcolatore
            </div>
            <div
              style={{ fontSize: "15px", lineHeight: 1.5, color: "#6b6f6b", marginBottom: "24px", minHeight: "45px" }}
            >
              Vuoi un sito nuovo, con tutto incluso
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "28px", minHeight: "40px" }}>
              <div style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.03em" }}>{L.piano2_setup}€</div>
              <div style={{ fontSize: "15px", color: "#6b6f6b" }}>una tantum</div>
            </div>
            <div style={{ height: "1px", background: "#e6e6e1", marginBottom: "22px" }} />
            <div style={{ display: "grid", gap: "12px", marginBottom: "24px", alignContent: "start" }}>
              <div style={{ display: "flex", gap: "11px", fontSize: "15px", lineHeight: 1.5 }}>
                <span style={{ color: accent }}>✓</span>
                <span>Landing page con calcolatore Preventiva integrato</span>
              </div>
              <div style={{ display: "flex", gap: "11px", fontSize: "15px", lineHeight: 1.5 }}>
                <span style={{ color: accent }}>✓</span>
                <span>Il sito resta sempre online, me ne occupo io</span>
              </div>
              <div style={{ display: "flex", gap: "11px", fontSize: "15px", lineHeight: 1.5 }}>
                <span style={{ color: accent }}>✓</span>
                <span>Se c'è un problema o serve una modifica, ci penso io</span>
              </div>
            </div>
          </div>

          {/* PIANO 3 */}
          <div
            style={{
              background: "#fff",
              border: "2px solid " + accent,
              borderRadius: "20px",
              padding: "30px 28px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-15px",
                left: "24px",
                background: accent,
                color: "#fff",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                padding: "8px 16px",
                borderRadius: "999px",
              }}
            >
              CONSIGLIATO
            </div>
            <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.14em", color: "#8a8f8a", marginBottom: "14px" }}>
              PIANO 3
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: "12px",
                minHeight: "58px",
              }}
            >
              Sito Web + Farsi trovare su Google <span style={{ fontSize: "15px", color: accent }}>(SEO)</span>
            </div>
            <div
              style={{ fontSize: "15px", lineHeight: 1.5, color: "#6b6f6b", marginBottom: "24px", minHeight: "45px" }}
            >
              Come il Piano 2, ma ti troveranno <strong style={{ color: "#141614" }}>facilmente</strong> su Google
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "28px",
                minHeight: "40px",
              }}
            >
              <div style={{ fontSize: "22px", color: "#9a9e9a", textDecoration: "line-through" }}>
                {L.piano3_prezzo_pieno}€
              </div>
              <div style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.03em" }}>{L.piano3_setup}€</div>
              <div style={{ fontSize: "15px", color: "#6b6f6b" }}>una tantum</div>
            </div>
            <div style={{ height: "1px", background: "#e6e6e1", marginBottom: "22px" }} />
            <div style={{ display: "grid", gap: "12px", marginBottom: "24px", alignContent: "start" }}>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>Tutto quello del Piano 2, più:</div>
              <div style={{ display: "flex", gap: "11px", fontSize: "15px", lineHeight: 1.5 }}>
                <span style={{ color: accent }}>✓</span>
                <span>
                  <strong>SEO di base</strong>: preparo il sito da subito per comparire quando qualcuno cerca «pulizie»
                  nella tua zona su Google
                </span>
              </div>
            </div>
            <div
              style={{
                background: "#eaf4ee",
                borderRadius: "14px",
                padding: "20px",
                display: "flex",
                gap: "12px",
                marginTop: "auto",
              }}
            >
              <div style={{ color: accent, fontSize: "16px" }}>⌕</div>
              <div style={{ fontSize: "14px", lineHeight: 1.6, color: "#2f5c44" }}>
                Su Google circa 9 clic su 10 vanno ai risultati normali, non alle pubblicità: se lì non ci sei, quel
                cliente chiama un altro. Le pubblicità sono come affittare una vetrina, smetti di pagare e spariscono;
                questo lavoro invece resta tuo nel tempo. Risultato: richieste di preventivo che arrivano da sole, con
                continuità.
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "26px",
            background: "#eef0ef",
            border: "1px solid #e2e2dd",
            borderRadius: "16px",
            padding: "clamp(20px,3vw,30px)",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.14em", color: "#8a8f8a", marginBottom: "12px" }}>
            LAVORO CONTINUATIVO
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "8px" }}>
            Vogliamo continuare a lavorare insieme?
          </div>
          <p style={{ margin: "0 0 26px", fontSize: "15px", lineHeight: 1.6, color: "#6b6f6b", maxWidth: "68ch" }}>
            Una volta online, il sito va tenuto aggiornato e sicuro — non è un "metti e dimentica". Se vuoi che ci
            pensi io, è un canone mensile a parte, senza vincoli: lo fermi quando vuoi.
          </p>

          <div>
            {canoneRows.map((r) => (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "20px",
                  padding: "14px 0",
                  borderBottom: "1px solid #dcded9",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 260px", maxWidth: "48ch" }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "3px" }}>{r.label}</div>
                  <div style={{ fontSize: "13.5px", lineHeight: 1.55, color: "#6b6f6b" }}>{r.desc}</div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>
                    {r.plus ? "+" : ""}
                    {r.price}€
                  </span>
                  <span style={{ fontSize: "13px", color: "#6b6f6b" }}>/mese</span>
                </div>
              </div>
            ))}
          </div>

          <p style={{ margin: "18px 0 0", fontSize: "13px", lineHeight: 1.6, color: "#8a8f8a" }}>
            Pagine aggiuntive: {L.pagina_extra}€ a pagina.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "96px 28px 0" }}>
        <div
          style={{
            background: "#22262a",
            color: "#f4f4f2",
            borderRadius: "26px",
            padding: "clamp(24px,4vw,52px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: "clamp(24px,4vw,48px)",
            alignItems: "stretch",
          }}
        >
          <div>
            <img
              src="/assets/portait11.png"
              alt="Francesco Mancino"
              style={{
                width: "100%",
                height: "100%",
                minHeight: "320px",
                objectFit: "cover",
                borderRadius: "18px",
                display: "block",
                filter: "saturate(0.95)",
              }}
            />
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "12px", letterSpacing: "0.12em", color: "#8d938d", marginBottom: "16px" }}>
              03 — CHI SONO
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,3.4vw,38px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                margin: "0 0 16px",
              }}
            >
              Francesco Mancino
            </h2>
            <p
              style={{
                margin: "0 0 32px",
                fontSize: "16px",
                lineHeight: 1.65,
                color: "#c9cdc9",
                maxWidth: "52ch",
                textWrap: "pretty",
              }}
            >
              Sono Francesco Mancino, sviluppatore web e programmatore. In parole semplici: costruisco siti e piccoli
              strumenti su misura, curati e facili da usare, pensati per farti arrivare più richieste e meno telefonate a
              vuoto. Mi piace il lavoro fatto bene e spiegato in modo chiaro, senza tecnicismi. Se ti va, ne parliamo con
              calma, a presto!
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                gap: "22px 26px",
                marginBottom: "28px",
              }}
            >
              {metaTiles.map((t) => (
                <div key={t.label}>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      color: "#8d938d",
                      marginBottom: "6px",
                    }}
                  >
                    {t.label}
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 600 }}>{t.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gap: "10px", marginBottom: "30px" }}>
              {contactRows.map((row) => (
                <div key={row.label} style={{ display: "flex", gap: "14px", fontSize: "15px", alignItems: "baseline" }}>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      color: "#8d938d",
                      minWidth: "74px",
                    }}
                  >
                    {row.label}
                  </span>
                  {row.value}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Hover
                as="a"
                href="https://www.francescomancino.it/projects"
                target="_blank"
                rel="noopener"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: accent,
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 700,
                  padding: "14px 22px",
                  borderRadius: "999px",
                  border: "2px solid " + accent,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
                hoverStyle={{ background: "#22935c", borderColor: "#22935c" }}
              >
                Guarda i miei lavori
                <ArrowIcon />
              </Hover>

              {waHref && (
                <Hover
                  as="a"
                  href={waHref}
                  target="_blank"
                  rel="noopener"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "transparent",
                    color: "#f4f4f2",
                    fontSize: "15px",
                    fontWeight: 700,
                    padding: "14px 22px",
                    borderRadius: "999px",
                    border: "2px solid rgba(244,244,242,0.35)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                  hoverStyle={{ background: "rgba(244,244,242,0.08)", borderColor: "rgba(244,244,242,0.6)" }}
                >
                  Scrivimi su WhatsApp
                  <ArrowIcon />
                </Hover>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "44px 28px 64px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "18px",
            flexWrap: "wrap",
            fontSize: "14px",
            color: "#8a8f8a",
          }}
        >
          <div>Francesco Mancino · Roma, IT</div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <a href="mailto:mancinofrancesco91@gmail.com" style={{ color: "#6b6f6b", textDecoration: "none" }}>
              mancinofrancesco91@gmail.com
            </a>
            <a
              href="https://www.francescomancino.it"
              target="_blank"
              rel="noopener"
              style={{ color: "#6b6f6b", textDecoration: "none" }}
            >
              francescomancino.it
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
