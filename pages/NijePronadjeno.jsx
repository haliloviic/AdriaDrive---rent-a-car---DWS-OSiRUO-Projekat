import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

export default function NijePronadjeno({
  oznaka = "404 greška",
  naslov = "Stranica nije pronađena",
  poruka = "Ruta koju tražiš ne postoji ili je sadržaj uklonjen iz aplikacije.",
}) {
  return (
    <section className="not-found-section">
      <div className="glass-panel not-found-panel">
        <SearchX size={42} aria-hidden="true" />
        <span className="eyebrow">{oznaka}</span>
        <h1>{naslov}</h1>
        <p>{poruka}</p>
        <div className="not-found-actions">
          <Link className="btn btn-primary" to="/vozila">
            Pregled vozila
          </Link>
          <Link className="btn btn-ghost" to="/">
            Početna
          </Link>
        </div>
      </div>
    </section>
  );
}
