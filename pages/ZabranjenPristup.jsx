import { Link } from "react-router-dom";
import { LockKeyhole } from "lucide-react";

export default function ZabranjenPristup() {
  return (
    <section className="not-found-section">
      <div className="glass-panel not-found-panel">
        <LockKeyhole size={38} aria-hidden="true" />
        <span className="eyebrow">403 pristup</span>
        <h1>Ova ruta je zaštićena</h1>
        <p>Admin panel je dostupan samo korisnicima sa Admin ulogom.</p>
        <Link className="btn btn-primary" to="/vozila">
          Nazad na vozila
        </Link>
      </div>
    </section>
  );
}
