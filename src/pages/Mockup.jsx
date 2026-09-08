import { Link, useParams } from "react-router-dom";
import Hover from "../lib/Hover.jsx";
import Message from "../lib/Message.jsx";
import { toGalleryUrls } from "../lib/gallery.js";
import useProposta from "../hooks/useProposta.js";

const MONO = "'JetBrains Mono',monospace";

const steps = [
  {
    n: "01",
    title: "Il cliente sceglie",
    note: "Tipo di servizio, metri quadri, frequenza. Tre tocchi, niente moduli lunghi da compilare.",
  },
  {
    n: "02",
    title: "Vede subito una cifra",
    note: "Il preventivo indicativo appare mentre sceglie. È il tuo listino, con le tue regole: lo imposti tu una volta.",
  },
  {
    n: "03",
    title: "Ti scrive già informato",
    note: "La richiesta ti arriva con servizio, misure e cifra vista. Chi non è nel tuo budget si ferma prima di chiamarti.",
  },
];

export default function Mockup() {
  const { slug } = useParams();
  const { data, loading, error } = useProposta(slug);

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

  const problemLine = data.problem_line || "";
  const gallery = toGalleryUrls(data.gallery);
  const propostaHref = "/" + slug;

  return (
    <div style={{ background: "#f4f4f2", color: "#141614", minHeight: "100%" }}>
      <div style={{ height: "10px", background: "#22262a" }} />

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "44px 28px 0" }}>
        <Link
          to={propostaHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            color: "#6b6f6b",
            textDecoration: "none",
            marginBottom: "34px",
          }}
        >
          ← Torna alla proposta
        </Link>
        <div style={{ fontFamily: MONO, fontSize: "12px", letterSpacing: "0.12em", color: "#8a8f8a", marginBottom: "14px" }}>
          APPROFONDIMENTO
        </div>
        <h1
          style={{
            fontSize: "clamp(34px,5vw,56px)",
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            margin: "0 0 18px",
            maxWidth: "24ch",
            textWrap: "pretty",
          }}
        >
          Ecco come potrebbe apparire
        </h1>
        <p style={{ margin: 0, fontSize: "17px", lineHeight: 1.6, color: "#6b6f6b", maxWidth: "64ch" }}>
          {problemLine
            ? problemLine
            : "Tutti gli schermi, più una spiegazione di come funziona il calcolatore e perché cambia il modo in cui arrivano le richieste."}
        </p>
      </div>

      {gallery.length > 0 && (
        <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "60px 28px 0" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: "18px",
            }}
          >
            {gallery.map((src, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e2e2dd", borderRadius: "16px", padding: "14px" }}>
                <div
                  style={{
                    background: "#f4f4f2",
                    border: "1px solid #ececea",
                    borderRadius: "10px",
                    overflow: "hidden",
                    marginBottom: "12px",
                  }}
                >
                  <img
                    src={src}
                    alt={"Schermata " + (i + 1)}
                    style={{ display: "block", width: "100%", aspectRatio: "4/3", objectFit: "cover" }}
                  />
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>{"Schermata " + (i + 1)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "40px 28px 0" }}>
        <div
          style={{
            background: "#eef0ef",
            border: "1px solid #e2e2dd",
            borderRadius: "16px",
            padding: "clamp(20px,3vw,30px)",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.14em", color: "#8a8f8a", marginBottom: "12px" }}>
            NOTA
          </div>
          <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.6, color: "#6b6f6b", maxWidth: "72ch" }}>
            Le foto che vedi qui sono immagini generiche di repertorio, non tue. Alcuni testi invece potrebbero essere
            ripresi dal tuo sito attuale, dove mi sembravano adatti. Serve solo a farti vedere l'idea: ogni testo, foto
            e colore si può cambiare, e lo sistemiamo insieme prima di pubblicare.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "88px 28px 0" }}>
        <div style={{ fontFamily: MONO, fontSize: "12px", letterSpacing: "0.12em", color: "#8a8f8a", marginBottom: "14px" }}>
          COME FUNZIONA
        </div>
        <h2
          style={{
            fontSize: "clamp(26px,3.4vw,38px)",
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            margin: "0 0 40px",
            maxWidth: "26ch",
          }}
        >
          Il calcolatore, passo per passo
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: "20px",
          }}
        >
          {steps.map((step) => (
            <div
              key={step.n}
              style={{ background: "#fff", border: "1px solid #e2e2dd", borderRadius: "18px", padding: "28px" }}
            >
              <div style={{ fontFamily: MONO, fontSize: "12px", color: "#1c7a4d", marginBottom: "14px" }}>{step.n}</div>
              <div style={{ fontSize: "19px", fontWeight: 700, letterSpacing: "-0.015em", marginBottom: "10px" }}>
                {step.title}
              </div>
              <div style={{ fontSize: "15px", lineHeight: 1.6, color: "#6b6f6b" }}>{step.note}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#22262a",
            color: "#f4f4f2",
            borderRadius: "22px",
            padding: "clamp(24px,4vw,44px)",
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: "32px",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.12em", color: "#8d938d", marginBottom: "12px" }}>
              PERCHÉ CONTA
            </div>
            <div
              style={{
                fontSize: "clamp(20px,2.6vw,26px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
                textWrap: "pretty",
              }}
            >
              Il prezzo è la prima domanda di chiunque. Se la risposta arriva sul sito, la conversazione parte dal lavoro
              e non dalla trattativa.
            </div>
          </div>
          <div style={{ display: "grid", gap: "16px" }}>
            <div style={{ display: "flex", gap: "12px", fontSize: "15px", lineHeight: 1.6, color: "#c9cdc9" }}>
              <span style={{ color: "#3fbd7c" }}>✓</span>
              <span>Meno telefonate solo per chiedere quanto costa</span>
            </div>
            <div style={{ display: "flex", gap: "12px", fontSize: "15px", lineHeight: 1.6, color: "#c9cdc9" }}>
              <span style={{ color: "#3fbd7c" }}>✓</span>
              <span>Richieste più qualificate, già in linea col tuo listino</span>
            </div>
            <div style={{ display: "flex", gap: "12px", fontSize: "15px", lineHeight: 1.6, color: "#c9cdc9" }}>
              <span style={{ color: "#3fbd7c" }}>✓</span>
              <span>Funziona di notte e nel weekend, quando tu non rispondi</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "72px 28px 72px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
            borderTop: "1px solid #e2e2dd",
            paddingTop: "34px",
          }}
        >
          <div style={{ fontSize: "16px", color: "#6b6f6b" }}>Vuoi tornare ai piani e ai prezzi?</div>
          <Hover
            as={Link}
            to={propostaHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "#1c7a4d",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 700,
              padding: "16px 26px",
              borderRadius: "999px",
              textDecoration: "none",
            }}
            hoverStyle={{ background: "#22935c" }}
          >
            Torna alla proposta →
          </Hover>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "18px",
            flexWrap: "wrap",
            fontSize: "14px",
            color: "#8a8f8a",
            marginTop: "34px",
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
