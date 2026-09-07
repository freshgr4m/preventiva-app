const MONO = "'JetBrains Mono',monospace";

/**
 * Schermata centrata a tutto viewport per gli stati "caricamento" / "non trovata".
 */
export default function Message({ label, title, note }) {
  return (
    <div
      style={{
        background: "#f4f4f2",
        color: "#141614",
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(24px,6vw,72px)",
      }}
    >
      <div style={{ maxWidth: "42ch", textAlign: "center" }}>
        {label && (
          <div
            style={{
              fontFamily: MONO,
              fontSize: "12px",
              letterSpacing: "0.12em",
              color: "#8a8f8a",
              marginBottom: "14px",
            }}
          >
            {label}
          </div>
        )}
        <div
          style={{
            fontSize: "clamp(20px,3vw,26px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
            marginBottom: note ? "12px" : 0,
          }}
        >
          {title}
        </div>
        {note && (
          <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.6, color: "#6b6f6b" }}>{note}</p>
        )}
      </div>
    </div>
  );
}
