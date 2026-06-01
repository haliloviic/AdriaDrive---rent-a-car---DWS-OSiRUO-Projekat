import { Link } from "react-router-dom";
import { CarFront, Mail, MapPin, Phone } from "lucide-react";
import { useAutentikacija } from "../context/KontekstAutentikacije.jsx";

export default function Podnozje() {
  const { adminJe } = useAutentikacija();

  return (
    <footer className="footer">
      <div className="content-shell footer-grid">
        <div>
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark">
              <CarFront size={22} aria-hidden="true" />
            </span>
            <span>AdriaDrive</span>
          </Link>
          <p>
            Pregled flote, rezervacije vozila i komunikacija sa administracijom.
          </p>
        </div>

        <div className="footer-links">
          <Link to="/vozila">Vozila</Link>
          {!adminJe && <Link to="/rezervacije">Rezervacija</Link>}
          <Link to="/o-nama">O nama</Link>
          <Link to="/kontakt">Kontakt</Link>
        </div>

        <div className="kontakt-podnozja">
          <span>
            <MapPin size={16} aria-hidden="true" />
            Sarajevo, BiH
          </span>
          <span>
            <Phone size={16} aria-hidden="true" />
            +387 33 555 800
          </span>
          <span>
            <Mail size={16} aria-hidden="true" />
            info@adriadrive.ba
          </span>
        </div>
      </div>
    </footer>
  );
}
