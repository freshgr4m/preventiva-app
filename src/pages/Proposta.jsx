import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Hover from "../lib/Hover.jsx";
import Message from "../lib/Message.jsx";
import { toGalleryUrls } from "../lib/gallery.js";
import useProposta from "../hooks/useProposta.js";

const MONO = "'JetBrains Mono',monospace";
const FALLBACK_ACCENT = "#1c7a4d";

export default function Proposta() {
  const { slug } = useParams();
  const { data, loading, error } = useProposta(slug);

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

  // Formula invariata: 45 + m² * base_servizio * moltiplicatore_frequenza, arrotondata ai 5€
  const raw = 45 + sqm * s.base * f.mult;
  const price = Math.round(raw / 5) * 5;
  const priceStr = price + "€";
  const priceUnit = f.unit;
  const priceNote =
    s.label +
    " · " +
    sqm +
    " m² · " +
    f.label.toLowerCase() +
    ". Il preventivo definitivo lo confermi tu.";
  const sqmLabel = sqm + " m²";

  const lbOpen = lb != null && gallery[lb];

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
            maxWidth: "16ch",
            textWrap: "pretty",
          }}
        >
          La tua proposta per <span style={{ color: accent }}>{companyName}</span>
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
              Come lo vedrebbe un tuo cliente dal telefono.
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
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
                <div style={{ fontSize: "44px", fontWeight: 800, letterSpacing: "-0.03em", color: "#14603c" }}>
                  {priceStr}
                </div>
                <div style={{ fontSize: "15px", color: "#4b7d61" }}>{priceUnit}</div>
              </div>
              <div style={{ fontSize: "13px", lineHeight: 1.55, color: "#4b7d61", marginBottom: "18px" }}>{priceNote}</div>
              <div style={{ height: "1px", background: "#d3e6da", marginBottom: "18px" }} />
              <div style={{ fontSize: "13px", lineHeight: 1.6, color: "#3f6b52" }}>
                Il cliente vede questo numero in due secondi, poi ti scrive già informato. Meno telefonate a vuoto.
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "26px" }}>
          <Hover
            as={Link}
            to={"/" + slug + "/mockup"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
              color: "#6b6f6b",
              textDecoration: "none",
              borderBottom: "1px solid #cfcfc9",
              paddingBottom: "3px",
            }}
            hoverStyle={{ color: accent, borderBottomColor: accent }}
          >
            Vedi altri dettagli e screenshot →
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
          Tre modi di partire. Nessun vincolo di durata: il mensile si può interrompere quando vuoi. Tempi di consegna:
          solitamente entro 1-2 settimane.
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
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px", minHeight: "40px" }}>
              <div style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.03em" }}>149€</div>
              <div style={{ fontSize: "15px", color: "#6b6f6b" }}>una tantum</div>
            </div>
            <div style={{ fontSize: "15px", color: "#141614", marginBottom: "24px" }}>
              + <strong>19€/mese</strong>
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
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px", minHeight: "40px" }}>
              <div style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.03em" }}>349€</div>
              <div style={{ fontSize: "15px", color: "#6b6f6b" }}>una tantum</div>
            </div>
            <div style={{ fontSize: "15px", color: "#141614", marginBottom: "24px" }}>
              + <strong>49€/mese</strong>
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
            <div style={{ fontFamily: MONO, fontSize: "13px", color: "#8a8f8a", marginTop: "auto" }}>
              Pagine aggiuntive: 80€ a pagina
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
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px", minHeight: "40px" }}>
              <div style={{ fontSize: "22px", color: "#9a9e9a", textDecoration: "line-through" }}>599€</div>
              <div style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.03em" }}>399€</div>
            </div>
            <div style={{ fontSize: "15px", color: "#6b6f6b", marginBottom: "24px" }}>
              una tantum + <strong style={{ color: "#141614" }}>49€/mese</strong>
            </div>
            <div style={{ height: "1px", background: "#e6e6e1", marginBottom: "22px" }} />
            <div style={{ display: "grid", gap: "12px", marginBottom: "24px", alignContent: "start" }}>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>Tutto quello del Piano 2, più:</div>
              <div style={{ display: "flex", gap: "11px", fontSize: "15px", lineHeight: 1.5 }}>
                <span style={{ color: accent }}>✓</span>
                <span>
                  <strong>Ottimizzazione SEO</strong>: il tuo sito compare quando qualcuno cerca «pulizie» nella tua zona
                  su Google
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
            alignItems: "start",
          }}
        >
          <div>
            <img
              src="/assets/portait11.png"
              alt="Francesco Mancino"
              style={{
                width: "100%",
                maxWidth: "340px",
                borderRadius: "18px",
                display: "block",
                filter: "saturate(0.95)",
              }}
            />
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "12px", letterSpacing: "0.12em", color: "#8d938d", marginBottom: "14px" }}>
              03 — CHI SONO
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,3.4vw,38px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                margin: "0 0 18px",
              }}
            >
              Francesco Mancino
            </h2>
            <p
              style={{
                margin: "0 0 30px",
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
                marginBottom: "32px",
              }}
            >
              <div>
                <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.1em", color: "#8d938d", marginBottom: "6px" }}>
                  RUOLO
                </div>
                <div style={{ fontSize: "15px", fontWeight: 600 }}>Sviluppatore web</div>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.1em", color: "#8d938d", marginBottom: "6px" }}>
                  SEDE
                </div>
                <div style={{ fontSize: "15px", fontWeight: 600 }}>Roma, IT · Remote</div>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.1em", color: "#8d938d", marginBottom: "6px" }}>
                  FOCUS
                </div>
                <div style={{ fontSize: "15px", fontWeight: 600 }}>Siti e strumenti su misura</div>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.1em", color: "#8d938d", marginBottom: "6px" }}>
                  DISPONIBILITÀ
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: 600 }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3fbd7c" }} />
                  Disponibile ora
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: "10px", marginBottom: "34px" }}>
              <div style={{ display: "flex", gap: "14px", fontSize: "15px", alignItems: "baseline" }}>
                <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.1em", color: "#8d938d", minWidth: "74px" }}>
                  EMAIL
                </span>
                <a
                  href="mailto:mancinofrancesco91@gmail.com"
                  style={{ color: "#f4f4f2", textDecoration: "none", borderBottom: "1px solid #4b5158", paddingBottom: "2px" }}
                >
                  mancinofrancesco91@gmail.com
                </a>
              </div>
              <div style={{ display: "flex", gap: "14px", fontSize: "15px", alignItems: "baseline" }}>
                <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.1em", color: "#8d938d", minWidth: "74px" }}>
                  GITHUB
                </span>
                <a
                  href="https://github.com/freshgr4m"
                  style={{ color: "#f4f4f2", textDecoration: "none", borderBottom: "1px solid #4b5158", paddingBottom: "2px" }}
                >
                  @freshgr4m
                </a>
              </div>
              <div style={{ display: "flex", gap: "14px", fontSize: "15px", alignItems: "baseline" }}>
                <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.1em", color: "#8d938d", minWidth: "74px" }}>
                  LINKEDIN
                </span>
                <a
                  href="https://www.linkedin.com/in/francesco-mancino-dev"
                  style={{ color: "#f4f4f2", textDecoration: "none", borderBottom: "1px solid #4b5158", paddingBottom: "2px" }}
                >
                  in/francesco-mancino-dev
                </a>
              </div>
            </div>

            <Hover
              as="a"
              href="https://www.francescomancino.it"
              target="_blank"
              rel="noopener"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: accent,
                color: "#fff",
                fontSize: "17px",
                fontWeight: 700,
                padding: "18px 30px",
                borderRadius: "999px",
                textDecoration: "none",
              }}
              hoverStyle={{ background: "#22935c" }}
            >
              Guarda i miei lavori →
            </Hover>
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
