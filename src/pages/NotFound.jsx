import Message from "../lib/Message.jsx";

export default function NotFound() {
  return (
    <Message
      label="404"
      title="Proposta non trovata"
      note="Controlla il link che hai ricevuto: dovrebbe avere un indirizzo del tipo /nome-azienda."
    />
  );
}
